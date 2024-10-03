import { generateTypescriptSdk } from "../src/codegen/generateTypescriptSdk.js";
export const POST = async (request) => {
    try {
        const body = await request.json();
        if (Array.isArray(body.openapis) &&
            !!body.openapis.find((x) => !x.openapiUrl.startsWith("https://"))) {
            //invalid openapi url found
            return new Response("all openapiUrls need to be valid urls", {
                status: 400,
            });
        }
        // Via endpoint and get a single typesafe SDK client back
        const response = await generateTypescriptSdk(body);
        return new Response(JSON.stringify(response), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    }
    catch (e) {
        console.error(e);
        return new Response(e.message, { status: 400 });
    }
};
//# sourceMappingURL=generateSdk.js.map