import { OpenapiDocument } from "./openapi-types.js";
/**
Creates an OpenAPI router to match against the paths

const router = makeOpenapiPathRouter({
  paths: {
    "/users/{id}/details": {},
    "/company/{id}": {},
    "/company/{companyId}/member/{memberId}": {},
    "/users/{id}/history/{historyId}": {},
  },
  info: { title: "HI", version: "0.0.1" },
  openapi: "",
});

console.log(router("/users/wijnand/details"));
console.log(router("/company/details"));
console.log(router("/company/details/member/1234"));
console.log(router("/users/wijnand/history/abc"));


 */
export declare const makeOpenapiPathRouter: (openapi: OpenapiDocument) => (pathWithoutQuery: string) => {
    path: string;
    context: {
        [x: string]: string;
    };
} | undefined;
//# sourceMappingURL=makeOpenapiPathRouter.d.ts.map