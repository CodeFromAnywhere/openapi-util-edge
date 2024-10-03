export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const fetchUrl = url.searchParams.get("url");
  if (!fetchUrl) {
    return new Response("No URL specified", { status: 422 });
  }

  try {
    const result = await fetch(fetchUrl).then(async (res) => {
      return {
        text: await res.text(),
        contentType: res.headers.get("Content-Type") || "text/plain",
      };
    });

    return new Response(result.text, {
      status: 200,
      headers: { "Content-Type": result.contentType },
    });
  } catch (e) {
    return new Response("Something went wrong", { status: 500 });
  }
};
