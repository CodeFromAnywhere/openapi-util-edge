import { pathJoin } from "edge-util";
export const resolveResourceBrowser = async (uri, document, documentLocation) => {
    if (uri === "") {
        // we're already there
        return document;
    }
    const finalUri = uri.startsWith("https://") || uri.startsWith("http://")
        ? uri
        : uri.startsWith("/")
            ? new URL(documentLocation).origin
            : // TODO: make this one prettier. I have done it before but dunno where to find it
                pathJoin(documentLocation, "..", uri);
    //   console.log({finalUri})
    try {
        // absolute url
        const json = await fetch(finalUri).then((res) => res.json());
        return json;
    }
    catch (e) {
        console.log(`couldnt resolve resource browser: ${finalUri}`);
        return undefined;
    }
};
//# sourceMappingURL=resolveResourceBrowser.js.map