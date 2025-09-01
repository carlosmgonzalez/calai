import { db } from "@/lib/db";
import { foodAnalysis, nutritionFactsPerPortion } from "@/lib/db/schema";
import { withAuth } from "@/utils/middleware";
import * as z from "zod";

const BodySchema = z.object({
  imageUrl: z.string(),
  identifiedFood: z.string(),
  portionSize: z.string(),
  healthScore: z.string(),
  dietaryInfo: z.string(),
  additionalNotes: z.string(),
  nutritionFactsPerPortion: z.object({
    calories: z.string(),
    protein: z.string(),
    carbs: z.string(),
    fat: z.string(),
    saturatedFat: z.string(),
    transFat: z.string(),
    fiber: z.string(),
    sugar: z.string(),
    sodium: z.string(),
    cholesterol: z.string(),
  }),
});

export const POST = withAuth(async (request, user) => {
  try {
    const body = await request.json();

    const data = BodySchema.parse(body);

    const foodAnalysisDb = await db
      .insert(foodAnalysis)
      .values({
        userId: user.id,
        imageUrl: data.imageUrl,
        identifiedFood: data.identifiedFood,
        portionSize: data.portionSize,
        healthScore: data.healthScore,
        dietaryInfo: data.dietaryInfo,
        additionalNotes: data.additionalNotes,
      })
      .returning({ insertedId: foodAnalysis.id });

    const foodAnalysisId = foodAnalysisDb[0].insertedId;

    await db.insert(nutritionFactsPerPortion).values({
      foodAnalysisId,
      calories: data.nutritionFactsPerPortion.calories,
      carbs: data.nutritionFactsPerPortion.carbs,
      cholesterol: data.nutritionFactsPerPortion.cholesterol,
      fat: data.nutritionFactsPerPortion.fat,
      fiber: data.nutritionFactsPerPortion.fiber,
      protein: data.nutritionFactsPerPortion.protein,
      saturatedFat: data.nutritionFactsPerPortion.saturatedFat,
      sodium: data.nutritionFactsPerPortion.sodium,
      sugar: data.nutritionFactsPerPortion.sugar,
      transFat: data.nutritionFactsPerPortion.transFat,
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
