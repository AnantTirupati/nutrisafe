"use client";

import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/lib/utils";

const styles: Record<RiskLevel, string> = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-red-100 text-red-800 border-red-200",
};

const labels: Record<RiskLevel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

export function RiskBadge({
  riskLevel,
  className,
}: {
  riskLevel: RiskLevel;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[riskLevel],
        className
      )}
    >
      {labels[riskLevel]}
    </span>
  );
}
