import { JSONSchema7 } from "json-schema";
import { ParsedOperation } from "./codegen/api.js";
import { OpenapiDocument } from "./openapi-types.js";
import { SemanticOpenapi, SemanticOperationSchema } from "./types.js";
export declare const parsedOperationToSemanticOperationSchema: (parsedOperation: ParsedOperation) => {
    operationId: string;
    jsonSchema: SemanticOperationSchema;
    definitions: {
        [key: string]: JSONSchema7;
    } | undefined;
};
/** Aim to create a simplified openapi specification that is more oriented towareds semantics. This will respond with a dereferenced semantic openapi! */
export declare const getSemanticOpenapi: (openapi: OpenapiDocument, openapiUrl: string, operationIds?: string[]) => SemanticOpenapi | undefined;
//# sourceMappingURL=getSemanticOpenapi.d.ts.map