"use client";

import { useEffect, useState } from "react";
import { Loader2, Heart, Scan } from "lucide-react";
import Link from "next/link";

type SafeFoodItem = {
  id: string;
  productName: string;
  productId?: string;
  barcode?: string | null;
  source: string;
  createdAt: string;
};

export default function SafeFoodsPage() {
  const [safeFoods, setSafeFoods] = useState<SafeFoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/safe-foods?limit=50");
      if (res.ok) {
        const data = await res.json();
        setSafeFoods(data.safeFoods ?? []);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Safe for me</h1>
      <p className="mt-1 text-slate-600">
        Foods you&apos;ve scanned that were rated low risk for your profile.
      </p>
      {safeFoods.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center justify-center py-12 text-center">
          <Heart className="h-12 w-12 text-green-400" />
          <p className="mt-4 font-medium text-slate-700">No safe foods yet</p>
          <p className="mt-1 text-sm text-slate-600">
            When you scan products and they&apos;re low risk, they&apos;ll appear here.
          </p>
          <Link href="/scan" className="btn-primary mt-4 flex items-center gap-2">
            <Scan className="h-4 w-4" />
            Scan food
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {safeFoods.map((item) => (
            <li
              key={item.id}
              className="card flex items-center justify-between gap-4 border-green-100 bg-green-50/50"
            >
              <div>
                <p className="font-medium text-slate-900">{item.productName}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleString()} · {item.source}
                  {item.barcode && ` · ${item.barcode}`}
                </p>
              </div>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Low risk
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
