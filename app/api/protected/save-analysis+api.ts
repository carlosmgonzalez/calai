import { db } from "@/lib/db";
import { foodAnalysis } from "@/lib/db/schema";
import { withAuth } from "@/utils/middleware";
import * as z from "zod";

const BodySchema = z.object({
  imageUrl: z.string(),
  identifiedFood: z.string(),
  portionSize: z.string(),
  healthScore: z.string(),
  dietaryInfo: z.string(),
  additionalNotes: z.string(),
});

export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json();

    const data = BodySchema.parse(body);

    await db.insert(foodAnalysis).values({
      userId: "105811610271106407019",
      imageUrl: data.imageUrl,
      identifiedFood: data.identifiedFood,
      portionSize: data.portionSize,
      healthScore: data.healthScore,
      dietaryInfo: data.dietaryInfo,
      additionalNotes: data.additionalNotes,
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError) {
      return Response.json(error.issues, { status: 400 });
    }

    return Response.json(
      {
        ok: false,
        error: "Something went wrong while saving the analysis data",
      },
      { status: 500 },
    );
  }
});
