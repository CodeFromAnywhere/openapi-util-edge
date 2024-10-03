import { JSONSchema7 } from "json-schema";
/**
 * Schema that defines a semantic operation schema.
 */
export interface SemanticOperationSchema {
    type: "object";
    /**
     * Combined description of all semantics
     */
    description?: string;
    additionalProperties: false;
    required: string[];
    properties: {
        [key in keyof SemanticOperation]: JSONSchema7;
    };
}
export interface SemanticOperation {
    operationId: string;
    openapiUrl: string;
    tags?: string[];
    externalDocs?: {
        description?: string;
        url: string;
        [k: string]: unknown;
    };
    description?: string;
    summary?: string;
    input?: JSONSchema7;
    output: JSONSchema7;
}
export interface SemanticOpenapi {
    $schema: "https://ref.actionschema.com/semantic-openapi-schema.json";
    type: "object";
    additionalProperties: false;
    required: string[];
    /**
     * The operations. Each operation is defined under a key of the operationId, where the value contains all information of that operation.
     */
    properties: {
        [operationId: string]: SemanticOperationSchema;
    };
    definitions?: {
        [k: string]: any;
    };
}
//# sourceMappingURL=types.d.ts.map