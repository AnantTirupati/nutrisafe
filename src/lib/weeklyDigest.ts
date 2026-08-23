import { connectDB } from "./db";
import { User } from "@/models/User";
import { ScanHistory } from "@/models/ScanHistory";

export interface WeeklyDigestData {
  userId: string;
  email: string;
  name?: string | null;
  periodStart: Date;
  periodEnd: Date;
  totalScans: number;
  goodFitCount: number;
  cautionCount: number;
  notRecommendedCount: number;
  topSafeFoods: string[];
}

/** Computes one user's last-7-days activity summary — the same shape of data the dashboard already shows, windowed to a week. */
export async function buildWeeklyDigest(userId: string): Promise<WeeklyDigestData | null> {
  await connectDB();
  const user = await User.findById(userId).lean();
  if (!user) return null;

  const periodEnd = new Date();
  const periodStart = new Date(periodEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

  const scans = await ScanHistory.find({
    userId,
    createdAt: { $gte: periodStart, $lte: periodEnd },
  })
    .sort({ createdAt: -1 })
    .lean();

  const goodFitCount = scans.filter((s) => s.riskLevel === "low").length;
  const cautionCount = scans.filter((s) => s.riskLevel === "medium").length;
  const notRecommendedCount = scans.filter((s) => s.riskLevel === "high").length;

  const topSafeFoods = scans
    .filter((s) => s.riskLevel === "low")
    .slice(0, 3)
    .map((s) => s.productName);

  return {
    userId,
    email: user.email,
    name: user.name,
    periodStart,
    periodEnd,
    totalScans: scans.length,
    goodFitCount,
    cautionCount,
    notRecommendedCount,
    topSafeFoods,
  };
}

/** Renders the digest as plain text. Swap/extend this for an HTML email template once a provider is wired up. */
export function renderDigestText(data: WeeklyDigestData): string {
  const greeting = `Hi${data.name ? ` ${data.name}` : ""},`;

  if (data.totalScans === 0) {
    return `${greeting}\n\nYou didn't log any scans this week. Next time you pick up something packaged, a NutriSafe check only takes a few seconds.`;
  }

  const lines = [
    `${greeting} here's your week on NutriSafe:`,
    "",
    `${data.totalScans} scan${data.totalScans === 1 ? "" : "s"} — ${data.goodFitCount} Good Fit, ${data.cautionCount} Use Caution, ${data.notRecommendedCount} Not Recommended.`,
  ];

  if (data.topSafeFoods.length > 0) {
    lines.push("", `Recent safe finds: ${data.topSafeFoods.join(", ")}.`);
  }

  return lines.join("\n");
}
