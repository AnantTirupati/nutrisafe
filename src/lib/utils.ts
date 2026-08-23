import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type RiskLevel = "low" | "medium" | "high";

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Good Fit",
  medium: "Use Caution",
  high: "Not Recommended",
};
