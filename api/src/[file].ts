import { readFileSync } from "fs";
import { join } from "path";

/** Api to get files from the repo to be used as part of codegen. */
export const GET = (request: Request) => {
  const file = new URL(request.url).searchParams.get("file");

  const allowedFiles = {
    "api.ts": "src/codegen/api.ts",

    "api.js": "build/src/codegen/api.js",

    // we could do raw js here without import/export (can do tsc --target es6 src/api.ts)
    //"api.js": "build/src/codegen/api.js",
  };

  if (!file || !Object.keys(allowedFiles).includes(file)) {
    return new Response("Not found", { status: 404 });
  }

  const apiPath = join(
    process.cwd(),
    allowedFiles[file as keyof typeof allowedFiles],
  );

  console.log({ apiPath });

  const apiCodeString = readFileSync(apiPath, "utf8");

  return new Response(apiCodeString, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
};
