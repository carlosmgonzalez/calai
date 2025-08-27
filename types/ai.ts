export interface ResponseAnalysis {
  sdkHttpResponse: SDKHTTPResponse;
  candidates: Candidate[];
  modelVersion: string;
  responseId: string;
  usageMetadata: UsageMetadata;
}

export interface Candidate {
  content: Content;
  finishReason: string;
  index: number;
}

export interface Content {
  parts: Part[];
  role: string;
}

export interface Part {
  text: string;
}

export interface SDKHTTPResponse {
  headers: Headers;
}

export interface Headers {
  "alt-svc": string;
  "content-encoding": string;
  "content-type": string;
  date: string;
  server: string;
  "server-timing": string;
  "transfer-encoding": string;
  vary: string;
  "x-content-type-options": string;
  "x-frame-options": string;
  "x-xss-protection": string;
}

export interface UsageMetadata {
  promptTokenCount: number;
  candidatesTokenCount: number;
  totalTokenCount: number;
  cachedContentTokenCount: number;
  promptTokensDetails: TokensDetail[];
  cacheTokensDetails: TokensDetail[];
  thoughtsTokenCount: number;
}

export interface TokensDetail {
  modality: string;
  tokenCount: number;
}

export interface DataAnalysis {
  foodAnalysis: FoodAnalysis;
}

export interface FoodAnalysis {
  identifiedFood: string;
  identifiedIngredients: string[];
  cookingMethod: string;
  cuisineType: string;
  portionSize: string;
  recognizedServingSize: string;
  confidenceLevel: string;
  nutritionFactsPerPortion: NutritionFactsPer;
  nutritionFactsPer100g: NutritionFactsPer;
  healthScore: string;
  allergens: string[];
  dietaryInfo: string[];
  additionalNotes: string[];
}

export interface NutritionFactsPer {
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  saturatedFat: string;
  transFat: string;
  fiber: string;
  sugar: string;
  sodium: string;
  cholesterol: string;
  vitamins: Vitamins;
  minerals: Minerals;
}

export interface Minerals {
  calcium: string;
  iron: string;
  potassium: string;
}

export interface Vitamins {
  vitaminC: string;
  vitaminA: string;
  vitaminD: string;
}
