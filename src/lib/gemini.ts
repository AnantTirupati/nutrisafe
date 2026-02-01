import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY not set; AI features will fail.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface UserProfileForAnalysis {
  age?: number | null;
  medicalConditions: string[];
  allergies: string[];
  dietaryPreference: string;
  additionalNotes?: string | null;
}

export interface IngredientInsight {
  name: string;
  category: "safe" | "caution" | "harmful";
  explanation: string;
  reason?: string;
}

export interface AnalysisResult {
  productName: string;
  ingredients: string[];
  riskLevel: "low" | "medium" | "high";
  riskSummary: string;
  ingredientInsights: IngredientInsight[];
  recommendations: string[];
  /** 2–4 short search phrases for healthier alternatives to find on marketplaces */
  suggestedProductSearches?: string[];
}

const SYSTEM_PROMPT = `You are NutriSafe, a food safety and diet assistant. Your job is to:
1. Interpret food ingredients in plain language (e.g. "E621 (MSG) – a flavor enhancer that may trigger headaches in sensitive individuals").
2. For each ingredient, classify as: safe, caution, or harmful given the user's health profile.
3. Consider: medical conditions (Diabetes, Hypertension, PCOS, Heart Disease, etc.), allergies, and dietary preference (Veg/Non-Veg/Vegan).
4. Output a single overall risk level: low, medium, or high.
5. Give a short risk summary and 2-5 actionable recommendations (healthier alternatives, substitutes, diet tips).
6. Add "suggestedProductSearches": an array of 3-6 SHORT PRODUCT SEARCH PHRASES that users will use to BUY alternatives on Amazon, Flipkart, BigBasket, etc. Each phrase must be something that returns actual buyable products when searched (e.g. "GERD friendly mints", "natural sugar breath mints", "sugar free mints", "ginger candy", "low sodium oats", "whole grain biscuits"). Match these directly to your recommendations: if you recommend "look for GERD-friendly mints" or "natural alternatives", include exact search terms like "GERD friendly mints" and "natural breath mints". Every recommendation that suggests a product type must have at least one corresponding entry in suggestedProductSearches. Use 2-5 words per phrase. No generic advice—only product search terms that lead to purchase links.

Respond ONLY with valid JSON in this exact shape (no markdown, no extra text):
{
  "productName": "string",
  "ingredients": ["string"],
  "riskLevel": "low"|"medium"|"high",
  "riskSummary": "string",
  "ingredientInsights": [
    { "name": "string", "category": "safe"|"caution"|"harmful", "explanation": "string", "reason": "string (optional)" }
  ],
  "recommendations": ["string"],
  "suggestedProductSearches": ["string", "string", ...]
}`;

export async function extractTextFromImage(base64Image: string): Promise<string> {
  if (!genAI) throw new Error("Gemini API not configured");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const match = base64Image.match(/^data:(image\/\w+);base64,/);
  const mimeType = (match && match[1]) || "image/jpeg";
  const imagePart = {
    inlineData: {
      data: base64Image.replace(/^data:image\/\w+;base64,/, ""),
      mimeType,
    },
  };
  const result = await model.generateContent([
    "Extract all text from this food label image exactly as it appears. Do not translate. Return only the raw text: ingredient list, nutrition facts, product name. Preserve line breaks. If you cannot read it, return 'Unable to read label'.",
    imagePart,
  ]);
  const response = result.response;
  const text = response.text();
  return text?.trim() ?? "Unable to read label";
}

export async function translateText(text: string): Promise<{ translatedText: string; detectedLanguage: string }> {
  if (!genAI) throw new Error("Gemini API not configured");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const prompt = `Identify the language of the following text and translate it to English.
  
  Text:
  ${text}
  
  Return ONLY valid JSON in this format:
  {
    "detectedLanguage": "language_code" (e.g. "hi", "ta", "en"),
    "translatedText": "english translation"
  }`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const cleaned = responseText.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback if JSON parsing fails
    return { translatedText: text, detectedLanguage: "unknown" };
  }
}

export async function analyzeIngredients(
  ingredientsText: string,
  productName: string,
  profile: UserProfileForAnalysis
): Promise<AnalysisResult> {
  if (!genAI) throw new Error("Gemini API not configured");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const profileStr = JSON.stringify(profile, null, 0);
  const prompt = `${SYSTEM_PROMPT}

User health profile:
${profileStr}

Product name: ${productName}

Ingredients or label text (may contain OCR errors; normalize and interpret):
${ingredientsText}

Return only the JSON object.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const cleaned = text.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(cleaned) as AnalysisResult;
  } catch {
    throw new Error("AI returned invalid JSON: " + (text?.slice(0, 200) ?? ""));
  }
  if (!parsed.riskLevel || !["low", "medium", "high"].includes(parsed.riskLevel)) {
    parsed.riskLevel = "medium";
  }
  if (!Array.isArray(parsed.ingredients)) parsed.ingredients = [];
  if (!Array.isArray(parsed.ingredientInsights)) parsed.ingredientInsights = [];
  if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];
  if (!Array.isArray(parsed.suggestedProductSearches)) parsed.suggestedProductSearches = [];
  return parsed;
}
