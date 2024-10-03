import { mergeObjectsArray, notEmpty } from "edge-util";
import { createClientCode } from "./createClientCode.js";
import { generateTypescriptSdkFile } from "./generateTypescriptSdkFileOld.js";
import { getClientScript } from "./getClientScript.js";
import { fetchOpenapi } from "../fetchOpenapi.js";
import { OpenapiDocument } from "../openapi-types.js";
import { pruneOpenapi } from "../pruneOpenapi.js";
import { getSemanticOpenapi } from "../getSemanticOpenapi.js";

type GenerateSdkContext = {
  useJsImportSuffix?: boolean;
  openapis: {
    /** Used as prefix for the operation (e.g. `sdk.userCrud.create`) */
    slug: string;
    envKeyName?: string;
    /** If given, will only put this subset in the SDK */
    operationIds?: string[];
    openapiUrl?: string;
    openapiObject?: OpenapiDocument;
  }[];
};

export const generateTypescriptSdk = async (context: GenerateSdkContext) => {
  const { openapis, useJsImportSuffix } = context;
  const sdks = (
    await Promise.all(
      openapis.map(async (item) => {
        const { openapiUrl, slug, envKeyName, operationIds, openapiObject } =
          item;

        const isUrl = openapiUrl ? URL.canParse(openapiUrl) : false;
        const firstOpenapiObject = isUrl
          ? await fetchOpenapi(openapiUrl)
          : openapiObject;

        const finalOpenapiObject =
          operationIds && operationIds.length > 0 && firstOpenapiObject
            ? await pruneOpenapi(firstOpenapiObject, operationIds)
            : firstOpenapiObject;

        if (!finalOpenapiObject) {
          console.log("no object for ", {
            slug,
            operationIds,
            openapiUrl,
            isUrl,
            first: !!firstOpenapiObject,
            final: !!finalOpenapiObject,
          });
          return;
        }
        const semanticOpenapi = await getSemanticOpenapi(finalOpenapiObject);

        const { code, baseUrl } = await generateTypescriptSdkFile({
          openapiObject: finalOpenapiObject,
          openapiUrl,
        });

        if (!code) {
          console.log("no code for ", slug);

          return;
        }

        if (!baseUrl) {
          console.log("no baseUrl for", slug);
          return;
        }

        return { code, baseUrl, slug, envKeyName };
      }),
    )
  ).filter(notEmpty);

  const clientScript = getClientScript(
    sdks.map(({ code, ...rest }) => rest),
    useJsImportSuffix,
  );

  const sdkFiles = mergeObjectsArray(
    sdks.map((item) => ({ [`${item.slug}.ts`]: item.code })),
  );

  const files: { [filePath: string]: string } = {
    ["client.ts"]: clientScript,
    [`createClient.ts`]: createClientCode,
    ...sdkFiles,
  };

  return { files };
};
