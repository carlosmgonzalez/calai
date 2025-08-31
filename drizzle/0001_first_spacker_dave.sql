CREATE TABLE "food_analysis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_url" text NOT NULL,
	"identified_food" text NOT NULL,
	"portion_size" text NOT NULL,
	"health_score" text NOT NULL,
	"dietary_info" text NOT NULL,
	"additional_notes" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nutrition_facts_per_100g" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calories" text NOT NULL,
	"protein" text NOT NULL,
	"carbs" text NOT NULL,
	"fat" text NOT NULL,
	"saturated_fat" text NOT NULL,
	"trans_fat" text NOT NULL,
	"fiber" text NOT NULL,
	"sugar" text NOT NULL,
	"sodium" text NOT NULL,
	"cholesterol" text NOT NULL,
	"food_analysis_id" uuid NOT NULL,
	CONSTRAINT "nutrition_facts_per_100g_food_analysis_id_unique" UNIQUE("food_analysis_id")
);
--> statement-breakpoint
CREATE TABLE "nutrition_facts_per_portion" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"calories" text NOT NULL,
	"protein" text NOT NULL,
	"carbs" text NOT NULL,
	"fat" text NOT NULL,
	"saturated_fat" text NOT NULL,
	"trans_fat" text NOT NULL,
	"fiber" text NOT NULL,
	"sugar" text NOT NULL,
	"sodium" text NOT NULL,
	"cholesterol" text NOT NULL,
	"food_analysis_id" uuid NOT NULL,
	CONSTRAINT "nutrition_facts_per_portion_food_analysis_id_unique" UNIQUE("food_analysis_id")
);
--> statement-breakpoint
ALTER TABLE "food_analysis" ADD CONSTRAINT "food_analysis_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_facts_per_100g" ADD CONSTRAINT "nutrition_facts_per_100g_food_analysis_id_food_analysis_id_fk" FOREIGN KEY ("food_analysis_id") REFERENCES "public"."food_analysis"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nutrition_facts_per_portion" ADD CONSTRAINT "nutrition_facts_per_portion_food_analysis_id_food_analysis_id_fk" FOREIGN KEY ("food_analysis_id") REFERENCES "public"."food_analysis"("id") ON DELETE cascade ON UPDATE no action;