import { resolveSchemaRecursive } from "./resolveSchemaRecursive";
resolveSchemaRecursive({
    documentUri: "https://openapi.vercel.sh",
    shouldDereference: true,
}).then((res) => {
    console.log(res);
});
//# sourceMappingURL=pruneOpenapi.test.js.map