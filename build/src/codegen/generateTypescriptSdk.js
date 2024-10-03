import { camelCase, notEmpty, pascalCase } from "edge-util";
import { compile } from "json-schema-to-typescript";
import { fetchOpenapi } from "../fetchOpenapi.js";
import { pruneOpenapi } from "../pruneOpenapi.js";
import { getSemanticOpenapi } from "../getSemanticOpenapi.js";
import { mergeObjectsArray } from "./api.js";
export const generateTypescriptSdk = async (context) => {
    const { openapis, useJsImportSuffix } = context;
    const sdks = (await Promise.all(openapis.map(async (item) => {
        const { openapiUrl, slug, envKeyName, operationIds, openapiObject } = item;
        const firstOpenapiObject = openapiObject || (await fetchOpenapi(openapiUrl));
        if (!firstOpenapiObject?.paths) {
            console.log("INVALIDOPENAPI Retrieved", {
                info: openapiObject ? "object of " + slug : openapiUrl,
            });
            return;
        }
        const bundledOpenapiObject = operationIds && operationIds.length > 0 && firstOpenapiObject
            ? await pruneOpenapi(firstOpenapiObject, operationIds, false)
            : firstOpenapiObject;
        if (!bundledOpenapiObject || !bundledOpenapiObject.paths) {
            console.log("Invalid object for ", {
                slug,
                operationIds,
                openapiUrl,
                first: !!firstOpenapiObject,
                final: !!bundledOpenapiObject,
            });
            return;
        }
        const semanticOpenapiSchema = getSemanticOpenapi(bundledOpenapiObject, openapiUrl, operationIds);
        if (!semanticOpenapiSchema) {
            console.log(`for ${slug} semanticOpenapiSchema wasn't craeted`);
            return;
        }
        const typeCode = await compile(semanticOpenapiSchema, slug);
        const clientName = camelCase(item.slug);
        const createClientCode = `
export const ${camelCase(slug + "_openapi")} = ${JSON.stringify(bundledOpenapiObject, undefined, 2)} as unknown as OpenapiDocument;

export const ${clientName} =  createClient<${pascalCase(slug)}>(${camelCase(slug + "_openapi")},"${openapiUrl}",{access_token: process.env.${envKeyName}})
`;
        const importCode = `import { ${clientName} } from "./${item.slug}${useJsImportSuffix ? ".js" : ""}";`;
        return {
            clientName,
            importCode,
            typeCode,
            createClientCode,
            slug,
            envKeyName,
        };
    }))).filter(notEmpty);
    // /**
    //  * Merge all semantic openapi schemas into one
    //  *
    //  * NB: Assumes operationIds and definition names are unique across APIs. Can later be improved.
    //  */
    // const combinedSemanticOpenapi = sdks
    //   .slice(1)
    //   .map((x) => x.semanticOpenapiSchema)
    //   .reduce((previous, current) => {
    //     return {
    //       ...previous,
    //       required: previous.required.concat(current.required),
    //       definitions: { ...previous.definitions, ...current.definitions },
    //       properties: { ...previous.properties, ...current.properties },
    //     };
    //   }, sdks[0].semanticOpenapiSchema);
    const apiSrc = await fetch("https://openapi-util.actionschema.com/src/api.ts").then((res) => res.text());
    const sdkFiles = mergeObjectsArray(sdks.map((item) => ({
        [`${item.slug}.ts`]: `import { createClient, OpenapiDocument } from "./api-helpers${useJsImportSuffix ? ".js" : ""}";
    
${item.typeCode}
    
${item.createClientCode}`,
    })));
    const clientSrc = sdks
        .map((item) => {
        return item.importCode;
    })
        .join("\n")
        .concat(`\n\nexport const client = { ${sdks.map((x) => x.clientName).join(", ")} };`);
    const files = {
        ["api-helpers.ts"]: apiSrc,
        ["client.ts"]: clientSrc,
        ...sdkFiles,
    };
    return { files };
};
//# sourceMappingURL=generateTypescriptSdk.js.map