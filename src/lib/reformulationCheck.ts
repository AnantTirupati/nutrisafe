import { FoodProduct } from "@/models/FoodProduct";
import { ScanHistory } from "@/models/ScanHistory";

export interface ReformulationInfo {
  changed: boolean;
  userPreviouslyScanned: boolean;
  lastSeenAt?: Date;
  previousIngredients?: string[];
}

function normalizeSet(list: string[]): Set<string> {
  return new Set(list.map((s) => s.toLowerCase().trim()).filter(Boolean));
}

function setsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) if (!b.has(item)) return false;
  return true;
}

/**
 * Compares a freshly-scanned barcode's ingredients against the most recent
 * prior scan of the same barcode (by anyone). Ingredient formulations change
 * over time — this is what lets NutriSafe flag "this product isn't what it
 * used to be" instead of silently trusting a stale "Good Fit" verdict.
 */
export async function checkForReformulation(
  barcode: string | undefined,
  newIngredients: string[],
  userId: string
): Promise<ReformulationInfo> {
  if (!barcode || newIngredients.length === 0) {
    return { changed: false, userPreviouslyScanned: false };
  }

  const [previous, userScannedBefore] = await Promise.all([
    FoodProduct.findOne({ barcode }).sort({ createdAt: -1 }).lean(),
    ScanHistory.exists({ userId, barcode }),
  ]);

  if (!previous || !previous.ingredients?.length) {
    return { changed: false, userPreviouslyScanned: !!userScannedBefore };
  }

  const changed = !setsEqual(normalizeSet(previous.ingredients), normalizeSet(newIngredients));

  return {
    changed,
    userPreviouslyScanned: !!userScannedBefore,
    lastSeenAt: previous.createdAt,
    previousIngredients: previous.ingredients,
  };
}
