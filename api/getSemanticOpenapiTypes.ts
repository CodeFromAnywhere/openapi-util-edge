import { compile } from "json-schema-to-typescript";
import { getSemanticOpenapi } from "../src/getSemanticOpenapi.js";
import { fetchOpenapi } from "../src/fetchOpenapi.js";

export const GET = async (request: Request) => {
  const openapiUrl = new URL(request.url).searchParams.get("openapiUrl");
  const name = new URL(request.url).searchParams.get("name");
  const operationIds = new URL(request.url).searchParams
    .get("operationIds")
    ?.split(",")
    .map((x) => x.trim());

  if (!openapiUrl) {
    return new Response("Please provide an openapiUrl as a query-parameter", {
      status: 422,
    });
  }
  const openapi = await fetchOpenapi(openapiUrl);

  if (!openapi || !openapi.paths || !openapiUrl) {
    return new Response("Could not retrieve OpenAPI", { status: 404 });
  }

  try {
    const jsonSchema = getSemanticOpenapi(openapi, openapiUrl, operationIds);

    const typescriptFileString = await compile(
      jsonSchema as any,
      name || "SdkClient",
    );

    return new Response(typescriptFileString, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (e: any) {
    console.log(e);
    return new Response(
      `Could not fetch schema: ${e.code} = ${e.name} (${e.message})`,
      { status: 404 },
    );
  }
};
