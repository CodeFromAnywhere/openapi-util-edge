import { JSONSchemaType } from "ajv";
export declare const tryValidateSchema: (context: {
    schema: JSONSchemaType<any>;
    data: any;
}) => import("ajv").ErrorObject<string, Record<string, any>, unknown>[] | null | undefined;
//# sourceMappingURL=tryValidateSchema.d.ts.map