import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const foodAnalysis = pgTable("food_analysis", {
  id: uuid("id").primaryKey().defaultRandom(),
  imageUrl: text("image_url").notNull(),
  identifiedFood: text("identified_food").notNull(),
  portionSize: text("portion_size").notNull(),
  healthScore: text("health_score").notNull(),
  dietaryInfo: text("dietary_info").notNull(),
  additionalNotes: text("additional_notes").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
});

export const nutritionFactsPerPortion = pgTable("nutrition_facts_per_portion", {
  id: uuid("id").primaryKey().defaultRandom(),
  calories: text("calories").notNull(),
  protein: text("protein").notNull(),
  carbs: text("carbs").notNull(),
  fat: text("fat").notNull(),
  saturatedFat: text("saturated_fat").notNull(),
  transFat: text("trans_fat").notNull(),
  fiber: text("fiber").notNull(),
  sugar: text("sugar").notNull(),
  sodium: text("sodium").notNull(),
  cholesterol: text("cholesterol").notNull(),
  foodAnalysisId: uuid("food_analysis_id")
    .references(() => foodAnalysis.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
});

export const nutritionFactsPer100g = pgTable("nutrition_facts_per_100g", {
  id: uuid("id").primaryKey().defaultRandom(),
  calories: text("calories").notNull(),
  protein: text("protein").notNull(),
  carbs: text("carbs").notNull(),
  fat: text("fat").notNull(),
  saturatedFat: text("saturated_fat").notNull(),
  transFat: text("trans_fat").notNull(),
  fiber: text("fiber").notNull(),
  sugar: text("sugar").notNull(),
  sodium: text("sodium").notNull(),
  cholesterol: text("cholesterol").notNull(),
  foodAnalysisId: uuid("food_analysis_id")
    .references(() => foodAnalysis.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
});

export const userRelations = relations(user, ({ many }) => ({
  foodAnalysis: many(foodAnalysis),
}));

export const foodAnalysisRelations = relations(foodAnalysis, ({ one }) => ({
  nutritionFactsPer100g: one(nutritionFactsPer100g),
  nutritionFactsPerPortion: one(nutritionFactsPerPortion),
  user: one(user, {
    fields: [foodAnalysis.userId],
    references: [user.id],
  }),
}));

export const nutritionFactsPer100gRelations = relations(
  nutritionFactsPer100g,
  ({ one }) => ({
    foodAnalysis: one(foodAnalysis, {
      fields: [nutritionFactsPer100g.foodAnalysisId],
      references: [foodAnalysis.id],
    }),
  }),
);

export const nutritionFactsPerPortionRelations = relations(
  nutritionFactsPerPortion,
  ({ one }) => ({
    foodAnalysis: one(foodAnalysis, {
      fields: [nutritionFactsPerPortion.foodAnalysisId],
      references: [foodAnalysis.id],
    }),
  }),
);
