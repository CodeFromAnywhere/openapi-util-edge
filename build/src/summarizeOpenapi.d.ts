import { OpenapiDocument } from "./openapi-types.js";
/** Sumamrises operations, using the operation summary and operationId, and tags + their description.
 *
 * Tag descriptions are capped at 1024 characters, while operation summaries are capped at 120 characters
 */
export declare const summarizeOpenapi: (openapi: OpenapiDocument, openapiUrl: string | null, isJson: boolean) => Promise<string | {
    operationId: string;
    summary: string | undefined;
    tagName: string;
    tagDescription: string | undefined;
}[] | {
    error: string;
}>;
//# sourceMappingURL=summarizeOpenapi.d.ts.map