import { ai } from "@/lib/ai/google";
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
          text: `Analyze this food image and provide detailed nutritional information in the following JSON format:
          {
            "foodAnalysis": {
              "identifiedFood": "Name and detailed description of what you see in the image",
              "identifiedIngredients": ["ingredient1", "ingredient2", "ingredient3"],
              "cookingMethod": "Identified cooking method (fried, baked, boiled, etc.)",
              "cuisineType": "Cuisine type (Mexican, Italian, Asian, etc.)",
              "portionSize": "Estimated portion size in grams",
              "recognizedServingSize": "Estimated recognized serving size in grams",
              "confidenceLevel": "High/Medium/Low - confidence level in identification",
              "nutritionFactsPerPortion": {
                "calories": "Estimated calories",
                "protein": "Estimated protein in grams",
                "carbs": "Estimated carbohydrates in grams",
                "fat": "Estimated total fat in grams",
                "saturatedFat": "Estimated saturated fat in grams",
                "transFat": "Estimated trans fat in grams",
                "fiber": "Estimated fiber in grams",
                "sugar": "Estimated sugar in grams",
                "sodium": "Estimated sodium in mg",
                "cholesterol": "Estimated cholesterol in mg",
                "vitamins": {
                  "vitaminC": "Vitamin C in mg",
                  "vitaminA": "Vitamin A in mcg",
                  "vitaminD": "Vitamin D in mcg"
                },
                "minerals": {
                  "calcium": "Calcium in mg",
                  "iron": "Iron in mg",
                  "potassium": "Potassium in mg"
                }
              },
              "nutritionFactsPer100g": {
                "calories": "Calories per 100g",
                "protein": "Protein in grams per 100g",
                "carbs": "Carbohydrates in grams per 100g",
                "fat": "Total fat in grams per 100g",
                "saturatedFat": "Saturated fat in grams per 100g",
                "transFat": "Trans fat in grams per 100g",
                "fiber": "Fiber in grams per 100g",
                "sugar": "Sugar in grams per 100g",
                "sodium": "Sodium in mg per 100g",
                "cholesterol": "Cholesterol in mg per 100g",
                "vitamins": {
                  "vitaminC": "Vitamin C in mg per 100g",
                  "vitaminA": "Vitamin A in mcg per 100g",
                  "vitaminD": "Vitamin D in mcg per 100g"
                },
                "minerals": {
                  "calcium": "Calcium in mg per 100g",
                  "iron": "Iron in mg per 100g",
                  "potassium": "Potassium in mg per 100g"
                }
              },
              "healthScore": "Nutritional score from 1-10 (10 = healthiest)",
              "allergens": ["List of possible allergens: gluten, dairy, eggs, nuts, soy, fish, shellfish"],
              "dietaryInfo": ["List of dietary characteristics: vegetarian, vegan, gluten-free, keto-friendly, paleo, etc."],
              "additionalNotes": [
                "Any notable nutritional characteristics",
                "Information about preparation method that affects nutritional value",
                "Limitations or uncertainties in the analysis",
                "Nutritional recommendations if applicable"
              ]
            }
          }

          Important instructions:
          - Ensure the response is in valid JSON format, exactly as specified above, without any Markdown formatting.
          - Provide realistic estimates based on typical portion sizes and nutritional databases.
          - Be as specific and precise as possible when identifying food and its components.**
          - Give all responses in English.**
          - Make sure to calculate nutritional values both per portion and per 100g for easy comparison.
          - If you cannot clearly identify the food or there are hidden elements, explicitly indicate limitations in your analysis.
          - Provide ranges when precision is uncertain (e.g., "200-250 calories").
          - If you detect multiple foods in the image, analyze the dish as a whole but mention main components in "identifiedIngredients".
          - For healthScore, consider factors like: nutrient density, presence of processed foods, macronutrient balance, and vitamin/mineral content.
          - In allergens, include only those that may actually be present based on identified ingredients.`,
        },
      ],
    });

    const data = response.candidates![0].content!.parts![0].text;
    const parseData = JSON.parse(data!);

    return Response.json(parseData, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json(
      { error: "Something went wrong while analyzing the image" },
      { status: 500 },
    );
  }
});
