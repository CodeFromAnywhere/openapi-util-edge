import { getOperationRequestInit } from "../src/codegen/api.js";
import { fetchOpenapi } from "../src/fetchOpenapi.js";
export const POST = async (request) => {
    try {
        // Parse the JSON body from the request
        const body = await request.json();
        // Extract the necessary data from the body
        const { openapiUrl, operationId, access_token, data } = body;
        const openapi = await fetchOpenapi(openapiUrl);
        if (!openapi || !openapiUrl) {
            return new Response("Invalid params", { status: 422 });
        }
        // Call the getOperationRequestInit function
        const requestInit = getOperationRequestInit({
            openapi,
            openapiUrl,
            operationId,
            access_token,
            data,
        });
        if (!requestInit) {
            return new Response("No init found", { status: 400 });
        }
        // You can now use requestInit for further processing
        // For this example, we'll just return it as JSON
        return new Response(JSON.stringify(requestInit), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    }
    catch (error) {
        console.error("Error in POST endpoint:", error);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            headers: { "Content-Type": "application/json" },
            status: 500,
        });
    }
};
//# sourceMappingURL=getOperationRequestInit.js.map