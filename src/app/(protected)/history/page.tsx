"use client";

import { useEffect, useState } from "react";
import { RiskBadge } from "@/components/RiskBadge";
import { Loader2, History as HistoryIcon } from "lucide-react";
import type { RiskLevel } from "@/lib/utils";
import Link from "next/link";

type HistoryItem = {
  id: string;
  productName: string;
  riskLevel: RiskLevel;
  riskSummary: string;
  source: string;
  barcode?: string | null;
  createdAt: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/history?limit=50");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history ?? []);
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
      <h1 className="text-2xl font-bold text-slate-900">Scan history</h1>
      <p className="mt-1 text-slate-600">
        Past scans with risk levels. Use &quot;Safe for me&quot; to see only low-risk items.
      </p>
      {history.length === 0 ? (
        <div className="card mt-8 flex flex-col items-center justify-center py-12 text-center">
          <HistoryIcon className="h-12 w-12 text-slate-300" />
          <p className="mt-4 font-medium text-slate-700">No scans yet</p>
          <p className="mt-1 text-sm text-slate-600">
            Scan a barcode, upload a label, or type ingredients to see results here.
          </p>
          <Link href="/scan" className="btn-primary mt-4">
            Scan food
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {history.map((item) => (
            <li key={item.id} className="card flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">{item.productName}</p>
                <p className="mt-0.5 text-sm text-slate-600 line-clamp-2">{item.riskSummary}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(item.createdAt).toLocaleString()} · {item.source}
                  {item.barcode && ` · ${item.barcode}`}
                </p>
              </div>
              <RiskBadge riskLevel={item.riskLevel} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
