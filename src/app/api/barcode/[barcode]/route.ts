import { NextResponse } from "next/server";
import { identifyProductFromSearch } from "@/lib/gemini";
import { searchProductOnWeb } from "@/lib/search";

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
    // 1. Try Open Food Facts first
    const res = await fetch(`${OPEN_FOOD_FACTS_URL}/${barcode}.json`, {
      headers: { "User-Agent": "NutriSafe/1.0" },
    });
    
    if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
      const data = await res.json();
      if (data.status === 1 && data.product) {
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
        return NextResponse.json({
          product: {
            barcode: p.code,
            name: p.product_name ?? p.product_name_en ?? "Unknown Product",
            brand: p.brands ?? null,
            ingredientsText: p.ingredients_text ?? null,
            ingredients: [...new Set(ingredients)].filter(Boolean),
            imageUrl: p.image_url ?? p.image_front_url ?? null,
            nutriments: p.nutriments ?? {},
          },
        });
      }
    }

    // 2. Fallback to Search API + Nova Pro
    console.log(`Barcode ${barcode} not found in OFF. Triggering search fallback...`);
    const searchContext = await searchProductOnWeb(barcode);
    console.log(`Search Context for ${barcode}:`, searchContext.slice(0, 300) + "...");
    
    if (!searchContext) {
      return NextResponse.json(
        { error: "Product not found on web or database", product: null },
        { status: 404 }
      );
    }

    const identifiedProduct = await identifyProductFromSearch(barcode, searchContext);

    if (!identifiedProduct.productName) {
        return NextResponse.json(
            { error: "Could not identify product from search results", product: null },
            { status: 404 }
        );
    }

    return NextResponse.json({
      product: {
        barcode: barcode,
        name: identifiedProduct.productName,
        brand: identifiedProduct.brand ?? "Unknown Brand",
        ingredientsText: identifiedProduct.ingredientsText ?? null,
        ingredients: identifiedProduct.ingredients ?? [],
        imageUrl: null, 
        nutriments: {},
        source: "search_ai"
      },
    });

  } catch (e) {
    console.error("Barcode fallback error:", e);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
