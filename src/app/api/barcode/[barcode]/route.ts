import { NextResponse } from "next/server";

const OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org/api/v2/product";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ barcode: string }> }
) {
  const { barcode } = await params;
  if (!barcode || !/^\d+$/.test(barcode)) {
    return NextResponse.json({ error: "Invalid barcode" }, { status: 400 });
  }
  try {
    const res = await fetch(`${OPEN_FOOD_FACTS_URL}/${barcode}.json`, {
      headers: { "User-Agent": "NutriSafe/1.0" },
    });
    const data = await res.json();
    if (data.status === 0 || !data.product) {
      return NextResponse.json(
        { error: "Product not found", product: null },
        { status: 404 }
      );
    }
    const p = data.product;
    const ingredients: string[] = [];
    if (p.ingredients_text) {
      ingredients.push(
        ...(p.ingredients_text
          .split(/[,;()]+/)
          .map((s: string) => s.trim())
          .filter(Boolean) ?? [])
      );
    }
    if (p.ingredients && Array.isArray(p.ingredients)) {
      for (const ing of p.ingredients) {
        if (ing.text) ingredients.push(ing.text.trim());
      }
    }
    const product = {
      barcode: p.code,
      name: p.product_name ?? p.product_name_en ?? "Unknown Product",
      brand: p.brands ?? null,
      ingredientsText: p.ingredients_text ?? null,
      ingredients: [...new Set(ingredients)].filter(Boolean),
      imageUrl: p.image_url ?? p.image_front_url ?? null,
      nutriments: p.nutriments ?? {},
    };
    return NextResponse.json({ product });
  } catch (e) {
    console.error("Barcode fetch error:", e);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
