export const proxy =
  (url: string, method: string, headers?: { [key: string]: string }) =>
  async (request: Request) => {
    console.log("entering write endpoint");
    if (method === "post") {
      const body = await request.text();
      console.log({ body });

      // get all headers to pass on
      const headersObject = Array.from(request.headers.keys()).reduce(
        (previous, current) => ({
          ...previous,
          [current]: request.headers.get(current)!,
        }),
        {},
      );

      const newHeaders = { ...(headers || {}), ...headersObject };

      console.log({ headersObject, newHeaders });
      const response = await fetch(url, {
        method,
        body,
        headers: newHeaders,
      });

      console.log("AFTER FETCH");

      const responseHeadersObject = Array.from(response.headers.keys()).reduce(
        (previous, current) => ({
          ...previous,
          [current]: response.headers.get(current)!,
        }),
        {},
      );

      console.log({ responseHeadersObject });
      const text = await response.text();

      console.log({ text });
      return new Response(text, {
        headers: responseHeadersObject,
        status: response.status,
        statusText: response.statusText,
      });
    }

    return new Response(
      "Method not allowed: " + method + "\n\n For URL: " + url,
      { status: 405 },
    );
  };
