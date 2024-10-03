import { pruneOpenapi } from "../src/pruneOpenapi.js";
import openapi from "../src/openapi.json" assert { type: "json" };
const isDev = process.env.__VERCEL_DEV_RUNNING === "1";
export const GET = async (request) => {
    const operationIds = new URL(request.url).searchParams
        .get("operationIds")
        ?.split(",")
        .map((x) => x.trim());
    const pruned = operationIds
        ? await pruneOpenapi(openapi, operationIds)
        : openapi;
    const finalOpenapi = {
        ...pruned,
        servers: isDev ? [{ url: "http://localhost:3000" }] : openapi.servers,
    };
    return new Response(JSON.stringify(finalOpenapi, undefined, 2), {
        headers: { "Content-Type": "application/json" },
    });
};
//# sourceMappingURL=openapi.json.js.map