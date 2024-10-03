import { jsonPost } from "edge-util";
import { mergeOpenapis } from "../src/mergeOpenapis.js";
export const POST = jsonPost(mergeOpenapis);
export const GET = async (request) => {
    const urls = new URL(request.url).searchParams.getAll("url");
    const merged = await mergeOpenapis({
        openapiList: urls.map((url) => ({
            openapiUrl: url,
            operationIds: new URL(url).searchParams
                .get("operationIds")
                ?.split(",")
                .map((x) => x.trim()),
        })),
    });
    if (!merged) {
        return new Response("Could not find openapis", { status: 404 });
    }
    return new Response(JSON.stringify(merged, undefined, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
//# sourceMappingURL=mergeOpenapis.js.map