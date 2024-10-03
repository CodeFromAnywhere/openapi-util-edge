import openapiTS, { astToString } from "openapi-typescript";
import {
  OpenapiDocument,
  OpenapiOperationObject,
  OpenapiPathItemObject,
} from "../openapi-types.js";

const httpMethods = [
  "post",
  "get",
  "put",
  "patch",
  "delete",
  "options",
  "head",
  "trace",
] as const;
type HttpMethod = (typeof httpMethods)[number];

/**
 * Create my own codegen function wrapping `typescript-openapi` and make it accessible as api
 */
export const generateTypescriptSdkFile = async (context: {
  openapiObject: OpenapiDocument;
  openapiUrl?: string;
}) => {
  const { openapiObject, openapiUrl } = context;

  const schemaKeys = openapiObject.components?.schemas
    ? Object.keys(openapiObject.components.schemas)
    : undefined;

  const ast = await openapiTS(openapiObject as any, {});
  const contents = astToString(ast);

  const pathKeys = openapiObject?.paths ? Object.keys(openapiObject.paths) : [];
  const operationIds = pathKeys
    .map((path) => {
      const methods = !!openapiObject?.paths?.[path]
        ? Object.keys(openapiObject.paths[path]!).filter((method) =>
            ([...httpMethods] as string[]).includes(method),
          )
        : [];

      const operationIds = methods.map((method) => {
        // 1) Get the operation Id
        const pathItemObject = openapiObject?.paths?.[path] as
          | OpenapiPathItemObject
          | undefined;
        const operationObject = pathItemObject?.[method as HttpMethod] as
          | OpenapiOperationObject
          | undefined;
        // NB: will use method:path if no operationId is present
        const operationId = operationObject?.operationId || `${method}:${path}`;

        return { path, method, operationId };
      });
      return operationIds;
    })
    .flat();

  const operationUrlObject = operationIds
    .map(({ method, operationId, path }) => ({
      [operationId]: { method, path },
    }))
    .reduce((previous, current) => {
      return { ...previous, ...current };
    }, {});

  // console.log({ operationUrlObject });
  const exportTypesString =
    schemaKeys
      ?.map((key) => {
        return `export type ${key} = components["schemas"]["${key}"]`;
      })
      .join("\n") || "";

  const code = `${contents}
  
${exportTypesString}

export const operationUrlObject = ${JSON.stringify(
    operationUrlObject,
    undefined,
    2,
  )}
export const operationKeys = Object.keys(operationUrlObject);`;

  const openapiUrlBase = openapiUrl ? new URL(openapiUrl).origin : undefined;
  const baseUrl = openapiObject.servers?.[0]?.url || openapiUrlBase;

  return { isSuccessful: true, message: "Made script", code, baseUrl };
};
