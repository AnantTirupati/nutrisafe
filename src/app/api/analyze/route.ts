import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { HealthProfile } from "@/models/HealthProfile";
import { FoodProduct } from "@/models/FoodProduct";
import { ScanHistory } from "@/models/ScanHistory";
import { authOptions } from "@/lib/auth";
import {
  extractTextFromImage,
  analyzeIngredients,
  translateText,
  looksLikeEnglishOrLatin,
  type UserProfileForAnalysis,
} from "@/lib/gemini";
import { checkAndConsumeUsage } from "@/lib/usage";
import { applySafetyRules } from "@/lib/allergySafety";
import { lookupKnownIngredients } from "@/lib/ingredientKnowledge";
import { checkForReformulation } from "@/lib/reformulationCheck";
import { isPremiumActive } from "@/lib/premium";
import { z } from "zod";

const AnalyzeSchema = z.object({
  productName: z.string().min(1),
  ingredientsText: z.string().optional(),
  ingredients: z.array(z.string()).optional(),
  imageBase64: z.string().optional(),
  barcode: z.string().optional(),
  source: z.enum(["barcode", "ocr", "manual"]),
});

function normalizeIngredients(text: string): string[] {
  return text
    .split(/[,;()\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = AnalyzeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { productName, ingredientsText, ingredients, imageBase64, barcode, source } =
      parsed.data;

    await connectDB();
    const premium = await isPremiumActive(session.user.id);
    const usage = await checkAndConsumeUsage(session.user.id, "scan", premium);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: `You've reached your scan limit for today (${usage.limit}/day).${
            premium ? "" : " Upgrade to Premium for a higher limit."
          }`,
        },
        { status: 429 }
      );
    }

    let finalText = ingredientsText ?? "";
    let extractedFromImage = false;

    if (imageBase64) {
      const ocrText = await extractTextFromImage(imageBase64);
      extractedFromImage = true;
      finalText = ocrText !== "Unable to read label" ? ocrText : finalText;
    }

    // Skip the translation call entirely when the text is already English/Latin-script —
    // it's a full extra AI call for no benefit on the common case.
    const sourceText = finalText || productName;
    const translatedText = looksLikeEnglishOrLatin(sourceText)
      ? sourceText
      : (await translateText(sourceText)).translatedText;

    // Use translated text for normalization and analysis
    const ingredientsList =
      ingredients && ingredients.length > 0
        ? ingredients
        : normalizeIngredients(translatedText); // Normalize the English text

    const combinedText =
      ingredientsList.length > 0
        ? ingredientsList.join(", ")
        : translatedText;

    let profileDoc = await HealthProfile.findOne({
      userId: session.user.id,
    }).lean();
    if (!profileDoc) {
      // Create default profile so analysis can proceed
      const newProfile = await HealthProfile.create({
        userId: session.user.id,
        medicalConditions: [],
        allergies: [],
        dietaryPreference: "Non-Vegetarian",
      });
      profileDoc = newProfile.toObject();
    }

    const profile: UserProfileForAnalysis = {
      age: profileDoc.age,
      medicalConditions: profileDoc.medicalConditions ?? [],
      allergies: profileDoc.allergies ?? [],
      dietaryPreference: profileDoc.dietaryPreference ?? "Non-Vegetarian",
      preferredLanguage: profileDoc.preferredLanguage ?? "English",
      additionalNotes: profileDoc.additionalNotes ?? undefined,
    };

    const knownIngredientsContext = await lookupKnownIngredients(ingredientsList);
    const rawAnalysis = await analyzeIngredients(
      combinedText, // Analyze the English text
      productName,
      profile,
      knownIngredientsContext
    );
    let analysis = applySafetyRules(rawAnalysis, profile.allergies, combinedText);

    const finalIngredients = analysis.ingredients?.length ? analysis.ingredients : ingredientsList;
    const reformulation = await checkForReformulation(barcode, finalIngredients, session.user.id);
    if (reformulation.changed) {
      const lastSeen = reformulation.lastSeenAt
        ? new Date(reformulation.lastSeenAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })
        : "a previous scan";
      analysis = {
        ...analysis,
        formulationAlert: reformulation.userPreviouslyScanned
          ? `This product's ingredients have changed since you last scanned it (${lastSeen}). This is a fresh analysis of the current formulation — don't rely on a past result for this product.`
          : `This product's ingredients have changed since it was last scanned (${lastSeen}, by another user). This is a fresh analysis of the current formulation.`,
      };
    }

    const product = await FoodProduct.create({
      name: analysis.productName || productName,
      ingredientsText: finalText, // Store original raw text
      ingredients: analysis.ingredients?.length ? analysis.ingredients : ingredientsList, // Store analyzed English ingredients
      barcode: barcode ?? undefined,
      source,
    });

    const scan = await ScanHistory.create({
      userId: session.user.id,
      productId: product._id,
      productName: analysis.productName || productName,
      ingredientsText: finalText, // Store original raw text
      ingredients: analysis.ingredients?.length ? analysis.ingredients : ingredientsList, // Store analyzed English ingredients
      riskLevel: analysis.riskLevel,
      riskSummary: analysis.riskSummary,
      ingredientInsights: analysis.ingredientInsights ?? [],
      recommendations: analysis.recommendations ?? [],
      barcode: barcode ?? undefined,
      source,
    });

    return NextResponse.json({
      analysis: {
        productName: analysis.productName,
        ingredients: analysis.ingredients,
        riskLevel: analysis.riskLevel,
        riskSummary: analysis.riskSummary,
        ingredientInsights: analysis.ingredientInsights,
        recommendations: analysis.recommendations,
        suggestedProductSearches: analysis.suggestedProductSearches ?? [],
        formulationAlert: analysis.formulationAlert,
      },
      scanId: scan._id.toString(),
      productId: product._id.toString(),
      extractedFromImage: !!imageBase64 && extractedFromImage,
    });
  } catch (e) {
    console.error("Analyze error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
