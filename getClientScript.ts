import { camelCase } from "edge-util";

export const getClientScript = (
  openapis: { slug: string; baseUrl: string; envKeyName?: string }[],
  useJsImportSuffix?: boolean,
) => {
  const imports = openapis
    .map((item) => {
      const { slug } = item;
      const newObjectName = camelCase(`${slug}_operationUrlObject`);
      const newOperationsName = camelCase(`${slug}_operations`);
      const jsOrNot = useJsImportSuffix ? ".js" : "";
      // NB: may need .js suffix in some envs. Figure out what determines this and uniformalise it. Better,don't accept both.
      return `import { operationUrlObject as ${newObjectName}, operations as ${newOperationsName} } from "./${slug}${jsOrNot}";`;
    })
    .join("\n");

  const clients = openapis
    .map((item) => {
      const { slug, baseUrl, envKeyName } = item;
      const newObjectName = camelCase(`${slug}_operationUrlObject`);
      const newOperationsName = camelCase(`${slug}_operations`);
      const newVariableName = camelCase(slug);

      //<script> // put it down to get color highlights (with string-highlight extension)
      return ` 
  //@ts-ignore
  export const ${newVariableName} = createClient<${newOperationsName}>(${newObjectName}, {
    baseUrl: "${baseUrl}",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ${
        envKeyName ? `Authorization: "Bearer " + process.env.${envKeyName}` : ""
      }
    },
    timeoutSeconds: 60,
  });
  `;
      //</script>
    })
    .join("\n\n");

  return `import { createClient } from "./createClient${
    useJsImportSuffix ? ".js" : ""
  }";
    
${imports}


${clients}`;
};
