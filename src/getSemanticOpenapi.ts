import { mergeObjectsArray, notEmpty, O } from "edge-util";
import { JSONSchema7 } from "json-schema";
import {
  findRefs,
  getOperations,
  ParsedOperation,
  renameRefs,
} from "./codegen/api.js";
import { OpenapiDocument } from "./openapi-types.js";
import { SemanticOpenapi, SemanticOperationSchema } from "./types.js";

export const parsedOperationToSemanticOperationSchema = (
  parsedOperation: ParsedOperation,
) => {
  const {
    mergedInputSchema,
    mergedOutputSchema,
    operationId,
    operation,
    definitions,
    openapiUrl,
  } = parsedOperation;
  const { tags, externalDocs, description, summary } = operation;

  const inputSchema = renameRefs(mergedInputSchema, "jsonschema");
  const outputSchema = renameRefs(mergedOutputSchema, "jsonschema");

  const fullDescription = `${
    tags && tags.length > 0
      ? `Tags: ${tags.join(",")}
      
`
      : ""
  }${externalDocs ? (externalDocs.url + externalDocs.description ? ` (${externalDocs.description || ""})` + "\n\n" : "") : ""}${description || ""}`;

  const jsonSchema: SemanticOperationSchema = {
    type: "object",
    description: fullDescription || undefined,
    additionalProperties: false,
    required: [
      "openapiUrl",
      "operationId",
      inputSchema ? "input" : undefined,
      outputSchema ? "output" : undefined,
    ].filter(notEmpty),
    properties: {
      description: description
        ? { type: "string", enum: [description], default: description }
        : undefined,
      externalDocs: externalDocs as any,
      openapiUrl: { type: "string", enum: [openapiUrl], default: openapiUrl },
      operationId: {
        type: "string",
        enum: [operationId],
        default: operationId,
      },
      summary: summary
        ? { type: "string", enum: [summary], default: summary }
        : undefined,
      tags: tags
        ? { type: "array", items: { type: "string" }, default: tags }
        : undefined,
      output: outputSchema as JSONSchema7,
      input: inputSchema,
    },
  };

  return { operationId, jsonSchema, definitions };
};

/** Aim to create a simplified openapi specification that is more oriented towareds semantics. This will respond with a dereferenced semantic openapi! */
export const getSemanticOpenapi = (
  openapi: OpenapiDocument,
  openapiUrl: string,
  operationIds?: string[],
): SemanticOpenapi | undefined => {
  const parsedOperations = getOperations(
    openapi,
    openapiUrl,
    openapiUrl,
    operationIds,
  );

  if (!parsedOperations) {
    console.log("No parsed operations");
    return;
  }

  const semanticOperationSchemas = parsedOperations.map(
    parsedOperationToSemanticOperationSchema,
  );

  const definitions = mergeObjectsArray(
    parsedOperations.map((x) => x.definitions).filter(notEmpty),
  );

  const semanticOpenapiSchema: SemanticOpenapi = {
    $schema: "https://ref.actionschema.com/semantic-openapi-schema.json",
    type: "object",
    additionalProperties: false,
    required: semanticOperationSchemas.map((x) => x.operationId),
    properties: semanticOperationSchemas.reduce(
      (previous, current) => {
        return { ...previous, [current.operationId]: current.jsonSchema };
      },
      {} as { [operationId: string]: SemanticOperationSchema },
    ),
    definitions,
  };

  return semanticOpenapiSchema;
};
