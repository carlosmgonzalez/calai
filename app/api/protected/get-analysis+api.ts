import { db } from "@/lib/db";
import { withAuth } from "@/utils/middleware";
import { and, gte, lt, eq } from "drizzle-orm";
import { foodAnalysis } from "@/lib/db/schema";

export const GET = withAuth(async (request, user) => {
  const url = new URL(request.url);
  const dateParam = url.searchParams.get("date");

  let whereConditions = [eq(foodAnalysis.userId, user.id)];

  if (dateParam) {
    // Parse the date string (YYYY-MM-DD) to avoid timezone issues
    const [year, month, day] = dateParam.split("-").map(Number);

    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    whereConditions.push(
      gte(foodAnalysis.createdAt, startOfDay),
      lt(foodAnalysis.createdAt, endOfDay),
    );
  }

  const foodAnalysisRecord = await db.query.foodAnalysis.findMany({
    where: and(...whereConditions),
    with: {
      nutritionFactsPer100g: true,
      nutritionFactsPerPortion: true,
    },
    orderBy: (foodAnalysis, { desc }) => [desc(foodAnalysis.createdAt)],
  });

  const dto = foodAnalysisRecord.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return Response.json(dto);
});
