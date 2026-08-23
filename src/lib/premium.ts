import { User } from "@/models/User";

export interface PremiumStatus {
  active: boolean;
  /** Null for a legacy lifetime grant (grandfathered, never expires) or if not Premium at all. */
  expiresAt: Date | null;
}

/**
 * Checks Premium status against the database directly, not the session's
 * cached `isPremium` flag. The JWT session can be up to 30 days stale (it's
 * only refreshed on sign-in or an explicit client-side session.update()) —
 * fine when Premium was a permanent lifetime flag, but wrong now that it's
 * time-bound: a stale session could otherwise keep granting Premium access
 * for weeks after it actually lapsed. Use this for server-side enforcement;
 * the session flag is still fine for UI-only decisions (showing a badge,
 * blurring a preview) where a few seconds of staleness doesn't matter.
 */
export async function getPremiumStatus(userId: string): Promise<PremiumStatus> {
  const user = await User.findById(userId).select("isPremium premiumExpiresAt").lean();
  if (!user?.isPremium) return { active: false, expiresAt: null };
  if (!user.premiumExpiresAt) return { active: true, expiresAt: null }; // legacy lifetime grant
  const expiresAt = new Date(user.premiumExpiresAt);
  return { active: expiresAt.getTime() > Date.now(), expiresAt };
}

export async function isPremiumActive(userId: string): Promise<boolean> {
  return (await getPremiumStatus(userId)).active;
}
