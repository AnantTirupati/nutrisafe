import Link from "next/link";
import {
  Scan,
  History as HistoryIcon,
  Heart,
  User,
  Salad,
  ArrowUpRight,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ClipboardList,
  Crown,
} from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { HealthProfile } from "@/models/HealthProfile";
import { ScanHistory, type RiskLevel } from "@/models/ScanHistory";
import { DietPlan } from "@/models/DietPlan";
import { UsageCounter } from "@/models/UsageCounter";
import { RiskBadge } from "@/components/RiskBadge";
import { getUsageSummary } from "@/lib/usage";
import { isPremiumActive } from "@/lib/premium";
import { OnboardingChecklist } from "@/components/ui/OnboardingChecklist";

const RISK_TONE: Record<RiskLevel, { bg: string; bar: string; text: string }> = {
  low: { bg: "bg-green-50", bar: "bg-green-500", text: "text-green-700" },
  medium: { bg: "bg-amber-50", bar: "bg-amber-500", text: "text-amber-700" },
  high: { bg: "bg-red-50", bar: "bg-red-500", text: "text-red-700" },
};

function StatTile({
  label,
  value,
  icon: Icon,
  tone = "slate",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  tone?: "slate" | "green" | "amber" | "red";
}) {
  const toneClasses: Record<string, string> = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center gap-4 shadow-sm">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${toneClasses[tone]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-3xl font-extrabold leading-none text-slate-900" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Outfit', sans-serif" }}>
          {value.toLocaleString()}
        </p>
        <p className="mt-1.5 text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  await connectDB();
  const isPremium = userId ? await isPremiumActive(userId) : false;
  const [profile, recentScans, totalScans, lowCount, mediumCount, highCount, savedPlans, recentSafeFoods, usage, hasChatted] = await Promise.all([
    HealthProfile.findOne({ userId }).lean(),
    ScanHistory.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    ScanHistory.countDocuments({ userId }),
    ScanHistory.countDocuments({ userId, riskLevel: "low" }),
    ScanHistory.countDocuments({ userId, riskLevel: "medium" }),
    ScanHistory.countDocuments({ userId, riskLevel: "high" }),
    DietPlan.countDocuments({ userId }),
    ScanHistory.find({ userId, riskLevel: "low" }).sort({ createdAt: -1 }).limit(3).lean(),
    getUsageSummary(userId as string, isPremium),
    UsageCounter.exists({ userId, action: "chat" }),
  ]);

  const conditions = profile?.medicalConditions ?? [];
  const allergies = profile?.allergies ?? [];
  const hasProfileMarkers = conditions.length > 0 || allergies.length > 0;

  const gettingStarted = [
    { done: hasProfileMarkers, label: "Add your conditions and allergies", href: "/profile" },
    { done: totalScans > 0, label: "Scan your first product", href: "/scan" },
    { done: !!hasChatted, label: "Ask the Health AI a question", href: "#", chatTrigger: true },
  ];
  const allStepsDone = gettingStarted.every((s) => s.done);

  const riskSegments: { level: RiskLevel; count: number; label: string }[] = [
    { level: "low", count: lowCount, label: "Good fit" },
    { level: "medium", count: mediumCount, label: "Use caution" },
    { level: "high", count: highCount, label: "Not recommended" },
  ];

  return (
    <div className="space-y-6">
      {!allStepsDone && <OnboardingChecklist steps={gettingStarted} />}

      {/* Stat tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Total Scans" value={totalScans} icon={ClipboardList} />
        <StatTile label="Safe Foods" value={lowCount} icon={ShieldCheck} tone="green" />
        <StatTile label="Use Caution" value={mediumCount} icon={AlertTriangle} tone="amber" />
        <StatTile label="Not Recommended" value={highCount} icon={ShieldAlert} tone="red" />
      </div>

      {/* Your Usage */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Your Usage</h2>
          <Link href="/legal/fair-usage" className="text-xs font-medium text-slate-400 hover:text-slate-600">
            Fair Usage Policy
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {usage.map((u) => {
            const pct = u.limit > 0 ? Math.min((u.used / u.limit) * 100, 100) : 100;
            const nearLimit = u.remaining === 0;
            return (
              <div key={u.action}>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-slate-700">{u.label}</span>
                  <span
                    className="text-sm font-semibold"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {u.limit > 0 ? (
                      <span className={nearLimit ? "text-red-600" : "text-slate-900"}>
                        {u.used}/{u.limit}
                      </span>
                    ) : (
                      <span className="text-slate-400">Premium only</span>
                    )}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={nearLimit ? "h-full bg-red-500" : "h-full bg-primary-500"}
                    style={{ width: `${u.limit > 0 ? pct : 0}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  {u.limit > 0
                    ? `Resets ${u.window === "day" ? "tomorrow" : "next month"}`
                    : isPremium
                      ? ""
                      : "Included with Premium"}
                </p>
              </div>
            );
          })}
        </div>
        {!isPremium && (
          <Link
            href="/premium"
            className="mt-5 flex items-center gap-1.5 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            <Crown className="h-4 w-4" />
            Upgrade to Premium for higher limits and diet plans
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Result Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Result Breakdown</h2>
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">All time</span>
          </div>
          {totalScans > 0 ? (
            <div className="mt-8 flex-1 flex flex-col justify-center">
              <div className="flex h-8 w-full overflow-hidden rounded-full bg-slate-100">
                {riskSegments.map(
                  (s) =>
                    s.count > 0 && (
                      <div
                        key={s.level}
                        className={RISK_TONE[s.level].bar}
                        style={{ width: `${(s.count / totalScans) * 100}%` }}
                        title={`${s.label}: ${s.count}`}
                      />
                    )
                )}
              </div>
              <div className="mt-8 flex flex-wrap justify-between gap-4 px-2">
                {riskSegments.map((s) => (
                  <div key={s.level} className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${RISK_TONE[s.level].bar}`} />
                      <span className="text-sm font-medium text-slate-600">{s.label}</span>
                    </div>
                    <span className="mt-2 text-3xl font-bold text-slate-900 ml-5" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {s.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              No scans yet — once you scan a few products, your results will show up here.
            </p>
          )}
        </div>

        {/* Safe Foods */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Safe Foods</h2>
            <Heart className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-1 text-3xl font-extrabold text-slate-900" style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Outfit', sans-serif" }}>
            {lowCount}
          </p>
          <p className="text-xs font-medium text-slate-500">products cleared for you</p>

          {recentSafeFoods.length > 0 ? (
            <ul className="mt-4 flex-1 space-y-2">
              {recentSafeFoods.map((item) => (
                <li key={item._id.toString()} className="truncate rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-800">
                  {item.productName}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 flex-1 text-sm text-slate-500">
              Low-risk products you scan will show up here.
            </p>
          )}

          <Link
            href="/scan#safe-foods"
            className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all safe foods
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Recent Scans</h2>
            {recentScans.length > 0 && (
              <Link href="/history" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
                View all
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          {recentScans.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {recentScans.map((scan) => (
                <li key={scan._id.toString()} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{scan.productName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {new Date(scan.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      · {scan.source}
                    </p>
                  </div>
                  <RiskBadge riskLevel={scan.riskLevel} className="shrink-0 whitespace-nowrap" />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <HistoryIcon className="h-10 w-10 text-slate-200" />
              <p className="mt-3 text-sm font-medium text-slate-700">No scans yet</p>
              <Link href="/scan" className="btn-primary mt-4 py-2 px-4 rounded-lg text-sm">
                Scan food
              </Link>
            </div>
          )}
        </div>

        {/* Health Profile */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Health Profile</h2>
            <Link href="/profile" className="text-sm font-medium text-primary-600 hover:text-primary-700">
              Edit
            </Link>
          </div>
          {hasProfileMarkers ? (
            <div className="space-y-4">
              {conditions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-slate-400" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Conditions</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {conditions.map((c: string) => (
                      <span key={c} className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {allergies.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-slate-400" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Allergies</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allergies.map((a: string) => (
                      <span key={a} className="rounded-lg bg-red-50 px-3 py-1 text-xs font-medium text-red-700 border border-red-100">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center">
              <User className="h-10 w-10 text-slate-200 mx-auto" />
              <p className="mt-3 text-sm text-slate-500">
                Add conditions and allergies for personalized scans.
              </p>
            </div>
          )}
        </div>

        {/* Decorative Highlight Card */}
        <div className="rounded-2xl bg-primary-700 p-6 text-white flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {savedPlans}
            </h2>
            <p className="text-primary-100 font-medium text-sm">Diet & Workout Plans Generated</p>
          </div>
          <div className="relative z-10 mt-6">
            <Link href="/diet-plan" className="inline-block bg-white text-primary-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">
              Generate New Plan
            </Link>
          </div>
          {/* Decorative Icon */}
          <Salad className="absolute -bottom-6 -right-6 h-40 w-40 text-primary-600 opacity-30" />
        </div>
      </div>
    </div>
  );
}
