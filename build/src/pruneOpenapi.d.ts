import { OpenapiDocument } from "./openapi-types.js";
/**
 * Core functionality to prune an openapi.
 *
 * What it does:
 *
 * 1. bundles the entire file into 1 recursively without references to any URLs
 * 2. only picks the operationIds we want
 * 3. removes schema definitions that weren't referenced anymore
 *
 * TODO: Should report error when it produces an invalid schema!
 */
export declare const pruneOpenapi: (openapi: OpenapiDocument, operationIds?: string[], shouldDereference?: boolean) => Promise<OpenapiDocument | undefined>;
//# sourceMappingURL=pruneOpenapi.d.ts.map