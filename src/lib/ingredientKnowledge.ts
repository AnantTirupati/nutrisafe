import { connectDB } from "./db";
import { IngredientKnowledge } from "@/models/IngredientKnowledge";

/**
 * Looks up any candidate ingredient names against the curated
 * IngredientKnowledge reference table and returns a plain-text context block
 * to inject into the analysis prompt, so the model prefers a reviewed answer
 * over improvising one from scratch for ingredients we already have a
 * consistent, correctable description for.
 *
 * Substring-matched in JS rather than as a MongoDB query: the reference
 * table is small today (a few dozen entries at most). Revisit with a
 * text-indexed query if it grows into the hundreds+.
 */
export async function lookupKnownIngredients(candidateNames: string[]): Promise<string> {
  const candidates = candidateNames.map((n) => n.toLowerCase().trim()).filter(Boolean);
  if (candidates.length === 0) return "";

  await connectDB();
  const allKnown = await IngredientKnowledge.find({}).lean();
  if (allKnown.length === 0) return "";

  const matched = allKnown.filter((doc) => {
    const terms = [doc.name, ...(doc.aliases ?? [])];
    return candidates.some((c) => terms.some((t) => c.includes(t) || t.includes(c)));
  });

  if (matched.length === 0) return "";

  return matched
    .map((d) => {
      const concerns = d.concerns?.length ? ` Concerns: ${d.concerns.join(" ")}` : "";
      const eNum = d.eNumber ? ` (${d.eNumber})` : "";
      return `- ${d.name}${eNum}: ${d.description}${concerns}`;
    })
    .join("\n");
}
