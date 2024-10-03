import type { JSONSchema7 } from "json-schema";
import type { OpenAPIV3 } from "openapi-types";
type NonFunctionKeyNames<T> = Exclude<{
    [key in keyof T]: T[key] extends Function ? never : key;
}[keyof T], undefined>;
type RemoveFunctions<T> = Pick<T, NonFunctionKeyNames<T>>;
export type OpenapiDocument = RemoveFunctions<OpenAPIV3.Document>;
export type OpenapiPathsObject = OpenAPIV3.PathsObject;
export type OpenapiSchemasObject = OpenAPIV3.ComponentsObject["schemas"];
export type OpenapiHeaderObject = OpenAPIV3.HeaderObject;
export type OpenapiServerObject = OpenAPIV3.ServerObject;
export type OpenapiSecuritySchemeObject = OpenAPIV3.SecuritySchemeObject;
export type OpenapiApiSecurityScheme = OpenAPIV3.ApiKeySecurityScheme;
export type OpenapiPathItemObject = OpenAPIV3.PathItemObject;
export type OpenapiMediaType = OpenAPIV3.MediaTypeObject;
export type OpenapiArraySchemaObject = OpenAPIV3.ArraySchemaObject;
export type OpenapiParameterObject = OpenAPIV3.ParameterObject;
export type OpenapiSchemaObject = OpenAPIV3.SchemaObject;
export type OpenapiReferenceObject = OpenAPIV3.ReferenceObject;
export type OpenapiRequestBodyObject = OpenAPIV3.RequestBodyObject;
export type OpenapiOperationObject = OpenAPIV3.OperationObject;
export type OpenapiResponseObject = OpenAPIV3.ResponseObject;
export type HttpMethods = OpenAPIV3.HttpMethods;
export type ReferenceObject = OpenAPIV3.ReferenceObject;
export type HttpMethodEnum = "get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace";
/** Renames all refs to #/components/schemas/ instead of #/definitions */
export declare const renameRefs: <T extends JSONSchema7 | undefined>(schema: T, toType?: "openapi" | "jsonschema") => T;
export declare const omitUndefinedValues: <T extends {
    [key: string]: any;
}>(object: T) => T;
export declare const removeOptionalKeysFromObjectStrings: <TObject extends O>(object: TObject, keys: string[]) => TObject;
export type O = {
    [key: string]: any;
};
/**
 * if text isn't json, returns null
 */
export declare const tryParseJson: <T extends unknown>(text: string, logParseError?: boolean) => T | null;
/**
 * Removes empty values (null or undefined) from your arrays in a type-safe way
 */
export declare function notEmpty<TValue extends unknown>(value: TValue | null | undefined): value is TValue;
export declare const mergeObjectsArray: <T extends {
    [key: string]: any;
}>(objectsArray: T[]) => T;
export declare function stringify(obj: Record<string, any>): string;
export type ParsedOperation = {
    openapiUrl: string;
    /** OperationID but with extra that if it's missing, it'll use 'path=method' to create this unique identifier. */
    operationId: string;
    openapiId: string | undefined;
    path: string;
    /** Taken from operation, path item, and lastly the root of the openapi (this is the openapi v3 spec)
     */
    serversWithOrigin: OpenapiServerObject[];
    method: HttpMethodEnum;
    operation: OpenapiOperationObject;
    parameters?: OpenapiParameterObject[];
    resolvedRequestBodySchema?: JSONSchema7;
    responseStatusSchemas: {
        status: string;
        description: string;
        mergedSchema: JSONSchema7;
    }[];
    mergedInputSchema?: JSONSchema7;
    /**
     FORMAT:
  
    {
      status: number;
      statusDescription?: string;
      statusText?: string;
      [mediaType]: any non-object
      ...any object
    }
  
     */
    mergedOutputSchema?: JSONSchema7;
    definitions?: {
        [key: string]: JSONSchema7;
    };
};
/** Resolves local ref synchronously */
export declare const resolveLocalRef: <T>(openapi: OpenapiDocument, schemaOrRef: T | OpenapiReferenceObject) => T | undefined;
/**
 * Responds with the operations from an openapi document by looking in the paths and (next)-allowed methods.
 *
 * Besides this, it aims to create a more flat object for each input and output.
 */
export declare const getOperations: (openapi: OpenapiDocument, openapiId: string, openapiUrl: string, operationIds?: string[]) => ParsedOperation[] | undefined;
/** Returns the refs names (without pointer) that are included */
export declare const findRefs: (json: any, refs: O | undefined, refPrefix?: string) => string[];
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
export declare const getOperationRequestInit: (context: {
    openapi: OpenapiDocument;
    openapiUrl: string;
    operationId: string;
    /** Should be provided */
    access_token?: string;
    /** The combined data. Flat object. */
    data: O | undefined;
}) => {
    url: string;
    body: string | undefined;
    headers: {
        [key: string]: string;
    };
    method: HttpMethodEnum;
    bodyObject: O | undefined;
} | undefined;
export declare const createClient: <T>(openapi: OpenapiDocument, openapiUrl: string, config?: {
    access_token?: string;
    timeoutSeconds?: number;
}) => <K extends keyof T>(operationId: K, context: Exclude<T[K], undefined> extends {
    input: any;
} ? Exclude<T[K], undefined>["input"] : undefined, customConfig?: {
    access_token?: string;
    timeoutSeconds?: number;
}) => Promise<Exclude<T[K], undefined> extends {
    output: any;
} ? Exclude<T[K], undefined>["output"] : undefined>;
export {};
//# sourceMappingURL=api.d.ts.map