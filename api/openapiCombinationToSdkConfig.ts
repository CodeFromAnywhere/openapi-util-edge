import { capitalCase, slugify, snakeCase, withoutExtension } from "edge-util";

export const POST = async (request: Request) => {
  const context = await request.json();
  const sdkConfig = openapiCombinationToSdkConfig(context);
  return new Response(JSON.stringify(sdkConfig), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
};

const envKeySuffix = "_AGENT_TOKEN";

const openapiCombinationToSdkConfig = (context: {
  combination: {
    openapiUrl: string;
    operationIds?: string[];
  }[];
}) => {
  const { combination } = context;

  const sdkConfig = combination.map((item) => {
    const url = new URL(item.openapiUrl);
    const slug = slugify(url.hostname + withoutExtension(url.pathname));
    return {
      ...item,
      slug,
      envKeyName: capitalCase(snakeCase(slug)) + envKeySuffix,
    };
  });

  return sdkConfig;
};
