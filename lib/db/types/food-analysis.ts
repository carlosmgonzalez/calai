import type { InferSelectModel } from "drizzle-orm";
import {
  foodAnalysis,
  nutritionFactsPer100g,
  nutritionFactsPerPortion,
} from "../schema";

/**
 * Tipos "raw" inferidos por Drizzle (fila/registro tal cual en DB)
 */
export type FoodAnalysisRow = InferSelectModel<typeof foodAnalysis>;
export type NutritionFactsPer100gRow = InferSelectModel<
  typeof nutritionFactsPer100g
>;
export type NutritionFactsPerPortionRow = InferSelectModel<
  typeof nutritionFactsPerPortion
>;

/**
 * Tipo compuesto que representa lo que devuelve tu query with: { ... }
 * (las relaciones pueden ser `null` si tu consulta permite eso)
 */
export type FoodAnalysisRecord = FoodAnalysisRow & {
  nutritionFactsPer100g: NutritionFactsPer100gRow | null;
  nutritionFactsPerPortion: NutritionFactsPerPortionRow | null;
};
