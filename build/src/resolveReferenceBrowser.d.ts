import { OpenapiDocument, ReferenceObject } from "./openapi-types.js";
import { JSONSchema7 } from "json-schema";
/**
 * Function that resolves $ref, continues if it's not a ref, or throws an error
 *
 * Where it can resolve:
 *
 * - in-file absolute locations
 * - (relative) url locations
 */
export declare const resolveReferenceBrowser: <T extends unknown>(maybeReference: T | ReferenceObject | undefined, document: OpenapiDocument | JSONSchema7, documentLocation: string) => Promise<T | undefined>;
//# sourceMappingURL=resolveReferenceBrowser.d.ts.map