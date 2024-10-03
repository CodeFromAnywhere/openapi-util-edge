// I put a lot of functions in one file here, including some from `edge-util` because it is to be added to code generation.
/** Renames all refs to #/components/schemas/ instead of #/definitions */
export const renameRefs = (schema, toType = "openapi") => {
    if (!schema) {
        return schema;
    }
    // NO SPACES
    const string = JSON.stringify(schema, undefined, 0);
    const jsonschemaLocation = `"$ref":"#/definitions/`;
    const openapiLocation = `"$ref":"#/components/schemas/`;
    const from = toType === "jsonschema" ? openapiLocation : jsonschemaLocation;
    const to = toType === "jsonschema" ? jsonschemaLocation : openapiLocation;
    const newString = string.replaceAll(from, to);
    return JSON.parse(newString);
};
export const omitUndefinedValues = (object) => {
    Object.keys(object).map((key) => {
        const value = object[key];
        if (value === undefined) {
            delete object[key];
        }
    });
    return object;
};
export const removeOptionalKeysFromObjectStrings = (object, keys) => {
    const newObject = keys.reduce((objectNow, key) => {
        return {
            ...objectNow,
            [key]: undefined,
        };
    }, object);
    return omitUndefinedValues(newObject);
};
const removeCommentsRegex = /\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g;
/**
 * if text isn't json, returns null
 */
export const tryParseJson = (text, logParseError) => {
    try {
        const jsonStringWithoutComments = text.replace(removeCommentsRegex, (m, g) => (g ? "" : m));
        return JSON.parse(jsonStringWithoutComments);
    }
    catch (parseError) {
        if (logParseError)
            console.log("JSON Parse error:", parseError);
        return null;
    }
};
/**
 * Removes empty values (null or undefined) from your arrays in a type-safe way
 */
export function notEmpty(value) {
    return value !== null && value !== undefined;
}
export const mergeObjectsArray = (objectsArray) => {
    const result = objectsArray.reduce((previous, current) => {
        return { ...previous, ...current };
    }, {});
    return result;
};
export function stringify(obj) {
    return Object.entries(obj)
        .map(([key, value]) => {
        if (value === null || value === undefined) {
            return encodeURIComponent(key);
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
        .join("&");
}
/** Resolves local ref synchronously */
export const resolveLocalRef = (openapi, schemaOrRef) => {
    const ref = schemaOrRef?.$ref;
    if (ref && ref.startsWith("#")) {
        const chunks = ref.split("/").slice(1);
        const referencedSchema = chunks.reduce((previous, chunk) => previous?.[chunk], openapi);
        return referencedSchema;
    }
    return schemaOrRef;
};
/**
 * Responds with the operations from an openapi document by looking in the paths and (next)-allowed methods.
 *
 * Besides this, it aims to create a more flat object for each input and output.
 */
export const getOperations = (openapi, openapiId, openapiUrl, operationIds) => {
    if (!openapiId ||
        !openapiUrl ||
        !openapi ||
        !openapi.paths ||
        typeof openapi.paths !== "object") {
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
    const operations = Object.keys(openapi.paths)
        .map((path) => {
        const item = openapi.paths[path];
        if (!item || typeof item !== "object") {
            return;
        }
        const methods = Object.keys(item).filter((method) => allowedMethods.includes(method));
        const pathMethods = methods
            .map((method) => {
            const operation = item[method];
            const operationId = operation.operationId || path.slice(1) + "__" + method;
            if (operationIds && !operationIds.includes(operationId)) {
                // prune early
                return;
            }
            const servers = operation.servers?.length
                ? operation.servers
                : item.servers?.length
                    ? item.servers
                    : openapi.servers;
            const serversWithUrl = servers?.filter((x) => !!x.url);
            const serversWithBaseServer = serversWithUrl && serversWithUrl.length > 0
                ? serversWithUrl
                : openapiUrl
                    ? [{ url: openapiUrl }]
                    : [];
            const serversWithOrigin = serversWithBaseServer.map((server) => {
                const fullUrl = server.url.startsWith("http://") ||
                    server.url.startsWith("https://")
                    ? server.url
                    : new URL(openapiUrl).origin + server.url;
                return { ...server, url: fullUrl };
            });
            const parameters = (operation.parameters || item.parameters)
                ?.map((item) => resolveLocalRef(openapi, item))
                .filter(notEmpty);
            const parameterSchemas = (parameters || []).map((item) => ({
                type: "object",
                required: item.required ? [item.name] : undefined,
                properties: {
                    [item.name]: resolveLocalRef(openapi, item.schema),
                },
            }));
            const statusCodes = operation.responses && typeof operation.responses === "object"
                ? Object.keys(operation.responses)
                : [];
            const responseStatusSchemas = statusCodes.map((status) => {
                const responseObject = resolveLocalRef(openapi, operation.responses[status]);
                const mediaTypeKeys = responseObject.content
                    ? Object.keys(responseObject.content)
                    : [];
                const mediaTypes = mediaTypeKeys
                    .map((mediaType) => {
                    const mediaTypeObject = responseObject.content?.[mediaType];
                    if (!mediaTypeObject) {
                        return;
                    }
                    return { ...mediaTypeObject, mediaType };
                })
                    .filter(notEmpty);
                const headerNames = responseObject.headers
                    ? Object.keys(responseObject.headers)
                    : [];
                const headers = headerNames
                    .map((name) => {
                    const headerObject = resolveLocalRef(openapi, responseObject.headers?.[name]);
                    if (!headerObject) {
                        return;
                    }
                    return { ...headerObject, name };
                })
                    .filter(notEmpty);
                // each statuscode can have multiple mediatypes and multiple headers. can we make it flatter here?
                // most common mediatypes are text/plain and json & co.
                // we can probably create a schema in which we merge all object schema mediatypes, and add a mediatype key
                const headersSchema = {
                    type: "object",
                    properties: mergeObjectsArray(headers
                        .map((item) => {
                        const schema = resolveLocalRef(openapi, item.schema);
                        if (!schema) {
                            return;
                        }
                        return {
                            [item.name]: schema,
                        };
                    })
                        .filter(notEmpty)),
                };
                const mediaTypesSchemas = mediaTypes.map((item) => {
                    const schema = resolveLocalRef(openapi, item.schema);
                    const schemaType = schema?.type === "object";
                    //  console.log({ schema: item.schema, resolved: schema });
                    return schemaType
                        ? schema
                        : {
                            type: "object",
                            properties: {
                                [item.mediaType]: schema,
                            },
                        };
                });
                const mediaTypeDescriptions = mediaTypes
                    .map((item) => `${item.mediaType}: ${resolveLocalRef(openapi, item.schema)?.description || "No description"}`)
                    .join("\n\n");
                const allSchemas = [headersSchema].concat(mediaTypesSchemas);
                const mergedSchema = allSchemas.reduce((accumulator, next) => {
                    // NB: This assumes body and parameters have no overlapping naming!
                    return {
                        ...accumulator,
                        properties: {
                            ...accumulator.properties,
                            ...next.properties,
                        },
                        required: (accumulator.required || []).concat(next.required || []),
                    };
                }, {
                    type: "object",
                    properties: {},
                    required: [],
                    description: mediaTypeDescriptions,
                });
                return {
                    status,
                    description: responseObject.description,
                    mergedSchema,
                };
            });
            const bestStatusCode = statusCodes.find((x) => x === "200") ||
                statusCodes.find((x) => x.startsWith("2")) ||
                statusCodes[0];
            const bestStatusResponse = responseStatusSchemas.find((x) => x.status === bestStatusCode);
            const resolvedRequestBodySchema = 
            // NB: only application/json is supported now!
            resolveLocalRef(openapi, operation.requestBody?.content?.["application/json"]?.schema);
            const allSchemas = [resolvedRequestBodySchema]
                .concat(parameterSchemas)
                .filter(notEmpty);
            const mergedInputSchema = allSchemas.reduce((accumulator, next) => {
                // NB: This assumes body and parameters have no overlapping naming!
                return {
                    ...accumulator,
                    properties: {
                        ...accumulator.properties,
                        ...next.properties,
                    },
                    required: (accumulator.required || []).concat(next.required || []),
                };
            }, {
                type: "object",
                properties: {},
                required: [],
                additionalProperties: false,
                description: resolvedRequestBodySchema?.description ||
                    parameterSchemas?.find((x) => x?.description)?.description,
            });
            const statusSchema = {
                type: "object",
                required: ["status"],
                properties: {
                    status: {
                        type: "number",
                        enum: statusCodes.map((x) => Number(x)),
                    },
                    statusDescription: { type: "string" },
                    statusText: { type: "string" },
                },
            };
            const mergedOutputSchema = [
                ...responseStatusSchemas.map((x) => x.mergedSchema),
                statusSchema,
            ].reduce((accumulator, next) => {
                // NB: This assumes body and parameters have no overlapping naming!
                return {
                    ...accumulator,
                    properties: {
                        ...accumulator.properties,
                        ...next.properties,
                    },
                    required: (accumulator.required || []).concat(next.required || []),
                };
            }, {
                type: "object",
                properties: {},
                required: [],
                additionalProperties: false,
                description: bestStatusResponse?.description
                    ? `${bestStatusResponse.status}: ${bestStatusResponse.description}\n\n${bestStatusResponse?.mergedSchema?.description}`
                    : undefined,
            });
            const neededRefs = findRefs({ mergedInputSchema, mergedOutputSchema }, openapi.components?.schemas);
            // console.log({ neededRefs });
            const definitions = neededRefs.reduce((previous, refName) => {
                const theRef = openapi.components?.schemas?.[refName];
                const ref = theRef
                    ? renameRefs(theRef, "jsonschema")
                    : {
                        description: "Reference couldn't be found",
                    };
                return {
                    ...previous,
                    [refName]: ref,
                };
            }, {});
            const realMergedInputSchema = !mergedInputSchema.properties ||
                Object.keys(mergedInputSchema.properties).length === 0
                ? undefined
                : mergedInputSchema;
            const realMergedOutputSchema = !mergedOutputSchema.properties ||
                Object.keys(mergedOutputSchema.properties).length === 0
                ? undefined
                : mergedOutputSchema;
            const parsedOperation = {
                openapiUrl,
                operationId,
                openapiId,
                path,
                serversWithOrigin,
                method: method,
                operation,
                parameters,
                responseStatusSchemas,
                resolvedRequestBodySchema,
                // these have definitions
                mergedInputSchema: realMergedInputSchema,
                mergedOutputSchema: realMergedOutputSchema,
                definitions,
            };
            return parsedOperation;
        })
            .filter(notEmpty);
        return pathMethods;
    })
        .filter(notEmpty)
        .flat();
    return operations;
};
/** Returns the refs names (without pointer) that are included */
export const findRefs = (json, refs, refPrefix = "#/components/schemas/") => {
    if (!refs) {
        return [];
    }
    // NB: no spaces!
    const string = JSON.stringify(json, undefined, 0);
    const refsIncluded = Object.keys(refs).filter((refKey) => {
        const snippet = `"$ref":"${refPrefix}${refKey}"`;
        const includesSnippet = string.includes(snippet);
        return includesSnippet;
    });
    return refsIncluded;
};
/**
Fills headers, path, query, cookies, and body into a fetch in the right way according to the spec.

 Returns a requestInit  fetch-call.

 Must be using minimal dependencies and libraries so we can potentially use this in very light environments, clients, browsers, edge workers, everywhere.


Second Thoughts & Regressions:

 - Uses always the first server only
 - Doesn't allow for multiple auth headers yet if specified in openapi
 - Determining body is kind of wonky. application/json is the only content-type
 - There is no accept header

 There are probably thousands more things that certain APIs have strange exceptions with. I'm sure this will become a big limitation as APIs will just NOT be working. This is the reason SDKs exist I guess. Luckily I've got multiple ideas to create perfect self-healing SDKs so this is just a starting point and hopefully it already is able to address the majority of the APIs.

 */
export const getOperationRequestInit = (context) => {
    const { data, openapi, openapiUrl, operationId, access_token } = context;
    if (!openapi || !openapiUrl) {
        return;
    }
    const operation = getOperations(openapi, openapiUrl, openapiUrl, [
        operationId,
    ])?.[0];
    if (!operation) {
        return;
    }
    const securitySchemes = openapi.components?.securitySchemes;
    // For now, we take the first server...
    const servers = operation.serversWithOrigin;
    const firstServerUrl = servers?.find((x) => x.url)?.url || "";
    const securityArray = securitySchemes ? Object.values(securitySchemes) : [];
    const basicHttp = securityArray.find((item) => item.type === "http" && item.scheme === "basic");
    const basicBearer = securityArray.find((item) => item.type === "http" && item.scheme === "bearer");
    const apiKeySecurity = securityArray.find((item) => item.type === "apiKey");
    const authHeader = basicHttp && access_token
        ? {
            Authorization: `Basic ${access_token}`,
        }
        : basicBearer && access_token
            ? { Authorization: `Bearer ${access_token}` }
            : apiKeySecurity && apiKeySecurity.in === "header" && access_token
                ? // NB: not entirely sure yet how I should manage this when there are multiple auth headers or other required headers.
                    { [apiKeySecurity.name]: access_token }
                : undefined;
    const queryParameters = operation.parameters
        ? operation.parameters.filter((x) => x.in === "query")
        : [];
    // Assuming queryParameters and data are defined
    const queryString = stringify(mergeObjectsArray(queryParameters
        .map((x) => x.name)
        .filter((name) => data?.[name] !== undefined)
        .map((name) => ({ [name]: data?.[name] }))));
    const queryPart = queryString === "" ? "" : "?" + queryString;
    const pathParameters = operation.parameters
        ? operation.parameters.filter((x) => x.in === "path")
        : [];
    const realPath = pathParameters.reduce((path, parameter) => {
        return path.replaceAll(`{${parameter.name}}`, data?.[parameter.name]);
    }, operation.path);
    const headerParameters = operation.parameters
        ? operation.parameters.filter((x) => x.in === "header")
        : [];
    const bodyData = data && operation.parameters
        ? removeOptionalKeysFromObjectStrings(data, operation.parameters.map((x) => x.name))
        : data;
    const method = operation.method;
    // only add a body if there is body data and we have a request method that can handle body
    const hasBody = !!bodyData &&
        Object.keys(bodyData).length > 0 &&
        !["get", "head"].includes(method);
    const body = hasBody ? JSON.stringify(bodyData) : undefined;
    const bodyObject = hasBody ? bodyData : undefined;
    // NB: This is a big limitation! There are soooo many other headers that we need...
    const contentTypeHeader = hasBody
        ? [{ "Content-Type": "application/json" }]
        : undefined;
    const parameterHeaders = headerParameters.map((item) => {
        const isPresent = !!data?.[item.name];
        if (!isPresent) {
            return;
        }
        return { [item.name]: data[item.name] };
    });
    const allHeaders = [authHeader]
        .concat(parameterHeaders)
        .concat(contentTypeHeader)
        .filter(notEmpty);
    const headers = mergeObjectsArray(allHeaders);
    const url = firstServerUrl + realPath + queryPart;
    return { url, body, headers, method, bodyObject };
};
function detectNeededParser(mediaType) {
    // Normalize the media type by trimming and converting to lowercase
    const normalizedType = mediaType.trim().toLowerCase();
    // Check for JSON types
    if (normalizedType.includes("json")) {
        return "json";
    }
    // Check for text types
    if (normalizedType.startsWith("text/") ||
        normalizedType === "application/xml" ||
        normalizedType === "application/xhtml+xml" ||
        normalizedType === "application/javascript") {
        return "text";
    }
    // Check for binary types that typically use blob
    if (normalizedType.startsWith("image/") ||
        normalizedType.startsWith("audio/") ||
        normalizedType.startsWith("video/") ||
        normalizedType === "application/pdf" ||
        normalizedType === "application/zip" ||
        normalizedType === "application/x-7z-compressed" ||
        normalizedType.startsWith("application/vnd.openxmlformats-officedocument.")) {
        return "blob";
    }
    // Default to arrayBuffer for other binary types
    return "arrayBuffer";
}
export const createClient = (openapi, openapiUrl, config) => {
    const client = async (operationId, context, customConfig) => {
        const operation = getOperations(openapi, openapiUrl, openapiUrl, [
            operationId,
        ])?.[0];
        const requestInit = getOperationRequestInit({
            openapi,
            data: context,
            openapiUrl,
            operationId,
            access_token: customConfig?.access_token || config?.access_token,
        });
        if (!requestInit || !operation) {
            throw new Error("Couldn't get request init or operation:" + String(operationId));
        }
        console.log({ requestInit });
        try {
            const abortController = new AbortController();
            const id = setTimeout(() => abortController.abort(), (customConfig?.timeoutSeconds || config?.timeoutSeconds || 30) * 1000);
            const response = await fetch(requestInit.url, {
                method: requestInit.method,
                signal: abortController.signal,
                headers: requestInit.headers,
                body: requestInit.body,
            })
                .then(async (response) => {
                const responseObject = operation.operation.responses[String(response.status)];
                const mediaTypes = responseObject.content
                    ? Object.keys(responseObject.content)
                    : [];
                const contentType = response.headers.get("Content-Type");
                const chosenMediaType = contentType || mediaTypes[0];
                const neededParser = detectNeededParser(chosenMediaType);
                const headers = responseObject.headers
                    ? Object.keys(responseObject.headers)
                    : [];
                const headerObject = mergeObjectsArray(headers.map((name) => ({ [name]: response.headers.get(name) })));
                // can do more here to explode headers
                //const headerObjects = headers.map(x=>responseObject.headers![x] as OpenapiHeaderObject).map(item=>item.)
                const base = {
                    statusDescription: responseObject.description,
                    statusText: response.statusText,
                    status: response.status,
                    ...headerObject,
                };
                if (neededParser === "text") {
                    const text = await response.text();
                    return { ...base, [chosenMediaType]: text };
                }
                else if (neededParser === "json") {
                    const json = await response.json();
                    const isJsonObject = typeof json === "object" && !Array.isArray(json);
                    const rest = isJsonObject ? json : { [chosenMediaType]: json };
                    // const isSchemaObject= (responseObject.content?.[chosenMediaType]?.schema as JSONSchema7)?.type === "object";
                    return { ...base, ...rest };
                }
                else if (neededParser === "blob") {
                    const blob = await response.blob();
                    return { ...base, [chosenMediaType]: blob };
                }
                else {
                    const arrayBuffer = await response.arrayBuffer();
                    return { ...base, [chosenMediaType]: arrayBuffer };
                }
            })
                .catch((error) => {
                console.log({
                    explanation: "Your request could not be executed, you may be disconnected or the server may not be available. ",
                    error,
                    errorStatus: error.status,
                    errorString: String(error),
                });
                return {
                    isSuccessful: false,
                    isNotConnected: true,
                    message: "Could not connect to any API. Please see your API configuration.",
                };
            });
            clearTimeout(id);
            return response;
        }
        catch (e) {
            return {
                isSuccessful: false,
                isNotConnected: true,
                message: "The API didn't resolve, and the fetch crashed because of it: " +
                    String(e),
            };
        }
    };
    return client;
};
//# sourceMappingURL=api.js.map