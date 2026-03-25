import { BedrockRuntimeClient, ConverseCommand, Message, SystemContentBlock } from "@aws-sdk/client-bedrock-runtime";

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION || "us-east-1";

if (!accessKeyId || !secretAccessKey) {
  console.warn("AWS Credentials not set; AI features will fail.");
}

const bedrockClient = (accessKeyId && secretAccessKey)
  ? new BedrockRuntimeClient({
      region,
      credentials: { accessKeyId, secretAccessKey },
    })
  : null;

const MODEL_ID = process.env.BEDROCK_NOVA_PRO_ID || "amazon.nova-pro-v1:0";

export interface ChatMessage {
  role: "user" | "model";
  parts: [{ text: string }];
}

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

async function callBedrock(messages: Message[], systemPrompts?: SystemContentBlock[]) {
  if (!bedrockClient) throw new Error("AWS Bedrock API not configured");

  const command = new ConverseCommand({
    modelId: MODEL_ID,
    messages,
    system: systemPrompts,
  });

  const response = await bedrockClient.send(command);
  const text = response.output?.message?.content?.[0]?.text;
  if (!text) throw new Error("No text returned from Bedrock");
  return text;
}

function parseImageBase64(base64Image: string) {
  const match = base64Image.match(/^data:(image\/\w+);base64,/);
  const mimeType = (match && match[1]) || "image/jpeg";
  let format = "jpeg";
  if (mimeType.includes("png")) format = "png";
  if (mimeType.includes("gif")) format = "gif";
  if (mimeType.includes("webp")) format = "webp";

  const data = base64Image.replace(/^data:image\/\w+;base64,/, "");
  const bytes = Buffer.from(data, "base64");

  return { format: format as any, bytes };
}

export async function extractTextFromImage(base64Image: string): Promise<string> {
  const image = parseImageBase64(base64Image);
  const text = await callBedrock([
    {
      role: "user",
      content: [
        {
          image: {
            format: image.format,
            source: { bytes: image.bytes },
          },
        },
        {
          text: "Extract all text from this food label image exactly as it appears. Do not translate. Return only the raw text: ingredient list, nutrition facts, product name. Preserve line breaks. If you cannot read it, return 'Unable to read label'.",
        },
      ],
    },
  ]);
  return text?.trim() ?? "Unable to read label";
}

export async function translateText(text: string): Promise<{ translatedText: string; detectedLanguage: string }> {
  const prompt = `Identify the language of the following text and translate it to English.
  
  Text:
  ${text}
  
  Return ONLY valid JSON in this format:
  {
    "detectedLanguage": "language_code" (e.g. "hi", "ta", "en"),
    "translatedText": "english translation"
  }`;

  const responseText = await callBedrock([
    { role: "user", content: [{ text: prompt }] }
  ]);
  
  const cleaned = responseText.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return { translatedText: text, detectedLanguage: "unknown" };
  }
}

export async function analyzeIngredients(
  ingredientsText: string,
  productName: string,
  profile: UserProfileForAnalysis
): Promise<AnalysisResult> {
  const profileStr = JSON.stringify(profile, null, 0);
  const prompt = `User health profile:
${profileStr}

Product name: ${productName}

Ingredients or label text (may contain OCR errors; normalize and interpret):
${ingredientsText}

Return only the JSON object.`;

  const responseText = await callBedrock(
    [{ role: "user", content: [{ text: prompt }] }],
    [{ text: SYSTEM_PROMPT }]
  );

  const cleaned = responseText.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
  let parsed: AnalysisResult;
  try {
    parsed = JSON.parse(cleaned) as AnalysisResult;
  } catch {
    throw new Error("AI returned invalid JSON: " + (responseText?.slice(0, 200) ?? ""));
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

export function buildHealthChatbotSystemPrompt(profile: UserProfileForAnalysis): string {
  const age = profile.age ?? "unknown";
  const gender = "Not specified";
  const conditions = profile.medicalConditions.length > 0 ? profile.medicalConditions.join(", ") : "None";
  const allergies = profile.allergies.length > 0 ? profile.allergies.join(", ") : "None";
  const diet = profile.dietaryPreference ?? "Non-Vegetarian";
  const notes = profile.additionalNotes ?? "None";

  return `You are NutriSafe Health AI, a safe, personalized, and practical health, diet, and lifestyle assistant.

🔒 STRICT RULES:
1. Do NOT provide medical diagnosis or prescribe medicines.
2. Always include a soft disclaimer when health risks are mentioned.
3. Keep responses simple, actionable, and structured.
4. Prefer bullet points over long paragraphs.
5. If unsure, say "consult a healthcare professional".
6. Never recommend specific prescription drugs. Only general OTC options where safe.

👤 USER HEALTH PROFILE:
- Age: ${age}
- Gender: ${gender}
- Medical Conditions: ${conditions}
- Allergies: ${allergies}
- Dietary Preference: ${diet}
- Additional Notes: ${notes}

🧠 YOUR CAPABILITIES:
1. 🩺 Symptom Guidance (Non-diagnostic) — suggest possible general causes, basic care tips, and warning signs.
2. 🥗 Nutrition & Diet Planning — suggest daily meals, calorie intake, protein/carb/fat balance.
3. 📊 Health Calculations — calculate BMI, estimate TDEE, suggest improvements.
4. ❓ General Health Q&A — hydration, vitamins, sleep, fitness in simple terms.
5. 🍽 Meal Recommendations — based on user goal, calorie target, diet preference, and budget.
6. 🖼 Food Analysis — if user describes a food/meal, estimate calories and suggest healthier alternatives.

📦 ALWAYS structure your responses EXACTLY like this:

👉 **Summary:**
(short direct answer — 1-2 sentences)

👉 **Details:**
(bullet points with relevant information)

👉 **Recommendation:**
(clear actionable steps — numbered list)

👉 **Tip (Optional):**
(one extra useful suggestion if relevant)

⚠️ **Disclaimer:** *This is general health advice. Please consult a qualified healthcare professional for medical concerns.*

Be warm, friendly, and concise. Tailor advice to the user's profile above.`;
}

export async function chatWithHealthBot(
  message: string,
  history: ChatMessage[],
  profile: UserProfileForAnalysis,
  imageBase64?: string
): Promise<string> {
  const messages: Message[] = history.map((m) => {
    // Both user and model roles exist in Bedrock, map user/assistant
    const role = m.role === "model" ? "assistant" : "user";
    return {
      role,
      content: [{ text: m.parts[0].text }]
    };
  });

  const userContent: any[] = [];
  if (imageBase64) {
    const image = parseImageBase64(imageBase64);
    userContent.push({
      image: {
        format: image.format,
        source: { bytes: image.bytes },
      },
    });
    userContent.push({
      text: message.trim() ? message : "Please analyse this food/meal image. Estimate the calories, nutritional value, and suggest healthier alternatives if applicable.",
    });
  } else {
    userContent.push({ text: message });
  }

  messages.push({
    role: "user",
    content: userContent
  });

  return await callBedrock(messages, [{ text: buildHealthChatbotSystemPrompt(profile) }]);
}

// ─── Diet & Workout Plan Generator ───────────────────────────────────────────

export interface DietPlanInput {
  age: number;
  gender: string;
  height: number;
  weight: number;
  goal: string;
  activityLevel: string;
  dietPreference: string;
  workoutLevel: string;
  mealsPerDay: number;
  workoutTime: number;
  medicalConditions: string[];
  allergies: string[];
  additionalNotes?: string;
  customRequest?: string;
}

export async function generateDietAndWorkoutPlan(input: DietPlanInput): Promise<string> {
  const conditions = input.medicalConditions.length > 0 ? input.medicalConditions.join(", ") : "None";
  const allergies = input.allergies.length > 0 ? input.allergies.join(", ") : "None";
  const notes = input.additionalNotes ?? "None";
  const customReq = input.customRequest?.trim() ?? "";

  const prompt = `You are NutriSafe Health AI — a certified nutritionist and personal trainer assistant.
Your job is to create a highly personalized, practical, and budget-friendly diet and workout plan.

🔒 RULES:
- Do NOT give medical advice or prescriptions.
- Prefer Indian food options and ingredients where possible.
- Keep workouts beginner-friendly unless workout level is intermediate/advanced.
- Use simple, clear language.
- Always add a disclaimer at the end.

👤 USER PROFILE:
- Age: ${input.age} years
- Gender: ${input.gender}
- Height: ${input.height} cm
- Weight: ${input.weight} kg
- Goal: ${input.goal}
- Activity Level: ${input.activityLevel}
- Diet Preference: ${input.dietPreference}
- Workout Level: ${input.workoutLevel}
- Meals per day: ${input.mealsPerDay}
- Workout Time Available: ${input.workoutTime} minutes/session
- Medical Conditions: ${conditions}
- Allergies: ${allergies}
- Additional Notes: ${notes}
${customReq ? `- Special Request: ${customReq}` : ""}

🧠 GENERATE THE FOLLOWING (use exactly these section headers):

---
## 📊 Health Summary
Calculate:
- BMI (with category: Underweight/Normal/Overweight/Obese)
- BMR (Basal Metabolic Rate)
- TDEE (Total Daily Energy Expenditure)
- Goal-based daily calorie target (deficit or surplus)

---
## 🍽️ Diet Plan (1 Full Day)
For each of the ${input.mealsPerDay} meals, provide:
- Meal name
- Food items (Indian options preferred, budget-friendly)
- Approximate calories
- Key nutrients (protein, carbs, fat)

---
## 🛒 Grocery List
Simple list of ingredients needed for the day's meals. Group by category (Grains, Proteins, Vegetables, Dairy/Alternatives, Others).

---
## 💪 Workout Plan
- Warm-up (5 min)
- Main workout (${input.workoutTime - 10} min) with exercises, sets, reps
- Cool-down (5 min)
Tailor intensity to: ${input.workoutLevel} level.

---
## 📅 Weekly Plan (Mon–Sun)
One line per day showing: workout type + focus area + diet focus.

---
## 💡 Tips
3–5 practical tips based on the user's goal and profile.

---
## ⚠️ Disclaimer
"This is general fitness and nutrition advice. Consult a qualified healthcare professional or certified nutritionist before making major changes to your diet or exercise routine."

Format each section clearly. Use bullet points. Keep it practical and motivating.`;

  return await callBedrock([{ role: "user", content: [{ text: prompt }] }]);
}
