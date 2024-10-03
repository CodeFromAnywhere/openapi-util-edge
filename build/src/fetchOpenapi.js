import { fetchWithTimeout } from "edge-util";
const openapis = {};
/** Fetches openapi but with cache */
export const fetchOpenapi = async (openapiUrl) => {
    if (!openapiUrl) {
        return;
    }
    if (openapis[openapiUrl]) {
        // NB: cached in memory
        return openapis[openapiUrl];
    }
    const isYaml = openapiUrl.endsWith(".yaml");
    const { json, status, statusText, text } = await fetchWithTimeout(openapiUrl, {
        headers: isYaml
            ? undefined
            : {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
    }, 30000);
    if (json) {
        // NB: set cache
        openapis[openapiUrl] = json;
    }
    if (!json) {
        console.log("failed fetching openapi", { status, statusText });
    }
    return json || undefined;
};
//# sourceMappingURL=fetchOpenapi.js.map