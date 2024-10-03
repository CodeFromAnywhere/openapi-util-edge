import { fetchOpenapi } from "../src/fetchOpenapi.js";
import { summarizeOpenapi } from "../src/summarizeOpenapi.js";
/**
Serverless function to get all operationId/summary pairs for any openapi in text or json
*/
export const GET = async (request) => {
    const url = new URL(request.url);
    const isJson = request.headers.get("Accept") === "application/json";
    const openapiUrl = url.searchParams.get("openapiUrl");
    const openapi = await fetchOpenapi(openapiUrl || undefined);
    if (!openapi) {
        return new Response("No openapi", { status: 404 });
    }
    const summary = await summarizeOpenapi(openapi, openapiUrl, isJson);
    if (!isJson && typeof summary === "string") {
        return new Response(summary);
    }
    return new Response(JSON.stringify(summary), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
};
//# sourceMappingURL=summarizeOpenapi.js.map