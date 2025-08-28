export const GET = (request: Request) => {
  const url = new URL(request.url);
  const name = url.searchParams.get("name");

  return Response.json({ message: `hello ${name}` });
};
