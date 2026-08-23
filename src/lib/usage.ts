import { UsageCounter, type UsageAction } from "@/models/UsageCounter";

/**
 * Placeholder caps. Tune once real AWS Bedrock cost-per-call data is pulled
 * from Cost Explorer (see MARKET.md) — these exist to stop unbounded free
 * usage, not to be a precisely-tuned billing meter. These are also the
 * numbers documented, verbatim, in /legal/fair-usage — keep the two in sync
 * if either changes.
 */
const LIMITS: Record<UsageAction, { free: number; premium: number; window: "day" | "month" }> = {
  scan: { free: 10, premium: 60, window: "day" },
  chat: { free: 15, premium: 60, window: "day" },
  dietPlan: { free: 0, premium: 10, window: "month" },
};

const ACTION_LABELS: Record<UsageAction, string> = {
  scan: "Scans",
  chat: "AI chat messages",
  dietPlan: "Diet plan generations",
};

function periodKey(window: "day" | "month"): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  if (window === "month") return `${y}-${m}`;
  const d = String(now.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** When the current window's quota resets, in UTC. */
function resetsAt(window: "day" | "month"): Date {
  const now = new Date();
  if (window === "month") {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
}

export interface UsageCheckResult {
  allowed: boolean;
  limit: number;
  used: number;
  window: "day" | "month";
}

export interface UsageStatus {
  action: UsageAction;
  label: string;
  used: number;
  limit: number;
  remaining: number;
  window: "day" | "month";
  resetsAt: Date;
}

/**
 * Read-only usage snapshot for all metered actions — does NOT increment
 * anything. Used to show a user their real-time quota (dashboard, scan page)
 * without that lookup itself counting as usage.
 */
export async function getUsageSummary(userId: string, isPremium: boolean): Promise<UsageStatus[]> {
  const actions = Object.keys(LIMITS) as UsageAction[];
  const results = await Promise.all(
    actions.map(async (action) => {
      const { free, premium, window } = LIMITS[action];
      const limit = isPremium ? premium : free;
      const period = periodKey(window);
      const doc = await UsageCounter.findOne({ userId, action, period }).lean();
      const used = doc?.count ?? 0;
      return {
        action,
        label: ACTION_LABELS[action],
        used: Math.min(used, limit), // don't show a used count past the cap even if a rejected attempt bumped it further
        limit,
        remaining: Math.max(limit - used, 0),
        window,
        resetsAt: resetsAt(window),
      };
    })
  );
  return results;
}

/**
 * Atomically increments the caller's usage counter for this action/period and
 * reports whether they were still under the cap. Call this AFTER connectDB()
 * and BEFORE doing any expensive AI work — reject first, spend nothing on a
 * request that's over the limit.
 */
export async function checkAndConsumeUsage(
  userId: string,
  action: UsageAction,
  isPremium: boolean
): Promise<UsageCheckResult> {
  const { free, premium, window } = LIMITS[action];
  const limit = isPremium ? premium : free;

  if (limit <= 0) {
    return { allowed: false, limit, used: 0, window };
  }

  const period = periodKey(window);
  const result = await UsageCounter.findOneAndUpdate(
    { userId, action, period },
    { $inc: { count: 1 } },
    { new: true, upsert: true }
  );

  return { allowed: result.count <= limit, limit, used: result.count, window };
}
