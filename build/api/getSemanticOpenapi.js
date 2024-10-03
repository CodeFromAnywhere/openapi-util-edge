import { fetchOpenapi } from "../src/fetchOpenapi.js";
import { getSemanticOpenapi } from "../src/getSemanticOpenapi.js";
import { pruneOpenapi } from "../src/pruneOpenapi.js";
export const GET = async (request) => {
    // NB: the replace and endsWith("=") here is to fix some weird behavior happening in vercel and/or vscode
    const decodedUrl = request.url.replaceAll("%3D", "=").replaceAll("%26", "&");
    const url = new URL(decodedUrl);
    const openapiUrl1 = url.searchParams.get("openapiUrl");
    const openapiUrl = openapiUrl1?.endsWith("=")
        ? openapiUrl1.slice(0, openapiUrl1.length - 1)
        : openapiUrl1;
    const operationIds = url.searchParams
        .get("operationIds")
        ?.split(",")
        .map((x) => x.trim());
    if (!openapiUrl) {
        return new Response("Please provide an openapiUrl as pathname without the protocol", {
            status: 422,
        });
    }
    const openapi = await fetchOpenapi(openapiUrl);
    if (!openapi || !openapi.paths) {
        return new Response("Could not retrieve OpenAPI", { status: 404 });
    }
    const bundled = await pruneOpenapi(openapi, operationIds, false);
    if (!bundled || !bundled.paths) {
        return new Response("Could not bundle OpenAPI", { status: 404 });
    }
    const semanticOpenapiSchema = getSemanticOpenapi(bundled, openapiUrl, operationIds);
    return new Response(JSON.stringify(semanticOpenapiSchema, undefined, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
//# sourceMappingURL=getSemanticOpenapi.js.map