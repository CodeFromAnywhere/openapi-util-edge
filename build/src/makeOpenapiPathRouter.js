import { mergeObjectsArray } from "edge-util";
function extractBracedVariables(text) {
    // Regex to match content within curly braces
    const regex = /\{([^}]+)\}/g;
    let match;
    const matches = [];
    // Loop through all matches in the text
    while ((match = regex.exec(text)) !== null) {
        // Add the matched content inside the braces to the array
        matches.push(match[1]);
    }
    return matches;
}
function pathToRegex(pathTemplate) {
    // Escape all RegExp special characters except for the placeholders
    let escapedPath = pathTemplate.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    // Replace placeholders with a regex pattern to match any alphanumeric characters (and underscores)
    let regexPattern = escapedPath.replace(/\\\{[^}]+\\\}/g, 
    // this matches all non-reserved URL characters
    "([a-zA-Z0-9._~-]+)");
    const fullRegexPattern = `^${regexPattern}$`;
    // Create a new RegExp object with start and end anchors
    return fullRegexPattern;
}
// Seems to work fine
// const example = {
//   pattern: "/user/{userId}/profile/{profileId}/details",
//   example: "/user/1/profile/hi/details",
// };
// const res = pathToRegex(example.pattern);
// console.log({ res });
// const realPath = example.example;
// const regex = new RegExp(res);
// const res1 = regex.exec(realPath);
// const res2 = regex.exec("/user/1/profile/details");
// console.log({ res1: res1, res2 });
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
export const makeOpenapiPathRouter = (openapi) => {
    const paths = Object.keys(openapi.paths);
    const regexes = paths.map((path) => {
        const variables = extractBracedVariables(path);
        const pathRegex = pathToRegex(path);
        const regex = new RegExp(pathRegex);
        return { path, regex, variables };
    });
    const matcher = (pathWithoutQuery) => {
        const match = regexes.find((item) => {
            return item.regex.exec(pathWithoutQuery);
        });
        if (!match) {
            return;
        }
        //do regex again, probably not very expensive
        const matchResult = match.regex.exec(pathWithoutQuery);
        const context = mergeObjectsArray(match.variables.map((name, index) => ({
            [name]: matchResult[index + 1],
        })));
        return { path: match.path, context };
    };
    return matcher;
};
//# sourceMappingURL=makeOpenapiPathRouter.js.map