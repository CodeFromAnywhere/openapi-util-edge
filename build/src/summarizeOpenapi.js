import { notEmpty, onlyUnique2 } from "edge-util";
import { getOperations } from "./codegen/api.js";
const cap = (string, limit) => {
    if (!string) {
        return;
    }
    if (string.length > limit) {
        return string.slice(0, limit - 2) + "..";
    }
    return string;
};
/** Sumamrises operations, using the operation summary and operationId, and tags + their description.
 *
 * Tag descriptions are capped at 1024 characters, while operation summaries are capped at 120 characters
 */
export const summarizeOpenapi = async (openapi, openapiUrl, isJson) => {
    const operations = openapiUrl && openapi
        ? getOperations(openapi, openapiUrl, openapiUrl)
        : undefined;
    if (!operations) {
        return { error: "No operations" };
    }
    const uniqueOperationTags = operations
        .map((x) => x.operation.tags)
        .filter(notEmpty)
        .flat();
    const tags = (openapi.tags &&
        Array.isArray(openapi.tags) &&
        openapi.tags.map((x) => !!x.name)
        ? openapi.tags
        : [])
        .concat(uniqueOperationTags.map((x) => ({ name: x, description: undefined })))
        .filter(onlyUnique2((a, b) => a.name === b.name));
    const tagsAndOther = tags.concat({ name: "Other" });
    const taggedOperations = tagsAndOther
        .map((tag) => operations
        .filter((x) => tag.name === "Other"
        ? !x.operation.tags || x.operation.tags.length === 0
        : x.operation.tags?.includes(tag.name))
        .map(({ operationId, operation }) => {
        return {
            operationId,
            // NB: capped at 120 characters
            summary: cap(operation.summary, 120),
            tagName: tag.name,
            // NB: capped at 1024 characters
            tagDescription: cap(tag.description, 1024),
        };
    }))
        .filter((item) => item.length !== 0);
    if (isJson) {
        const flattened = taggedOperations.flat();
        return flattened;
    }
    const llmString = taggedOperations
        .map((item) => `# ${item[0].tagName}${item[0].tagDescription ? "\n\n" + item[0].tagDescription : ""}\n\n${item
        .map((item) => {
        const summaryPart = item.summary ? ` - ${item.summary}` : "";
        return `- ${item.operationId}${summaryPart}`;
    })
        .join("\n")}`)
        .join("\n\n");
    return llmString;
};
//# sourceMappingURL=summarizeOpenapi.js.map