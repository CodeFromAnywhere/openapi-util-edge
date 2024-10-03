import { pruneOpenapi } from "../src/pruneOpenapi.js";
import { fetchOpenapi } from "../src/fetchOpenapi.js";
/**
 * Serverless function to get a simplified openapi that is dereferenced and only contains the operationIds you care about.
 */
export const GET = async (request) => {
    const url = new URL(request.url);
    const openapiUrl = url.searchParams.get("openapiUrl");
    const operationIds = url.searchParams.get("operationIds")?.split(",");
    const shouldDereference = url.searchParams.get("dereference") === "true";
    if (!openapiUrl) {
        return new Response("No OpenAPI Url provided", { status: 422 });
    }
    const openapi = await fetchOpenapi(openapiUrl);
    if (!openapi) {
        return new Response("Couldn't find openapi", { status: 404 });
    }
    const newOpenapiJson = await pruneOpenapi(openapi, operationIds, shouldDereference);
    if (!newOpenapiJson) {
        return new Response("Couldn't prune openapi", { status: 404 });
    }
    // const decircularized = inspect(newOpenapiJson);
    const jsonString = JSON.stringify(newOpenapiJson, undefined, 2);
    return new Response(jsonString, {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
};
//# sourceMappingURL=pruneOpenapi.js.map