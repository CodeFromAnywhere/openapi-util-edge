import { OpenapiDocument } from "./openapi-types.js";
import { pathJoin } from "edge-util";
import { JSONSchema7 } from "json-schema";

export const resolveResourceBrowser = async (
  uri: string,
  document: OpenapiDocument | JSONSchema7,
  documentLocation: string,
): Promise<OpenapiDocument | JSONSchema7 | undefined> => {
  if (uri === "") {
    // we're already there
    return document;
  }

  const finalUri =
    uri.startsWith("https://") || uri.startsWith("http://")
      ? uri
      : uri.startsWith("/")
        ? new URL(documentLocation).origin
        : // TODO: make this one prettier. I have done it before but dunno where to find it
          pathJoin(documentLocation, "..", uri);

  //   console.log({finalUri})

  try {
    // absolute url
    const json = await fetch(finalUri).then(
      (res) => res.json() as Promise<OpenapiDocument | JSONSchema7>,
    );
    return json;
  } catch (e) {
    console.log(`couldnt resolve resource browser: ${finalUri}`);

    return undefined;
  }
};
