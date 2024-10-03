import { notEmpty } from "edge-util";
import { pruneOpenapi } from "../src/pruneOpenapi.js";
import { resolveSchemaRecursive } from "../src/resolveSchemaRecursive.js";
// export const config = { runtime: "edge" };
export const mergeOpenapis = async (context) => {
    const { openapiList } = context;
    const openapis = (await Promise.all(openapiList.map(async (item) => {
        const openapi = (await resolveSchemaRecursive({
            documentUri: item.openapiUrl,
            shouldDereference: true,
        }));
        return openapi;
    }))).filter(notEmpty);
    if (openapis.length === 0) {
        return;
    }
    const prunedOpenapis = (await Promise.all(openapiList.map((item, index) => 
    //@ts-ignore
    pruneOpenapi(openapis[index], item.operationIds)))).filter(notEmpty);
    const openapi = prunedOpenapis.reduce((previous, current) => {
        //move up servers and security
        for (let path in current.paths) {
            for (let method in current.paths[path]) {
                //@ts-ignore
                if (!current.paths[path][method].security) {
                    //@ts-ignore
                    current.paths[path][method].security = current.security;
                }
                //@ts-ignore
                if (!current.paths[path][method].servers) {
                    //@ts-ignore
                    current.paths[path][method].servers = current.servers;
                }
            }
        }
        return {
            ...previous,
            //merge tags
            tags: { ...previous.tags, ...current.tags },
            //TODO:
            paths: { ...previous.paths, ...current.paths },
            components: {
                // TODO:
                // callbacks: {},
                // examples: {},
                // headers: {},
                // links: {},
                // parameters: {},
                // requestBodies: {},
                // responses: {},
                schemas: {
                    ...previous.components?.schemas,
                    ...current.components?.schemas,
                },
                securitySchemes: {
                    ...previous.components?.securitySchemes,
                    ...current.components?.securitySchemes,
                },
            },
        };
    }, {
        // for now take the first info
        info: prunedOpenapis[0].info,
        openapi: "3.1.0",
        paths: {},
        components: {},
    });
    return openapi;
};
//# sourceMappingURL=mergeOpenapis.js.map