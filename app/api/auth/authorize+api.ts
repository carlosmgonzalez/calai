import { GOOGLE_CLIENT_ID } from "@/utils/constants";

export const GET = (request: Request) => {
  if (!GOOGLE_CLIENT_ID) {
    return Response.json(
      {
        error: "Google client id not set",
      },
      { status: 500 }
    );
  }

  const url = new URL(request.url);

  return Response.json(
    {
      url,
    },
    { status: 200 }
  );
};
