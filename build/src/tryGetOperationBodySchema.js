import { resolveReferenceBrowser } from "./resolveReferenceBrowser.js";
export const tryGetOperationBodySchema = async (openapi, operation, documentLocation) => {
    if (!operation.requestBody) {
        return;
    }
    try {
        const requestBody = await resolveReferenceBrowser(operation.requestBody, openapi, documentLocation);
        const schemaOrReference = requestBody?.content?.["application/json"]
            ?.schema;
        const schema = await resolveReferenceBrowser(schemaOrReference, openapi, documentLocation);
        return schema;
    }
    catch (e) {
        console.log("tryGetOperationBodySchema", e);
        return;
    }
};
//# sourceMappingURL=tryGetOperationBodySchema.js.map