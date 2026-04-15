"use client";

import { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Barcode, Image, Type, Loader2, AlertCircle, Camera } from "lucide-react";
import { RiskBadge } from "@/components/RiskBadge";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/utils";
import { MARKETPLACES } from "@/lib/marketplaces";
import { ExternalLink } from "lucide-react";

const BarcodeScanner = dynamic(
  () => import("@/components/BarcodeScanner").then((mod) => ({ default: mod.BarcodeScanner })),
  { ssr: false }
);

type Tab = "barcode" | "upload" | "manual";

type AnalysisResult = {
  productName: string;
  ingredients: string[];
  riskLevel: RiskLevel;
  riskSummary: string;
  ingredientInsights: { name: string; category: string; explanation: string; reason?: string }[];
  recommendations: string[];
  suggestedProductSearches?: string[];
};

async function compressImage(file: File, maxPx = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxPx || height > maxPx) {
        if (width > height) { height = Math.round((height * maxPx) / width); width = maxPx; }
        else { width = Math.round((width * maxPx) / height); height = maxPx; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ScanPage() {
  const [tab, setTab] = useState<Tab>("barcode");
  const [barcode, setBarcode] = useState("");
  const [manualProduct, setManualProduct] = useState("");
  const [manualIngredients, setManualIngredients] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (JPEG, PNG).");
      return;
    }
    setImageFile(file);
    setError("");
    try {
      const compressed = await compressImage(file);
      setImagePreview(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  async function fetchBarcodeProduct(barcodeValue?: string) {
    const value = (barcodeValue ?? barcode).trim();
    if (!value) {
      setError("Enter a barcode number.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);
    setShowBarcodeScanner(false);
    try {
      const res = await fetch(`/api/barcode/${encodeURIComponent(value)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Product not found.");
        return;
      }
      await runAnalysis({
        productName: data.product.name,
        ingredientsText: data.product.ingredientsText ?? data.product.ingredients?.join(", "),
        ingredients: data.product.ingredients,
        barcode: data.product.barcode,
        source: "barcode",
      });
    } catch {
      setError("Failed to fetch product.");
    } finally {
      setLoading(false);
    }
  }

  function handleBarcodeScanned(decodedBarcode: string) {
    setBarcode(decodedBarcode);
    fetchBarcodeProduct(decodedBarcode);
  }

  async function runAnalysis(params: {
    productName: string;
    ingredientsText?: string;
    ingredients?: string[];
    imageBase64?: string;
    barcode?: string;
    source: "barcode" | "ocr" | "manual";
  }) {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Analysis failed.");
        return;
      }
      setResult(data.analysis);
    } catch {
      setError("Analysis failed.");
    } finally {
      setLoading(false);
    }
  }

  async function submitUpload() {
    if (!imageFile || !imagePreview) {
      setError("Select an image first.");
      return;
    }
    const productName = manualProduct.trim() || "Product from label";
    await runAnalysis({
      productName,
      imageBase64: imagePreview,
      source: "ocr",
    });
  }

  async function submitManual() {
    const name = manualProduct.trim();
    const ing = manualIngredients.trim();
    if (!name && !ing) {
      setError("Enter product name and/or ingredients.");
      return;
    }
    await runAnalysis({
      productName: name || "Unknown product",
      ingredientsText: ing,
      ingredients: ing ? ing.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean) : undefined,
      source: "manual",
    });
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "barcode", label: "Barcode", icon: Barcode },
    { id: "upload", label: "Label photo", icon: Image },
    { id: "manual", label: "Type ingredients", icon: Type },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Scan food</h1>
      <p className="mt-1 text-slate-600">
        Use barcode, upload a label image, or type ingredients to get a personalized risk analysis.
      </p>

      <div className="mt-6 flex gap-2 border-b border-slate-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 rounded-t-lg border border-b-0 px-4 py-2 text-sm font-medium transition-colors",
              tab === id
                ? "border-slate-300 bg-white text-primary-700 -mb-px"
                : "border-transparent text-slate-600 hover:bg-slate-100"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="card mt-0 rounded-t-none">
        {tab === "barcode" && (
          <div className="space-y-4">
            {showBarcodeScanner ? (
              <BarcodeScanner
                onScan={handleBarcodeScanned}
                onClose={() => setShowBarcodeScanner(false)}
              />
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setShowBarcodeScanner(true)}
                  className="btn-secondary flex w-full items-center justify-center gap-2 sm:w-auto"
                >
                  <Camera className="h-5 w-5" />
                  Scan barcode with camera
                </button>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex-1 border-t border-slate-200" />
                  or enter manually
                  <span className="flex-1 border-t border-slate-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Barcode</label>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="e.g. 3017620422003"
                    className="input mt-1 max-w-xs"
                    onKeyDown={(e) => e.key === "Enter" && fetchBarcodeProduct()}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fetchBarcodeProduct()}
                  className="btn-primary flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Fetch & analyze
                </button>
              </>
            )}
          </div>
        )}

        {tab === "upload" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Product name (optional)
              </label>
              <input
                type="text"
                value={manualProduct}
                onChange={(e) => setManualProduct(e.target.value)}
                placeholder="e.g. Oats cereal"
                className="input mt-1 max-w-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Food label image
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-primary-700"
              />
              {imagePreview && (
                <div className="mt-2 max-w-xs">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="rounded-lg border border-slate-200 object-contain max-h-48"
                  />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={submitUpload}
              className="btn-primary flex items-center gap-2"
              disabled={loading || !imageFile}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Extract & analyze
            </button>
          </div>
        )}

        {tab === "manual" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Product name</label>
              <input
                type="text"
                value={manualProduct}
                onChange={(e) => setManualProduct(e.target.value)}
                placeholder="e.g. Chocolate cookies"
                className="input mt-1 max-w-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Ingredients (comma or newline separated)
              </label>
              <textarea
                value={manualIngredients}
                onChange={(e) => setManualIngredients(e.target.value)}
                placeholder="e.g. Wheat flour, sugar, palm oil, E621, salt..."
                className="input mt-1 min-h-[120px]"
              />
            </div>
            <button
              type="button"
              onClick={submitManual}
              className="btn-primary flex items-center gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Analyze
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="mt-8 card space-y-6">
          <h2 className="text-lg font-semibold text-slate-900">Analysis result</h2>
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-700">{result.productName}</span>
            <RiskBadge riskLevel={result.riskLevel} />
          </div>
          <p className="text-slate-600">{result.riskSummary}</p>
          {result.ingredientInsights.length > 0 && (
            <div>
              <h3 className="font-medium text-slate-900">Ingredients</h3>
              <ul className="mt-2 space-y-2">
                {result.ingredientInsights.map((i, idx) => (
                  <li
                    key={idx}
                    className={cn(
                      "rounded-lg border p-3 text-sm",
                      i.category === "safe" && "border-green-200 bg-green-50 text-green-900",
                      i.category === "caution" && "border-amber-200 bg-amber-50 text-amber-900",
                      i.category === "harmful" && "border-red-200 bg-red-50 text-red-900"
                    )}
                  >
                    <span className="font-medium">{i.name}</span>
                    {i.category !== "safe" && (
                      <span className="ml-2 text-xs font-medium uppercase">({i.category})</span>
                    )}
                    <p className="mt-1 text-slate-700">{i.explanation}</p>
                    {i.reason && <p className="mt-0.5 text-xs opacity-90">{i.reason}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.recommendations.length > 0 && (
            <div>
              <h3 className="font-medium text-slate-900">Recommendations</h3>
              <ul className="mt-2 list-inside list-disc space-y-1 text-slate-600">
                {result.recommendations.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          )}
          {(result.suggestedProductSearches?.length ?? 0) > 0 && (
            <div className="rounded-xl border-2 border-primary-200 bg-primary-50/50 p-4">
              <h3 className="font-semibold text-slate-900">Buy suggested products</h3>
              <p className="mt-1 text-sm text-slate-600">
                These alternatives match our recommendations. Use the links below to buy from online stores:
              </p>
              <div className="mt-4 space-y-4">
                {result.suggestedProductSearches!.map((searchTerm, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="mb-3 font-medium text-slate-800">&quot;{searchTerm}&quot;</p>
                    <div className="flex flex-wrap gap-2">
                      {MARKETPLACES.map((mp) => (
                        <a
                          key={mp.name}
                          href={mp.searchUrl(searchTerm)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
                        >
                          <span>{mp.icon}</span>
                          <span>Buy on {mp.name}</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <p className="border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
            Product links are suggestions. Always check the label before purchase.
          </p>
        </div>
      )}
    </div>
  );
}
