// @apidevtools/json-schema-ref-parser requires "path", which causes it not to work in "edge" runtime of Verecel
// maybe replace with https://www.npmjs.com/package/@stoplight/json-ref-resolver
import { dereference, bundle } from "@apidevtools/json-schema-ref-parser";
/**
 * Will resolve all external references recursively to end up with a schema without references (or only internal references)
 *
 * Uses https://github.com/APIDevTools/json-schema-ref-parser
 *
 * Returns the document without references in the schemas.
 */
export const resolveSchemaRecursive = async (context) => {
    const { document, documentUri, shouldDereference } = context;
    if (shouldDereference) {
        try {
            return dereference(documentUri || document, {
                continueOnError: true,
                dereference: { circular: "ignore" },
                timeoutMs: 45000,
                mutateInputSchema: false,
                resolve: { external: true },
            });
        }
        catch (err) {
            console.log("Error in resolveSchemaRecursive", err.errors.map((e) => ({ name: e.name, message: e.message })));
            return;
        }
    }
    try {
        const result = await bundle(documentUri || document, {
            continueOnError: true,
            timeoutMs: 45000,
            mutateInputSchema: false,
            resolve: { external: true },
        });
        return result;
    }
    catch (err) {
        console.log("Error in resolveSchemaRecursive", err.errors.map((e) => ({ name: e.name, message: e.message })));
        return;
    }
};
//# sourceMappingURL=resolveSchemaRecursive.js.map