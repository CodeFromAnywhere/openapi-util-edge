import { OpenapiDocument } from "../openapi-types.js";
type GenerateSdkOpenapi = {
    /** Used as prefix for the operation (e.g. `sdk.userCrud.create`) */
    slug: string;
    envKeyName?: string;
    /** If given, will only put this subset in the SDK */
    operationIds?: string[];
    openapiUrl: string;
    /** If it comes from locally, we can define that here, but url should still be given */
    openapiObject?: OpenapiDocument;
};
type GenerateSdkContext = {
    useJsImportSuffix?: boolean;
    openapis: GenerateSdkOpenapi[];
};
export declare const generateTypescriptSdk: (context: GenerateSdkContext) => Promise<{
    files: {
        [filePath: string]: string;
    };
}>;
export {};
//# sourceMappingURL=generateTypescriptSdk.d.ts.map