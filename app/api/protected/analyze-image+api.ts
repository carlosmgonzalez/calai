import { ai } from "@/utils/ai/google";
import { withAuth } from "@/utils/middleware";

export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: body.imageBase64,
          },
        },
        {
          // text: "Analyze this food and tell me how many calories it could have.",
          text: "Analyze this image and tell me what you see.",
        },
      ],
    });

    console.log(JSON.stringify(response, null, 4));

    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { error: "Something went wrong while analyzing the image" },
      { status: 500 },
    );
  }
});
