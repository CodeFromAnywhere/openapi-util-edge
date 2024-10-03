import { fetchOpenapi } from "./fetchOpenapi.js";

[
  "https://guest1.actionschema.com/openapi.json",
  "https://api.codefromanywhere.com/openapi.json",
  "https://api.replicate.com/openapi.json",
  "https://api.uberduck.ai/openapi.json",
  "https://raw.githubusercontent.com/openai/openai-openapi/master/openapi.yaml",
  // not found
  //   "https://api.endpoints.huggingface.cloud/api-doc/openapi.json",
  "https://raw.githubusercontent.com/cloudflare/api-schemas/main/openapi.json",
  // These are multiple:"https://github.com/twilio/twilio-oai/tree/main/spec/json",
  "https://raw.githubusercontent.com/twilio/twilio-oai/main/spec/json/twilio_voice_v1.json",
  "https://raw.githubusercontent.com/sendgrid/sendgrid-oai/main/oai.json",
  "https://www.linode.com/docs/api/openapi.yaml",
  "https://openapi.vercel.sh/",
  "https://raw.githubusercontent.com/cielo24/playht-openapi/main/playht.yml",
  "https://openai-plugin.heygen.com/openapi.yaml",
].map((url) => {
  fetchOpenapi(url).then((doc) =>
    doc
      ? console.log(url + " " + JSON.stringify(doc).length)
      : console.log("NO:" + url),
  );
});
