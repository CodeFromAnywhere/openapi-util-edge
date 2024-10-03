import { fetchOpenapi } from "../fetchOpenapi";
import { getSemanticOpenapi } from "../getSemanticOpenapi";
import { getOperations } from "./api";

const openapiUrl = "https://auth.actionschema.com/openapi.json";
const operationIds = ["exchangeCode"];
const test = async () => {
  const openapi = await fetchOpenapi(openapiUrl);

  if (!openapi || !openapi.paths) {
    return new Response("Could not retrieve OpenAPI", { status: 404 });
  }
  const parsedOperations = getOperations(
    openapi,
    openapiUrl,
    openapiUrl,
    operationIds,
  );

  console.dir({ parsedOperations }, { depth: 8 });

  const semanticOpenapiSchema = await getSemanticOpenapi(
    openapi,
    openapiUrl,
    operationIds,
  );
};

test();
