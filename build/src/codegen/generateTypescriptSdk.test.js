import { writeFileSync } from "fs";
import { generateTypescriptSdk } from "./generateTypescriptSdk.js";
import { join } from "path";
generateTypescriptSdk({
    openapis: [
        {
            slug: "auth",
            openapiUrl: "https://auth.actionschema.com/openapi.json",
            operationIds: ["permission", "authenticate"],
        },
    ],
}).then((result) => {
    const src = result.files["api.ts"];
    writeFileSync(join(process.cwd(), "src/test-sdk", "api.ts"), src, "utf8");
});
//# sourceMappingURL=generateTypescriptSdk.test.js.map