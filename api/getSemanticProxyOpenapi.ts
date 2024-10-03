import { getSemanticOpenapi } from "../src/getSemanticOpenapi.js";
import { fetchOpenapi } from "../src/fetchOpenapi.js";
import {
  OpenapiDocument,
  OpenapiOperationObject,
  OpenapiPathsObject,
  OpenapiSchemaObject,
} from "../src/openapi-types.js";

/** Builds up the simplified openapi from any openapi */
export const GET = async (request: Request) => {
  const openapiUrl = new URL(request.url).searchParams.get("openapiUrl");
  if (!openapiUrl) {
    return new Response("Please provide an URL", { status: 422 });
  }

  const openapi = await fetchOpenapi(openapiUrl);
  if (!openapi) {
    return new Response("OpenAPI Not Found", { status: 404 });
  }
  const semantic = await getSemanticOpenapi(openapi, openapiUrl);

  if (!semantic) {
    return new Response("Could not find semantic", { status: 500 });
  }

  const paths = Object.keys(semantic.properties).reduce(
    (paths, operationId) => {
      const item = semantic.properties[operationId].properties;

      return {
        ...paths,
        [`/${operationId}`]: {
          post: {
            summary: item?.summary?.default as string | undefined,
            externalDocs: item?.externalDocs?.default as any,
            tags: item?.tags?.default as string[] | undefined,
            operationId,
            requestBody: item?.input
              ? {
                  content: {
                    "application/json": {
                      schema: item.input as unknown as OpenapiSchemaObject,
                    },
                  },
                }
              : undefined,
            responses: {
              "200": {
                description: "Response",
                content: {
                  "application/json": {
                    schema: item?.output as unknown as OpenapiSchemaObject,
                  },
                },
              },
            },
          } satisfies OpenapiOperationObject,
        },
      };
    },
    {} as OpenapiPathsObject,
  );

  const openapiFromSemantic: OpenapiDocument = {
    info: { title: "", version: "1.0.0" },
    openapi: "3.1.0",
    paths,
    security: [{ oauth2: [] }],
    components: {
      securitySchemes: {
        oauth2: {
          type: "oauth2",
          flows: {
            authorizationCode: {
              authorizationUrl: "",
              tokenUrl: "",
              scopes: {},
            },
          },
        },
      },
      schemas: semantic?.definitions,
    },
  };

  return new Response(JSON.stringify(openapiFromSemantic, undefined, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
