import { resolveResourceBrowser } from "./resolveResourceBrowser.js";
/**
 * Function that resolves $ref, continues if it's not a ref, or throws an error
 *
 * Where it can resolve:
 *
 * - in-file absolute locations
 * - (relative) url locations
 */
export const resolveReferenceBrowser = async (maybeReference, document, 
/** URI (either path or url) */
documentLocation) => {
    if (maybeReference === undefined) {
        return;
    }
    const hasReference = typeof maybeReference === "object" &&
        maybeReference !== null &&
        Object.hasOwn(maybeReference, "$ref");
    if (!hasReference) {
        // respond directly if it's not a reference
        return maybeReference;
    }
    // 1) Get parsed resource incase remote, absolute, or relative. If it's relative, use documentLocation to determine the location
    const reference = maybeReference.$ref;
    const [uri, pointer] = reference.split("#");
    // NB: the first one is an empty string
    const chunks = pointer.split("/").slice(1);
    const resource = await resolveResourceBrowser(uri, document, documentLocation);
    if (!resource) {
        console.log(`Resource not resolved`, { documentLocation, uri });
        return;
    }
    // 2) With resource, access the location
    const blob = chunks.reduce((previous, current) => previous[current], resource);
    return blob;
};
//# sourceMappingURL=resolveReferenceBrowser.js.map