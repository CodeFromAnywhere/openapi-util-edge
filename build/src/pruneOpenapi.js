import { notEmpty, pascalCase } from "edge-util";
import { JsonPointer } from "json-ptr";
import { resolveSchemaRecursive } from "./resolveSchemaRecursive.js";
import { mergeObjectsArray } from "./codegen/api.js";
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
export const pruneOpenapi = async (openapi, operationIds, shouldDereference = false) => {
    const cleanOpenapi = (await resolveSchemaRecursive({
        document: openapi,
        shouldDereference,
    }));
    if (!cleanOpenapi) {
        return;
    }
    const allowedMethods = [
        "get",
        "post",
        "put",
        "patch",
        "delete",
        "head",
        "options",
    ];
    const pathKeys = Object.keys(cleanOpenapi.paths);
    const operations = pathKeys
        .map((path) => {
        const item = cleanOpenapi.paths[path];
        if (!item) {
            return;
        }
        const methods = Object.keys(item).filter((method) => allowedMethods.includes(method));
        const pathMethods = methods.map((method) => {
            const operation = item[method];
            const parameters = operation.parameters || item.parameters;
            const id = operation.operationId || path.slice(1) + "__" + method;
            const newOperationItem = { ...operation, parameters, operationId: id };
            return {
                path,
                method: method,
                operation: newOperationItem,
            };
        });
        return pathMethods;
    })
        .filter(notEmpty)
        .flat();
    // NB: Either get all of them or only a selection.
    const selectedOperations = operationIds
        ? operations.filter((x) => {
            return operationIds.includes(x.operation.operationId);
        })
        : operations;
    const normalizedOperations = selectedOperations.map((item) => {
        const refRegex = /"\\?\$ref":"([^"]*)"/g;
        let operationString = JSON.stringify(item.operation, undefined, 0);
        const matches = operationString.matchAll(refRegex);
        const matchesArray = Array.from(matches).map(([match, ref]) => {
            const pointer = new JsonPointer(ref);
            const value = pointer.get(cleanOpenapi);
            const definitionName = pascalCase([...pointer.path].pop());
            return {
                ref,
                match,
                pointer,
                value,
                definitionRef: `#/components/schemas/${definitionName}`,
                definitionName,
            };
        });
        const finalOperationString = matchesArray.reduce((string, item) => {
            if (item.ref !== item.definitionRef) {
                string = string.replace(item.match, `"$ref":"${item.definitionRef}"`);
            }
            return string;
        }, operationString);
        const newOperation = JSON.parse(finalOperationString);
        return { ...item, matchesArray, newOperation };
    });
    // Create the definitions object
    const definitions = mergeObjectsArray(normalizedOperations
        .map((item) => {
        return item.matchesArray.map((item) => ({
            [item.definitionName]: item.value,
        }));
    })
        .flat());
    // Create the new paths object
    const paths = {};
    normalizedOperations.map((operationItem) => {
        const { path, method, newOperation } = operationItem;
        if (!paths[path]) {
            // first make the path
            paths[path] = {};
        }
        // then set the method
        paths[path][method] = newOperation;
    });
    // 3) clean up schemas
    const newOpenapiJson = {
        // TODO: be sure to deref this fully. Technically there can still be references here
        ...cleanOpenapi,
        info: cleanOpenapi.info,
        openapi: cleanOpenapi.openapi,
        security: cleanOpenapi.security,
        servers: cleanOpenapi.servers,
        tags: cleanOpenapi.tags,
        components: {
            // I think it's the only one we want to keep
            securitySchemes: cleanOpenapi.components?.securitySchemes,
            // needed to not conflict with OpenAI requirement
            schemas: definitions,
        },
        // only change paths
        paths,
    };
    return newOpenapiJson;
};
//# sourceMappingURL=pruneOpenapi.js.map