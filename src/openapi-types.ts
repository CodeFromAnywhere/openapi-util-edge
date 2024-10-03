import { OpenAPIV3 } from "openapi-types";
type NonFunctionKeyNames<T> = Exclude<
  {
    [key in keyof T]: T[key] extends Function ? never : key;
  }[keyof T],
  undefined
>;

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
export type HttpMethodEnum =
  | "get"
  | "put"
  | "post"
  | "delete"
  | "options"
  | "head"
  | "patch"
  | "trace";
