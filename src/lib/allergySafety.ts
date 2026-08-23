import type { AnalysisResult } from "./gemini";

/**
 * Deterministic backstop for declared allergens. The AI analysis is
 * probabilistic — this is not. If a user has declared an allergy and a
 * matching term shows up anywhere in the ingredient text, the verdict is
 * forced to "high" regardless of what the model itself concluded. This is
 * intentionally conservative: false positives (flagging something borderline)
 * are an acceptable cost for a food-safety product; false negatives on a
 * declared allergy are not.
 */
const ALLERGEN_ALIASES: Record<string, string[]> = {
  Nuts: ["nut", "almond", "cashew", "walnut", "hazelnut", "pistachio", "pecan", "macadamia", "brazil nut"],
  Peanuts: ["peanut", "groundnut", "arachis"],
  "Tree Nuts": ["almond", "cashew", "walnut", "hazelnut", "pistachio", "pecan", "macadamia", "brazil nut"],
  Gluten: ["wheat", "barley", "rye", "malt", "semolina", "gluten", "spelt", "triticale"],
  Lactose: ["lactose", "milk", "whey", "cream", "butter", "cheese", "curd", "ghee", "casein"],
  Dairy: ["milk", "whey", "casein", "cream", "butter", "cheese", "curd", "ghee", "lactose"],
  Soy: ["soy", "soya", "soybean", "tofu"],
  Eggs: ["egg", "albumin", "ovalbumin", "mayonnaise"],
  Shellfish: ["shrimp", "prawn", "crab", "lobster", "crustacean", "shellfish"],
  Fish: ["fish", "anchovy", "cod", "salmon", "tuna"],
  Sesame: ["sesame", "tahini", "til"],
  Sulfites: ["sulfite", "sulphite", "e220", "e221", "e222", "e223", "e224", "e228"],
};

export interface AllergenHit {
  allergy: string;
  matchedTerm: string;
}

export function detectAllergenMatches(allergies: string[], text: string): AllergenHit[] {
  const lower = text.toLowerCase();
  const hits: AllergenHit[] = [];
  for (const allergy of allergies) {
    const aliases = ALLERGEN_ALIASES[allergy];
    if (!aliases) continue; // "Other" or an unrecognized value — nothing deterministic to match on
    const term = aliases.find((t) => lower.includes(t));
    if (term) hits.push({ allergy, matchedTerm: term });
  }
  return hits;
}

/**
 * Applies the allergen backstop plus an internal-consistency check (don't let
 * the overall verdict undersell a "harmful"/"caution" ingredient the model
 * itself already flagged). Returns a new object — does not mutate the input.
 */
export function applySafetyRules(
  analysis: AnalysisResult,
  allergies: string[],
  rawIngredientsText: string
): AnalysisResult {
  const result: AnalysisResult = {
    ...analysis,
    ingredientInsights: [...analysis.ingredientInsights],
  };

  const combinedText = `${rawIngredientsText} ${result.ingredients.join(" ")}`;
  const allergenHits = detectAllergenMatches(allergies, combinedText);

  for (const hit of allergenHits) {
    const alreadyFlagged = result.ingredientInsights.some(
      (i) => i.category === "harmful" && i.name.toLowerCase().includes(hit.matchedTerm)
    );
    if (!alreadyFlagged) {
      result.ingredientInsights.push({
        name: hit.matchedTerm,
        category: "harmful",
        explanation: `Detected "${hit.matchedTerm}" in the ingredients, which matches your declared ${hit.allergy} allergy.`,
        reason: `You've listed ${hit.allergy} as an allergy — this product may not be safe for you.`,
      });
    }
  }

  if (allergenHits.length > 0) {
    result.riskLevel = "high";
  }

  const hasHarmful = result.ingredientInsights.some((i) => i.category === "harmful");
  const hasCaution = result.ingredientInsights.some((i) => i.category === "caution");
  if (hasHarmful && result.riskLevel !== "high") {
    result.riskLevel = "high";
  } else if (hasCaution && result.riskLevel === "low") {
    result.riskLevel = "medium";
  }

  return result;
}
