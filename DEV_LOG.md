# NutriSafe — Development Log

Chronological record of how the codebase got here, built from actual git history (`git log`) plus session work. Entries are facts, not narrative — dates and file counts for the early history come straight from `git log --shortstat`.

**Convention going forward: this file is append-only.** New work gets a new dated entry at the bottom — never rewrite or delete an earlier entry, even if later work supersedes it (note the supersession in the new entry instead, and link back). If a decision changes, the old entry stays as the record of what was true at the time.

---

## 2026-01-23 — Project start
Initial Next.js scaffold committed. Early commits briefly included `node_modules` in git (cleaned up later, see Mar 23).

## 2026-01-24 — Client scaffold added
`0efa688` "Fix: Add client folder to main repo" — 28 files, the App Router structure (`src/app`) lands.

## 2026-02-01 — Database connected
`1cb088b` "mongodb atlas" — `src/lib/db.ts` and the first Mongoose connection wired to Atlas.

## 2026-03-23 — Core feature build-out (single day)
Four commits landed the product's core loop in one sitting:
- `58f53d6` "chatbot and diet plan" — also the commit that finally removed the accidentally-committed `node_modules` (5,102 files, −1,022,406 lines).
- `beaa7ce` "feat: add saved diet plans feature (models, api, ui)" — `DietPlan` model, `/api/diet-plans*`, My Plans pages.
- `367e5c4` "feat: complete Razorpay premium gateway (UI, API, Data Layer integration)" — the one-time premium unlock flow that's still live today.

## 2026-03-25 — Razorpay tuning
`1bb08db` — small fix pass on the payment integration.

## 2026-03-26 — AI provider migration (Gemini → AWS Bedrock)
Three commits, same day:
- `5947566` **"Migrate from Gemini to AWS Bedrock Nova Pro and disable middleware for debugging."** This is the root cause of two things found and fixed later: (1) `src/middleware.ts`'s route matcher was left incomplete — `/diet-plan`, `/my-plans`, and `/premium` were never re-added after being disabled for debugging, leaving them reachable without auth until this was caught and fixed in this session. (2) the file is still named `src/lib/gemini.ts` and UI copy across the app still said "Gemini" for months after the actual provider became AWS Bedrock (Nova Pro for text, Qwen3-VL for vision) — also fixed this session.
- `1a3fc55` "changed the provider to nova" — 1,690 insertions, the Bedrock integration itself.
- `fc951cf` "Feat: Multi-language support, Search-Augmented Barcode ID with Serper, and Qwen OCR Integration" — the Serper web-search fallback for unrecognized barcodes, and Qwen3-VL OCR for label photos.

## 2026-04-15 — Last commit before this session
`b87806f` "fixes" — 6 files, small cleanup.

## 2026-08-23 — This session (uncommitted)
Everything below is in the working tree, not yet committed. Grouped by theme:

**Landing page**
- Unified 6 conflicting font families down to 2 (Outfit + Figtree); fixed the "NutriSafe" wordmark rendering in two different typefaces between nav and footer.
- Rewrote the pricing section — it advertised 3 fake USD monthly tiers including a "Family Guard" plan that has no corresponding feature anywhere in the codebase. Replaced with the one real ₹299 lifetime tier that actually exists (see `MARKET.md` — this itself is now flagged as needing to change).
- Fixed dead nav/footer links, a duplicate icon, a broken `color` prop on 4 icon components, a hero-text overlap risk on short viewports, and removed dead code.
- Removed false claims: "Talk to a Clinical Expert" (no such feature exists — it's an AI chatbot), "Clinically approved" (no certification exists), an unverifiable "thousands of users" claim, and a fabricated "S&A Labs Inc." parent company in the footer.

**Signed-in app**
- Fixed the `middleware.ts` route-protection gap described above (dated back to the Mar 26 "disable middleware for debugging" commit).
- Replaced 4 `alert()`/`confirm()`/`window.prompt()` call sites with proper `Modal`/`ConfirmDialog`/`PromptDialog`/`ToastProvider` components (`src/components/ui/`).
- Retinted the app's Tailwind `primary` color scale to derive from the actual brand green instead of Tailwind's stock green — the marketing site and the signed-in app had two different brand identities.
- Rebuilt the Dashboard from a grid of static link-cards into a real data-driven home screen (stat tiles, result breakdown, recent activity, health profile snapshot — all queried live from MongoDB).
- Replaced the top navbar with a sidebar (`src/components/Sidebar.tsx`) across the whole authenticated app.
- Merged `/safe-foods` into `/scan` as a single page; `/safe-foods` now redirects.
- Renamed the risk-level terminology app-wide: "Low/Medium/High risk" → "Good Fit / Use Caution / Not Recommended." The internal data model (`riskLevel: "low"|"medium"|"high"` in the DB and AI prompt contract) is unchanged — only display copy changed, so this was not a data migration.
- Corrected 7 user-facing "Gemini" mentions to "NutriSafe AI" to match what's actually running.
- Added a missing MongoDB index (`DietPlan.userId`) and fixed an unused `color` prop bug on 4 landing-page icon components.

**Documentation**
- `PRODUCT_STRATEGY.md` — engineering/product audit (rate limiting gap, no payment ledger, no scan caching, orphaned `IngredientKnowledge` model, no password reset flow).
- This file, plus `DESIGN.md`, `ARCHITECTURE.md`, `WORKFLOW.md`, `FEATURES.md`, `PRODUCT.md`, `MARKET.md`.

**Not yet done**: none of the above is committed. `git status` at time of writing shows 14 modified files plus several new ones — worth a deliberate commit pass (probably split into a few logical commits: landing page, sidebar/dashboard, terminology, docs) rather than one giant commit, given how many unrelated concerns are mixed into the working tree right now.

---

## 2026-08-23 (continued) — Monetization enforcement, analysis engine hardening, retention features

**Note on supersession**: the dashboard/sidebar entry above described the first version of those components; both were substantially reworked again later the same day (a `Topbar` component, a "Scan food +" CTA, a redesigned stat/breakdown layout) as part of ongoing iteration — see the actual current files for ground truth, not the earlier log entry's description of them.

**Closed the paywall bypass**: `/api/diet-plan` had no server-side `isPremium` check — the only gate was the client-side `<PremiumGate>` wrapper, bypassable by calling the API directly. Fixed and verified (a non-premium session calling the endpoint directly now gets a 403 before any Bedrock call fires).

**Usage-metering layer** (`src/models/UsageCounter.ts`, `src/lib/usage.ts`): the free tier had zero caps on the two most expensive endpoints (`/api/analyze`, `/api/chat`) — anyone could call them unlimited times for $0. Built an atomic per-user/per-action/per-period counter and wired it into `analyze`, `chat`, and `diet-plan`. Current caps (placeholders — see `MARKET.md`, need real AWS Cost Explorer data to tune): scan 10/day free, 60/day premium; chat 15/day free, 60/day premium; diet plan 10/month (premium-only). Verified live: seeded a counter at the cap and confirmed the route rejects with 429 before touching Bedrock.

**Analysis engine improvements** (from a "can we improve the analysis engine" review of `lib/gemini.ts`):
- **Deterministic allergen safety net** (`src/lib/allergySafety.ts`) — the biggest one. Previously, whether a scan caught a declared allergen depended entirely on the LLM noticing it in a general-purpose prompt, with zero backstop. Now every result is cross-checked against the user's declared allergies via alias matching (e.g. "Peanuts" → peanut/groundnut/arachis) independent of what the model concluded, and the verdict is forced to "high" (Not Recommended) on a match. Also added an internal-consistency coercion: the overall verdict can no longer read "Good Fit" while an individual ingredient is tagged "harmful."
- **JSON parse retry** — `analyzeIngredients` previously failed the whole request (and now, wastes a usage credit) on one malformed model response. Added one corrective retry in the same conversation before giving up.
- **Skip the translation call for English/Latin-script input** (`looksLikeEnglishOrLatin` in `lib/gemini.ts`) — `translateText` was running as a full extra Bedrock call on every single scan regardless of language. Now skipped when there's no non-ASCII content (still translates anything with non-Latin script).
- **Wired in `IngredientKnowledge`** (`src/lib/ingredientKnowledge.ts`) — the model was completely unused since it was first built (see `PRODUCT_STRATEGY.md` §7). Seeded 15 real, researched reference entries (`scripts/seed-ingredient-knowledge.js`, re-runnable/idempotent) and added a lookup step that injects matching reference info into the analysis prompt as grounding context. Verified live: a scan's explanation of Sodium Benzoate came back near-verbatim from the seeded reference text, confirming the model is actually using it.

**Reformulation alerts** (`src/lib/reformulationCheck.ts`) — the first of the retention-focused features. Repeat barcode scans now diff the new ingredient list against the last recorded one for that barcode; a change surfaces a `formulationAlert` banner on the result ("this product's ingredients changed since it was last checked"). Verified live with two scans of the same fake barcode, different ingredients — second scan correctly flagged the change.

**Weekly digest — content layer only** (`src/lib/weeklyDigest.ts`, `/api/digest/weekly`) — computes a real 7-day activity summary per user. Explicitly **not** wired to actual delivery: there is no email-sending library anywhere in `package.json` and no email provider credentials in `.env.local`. This endpoint is the content layer a future dispatch job would call into; sending it to anyone requires a provider decision (AWS SES fits naturally alongside the existing Bedrock account) and a scheduler, neither of which exist yet.

**Deferred on purpose, not forgotten**: tying Diet Plan / Chat / Safe Foods into one "shop from your safe list" loop, and Family/household multi-profile plans. Both are real product decisions that deserve real user feedback before building — see `PRODUCT.md` roadmap section for the reasoning. The WhatsApp bot from `MARKET.md`'s growth section is similarly not started — it needs a Meta/Twilio WhatsApp Business API account, phone verification, and (for Meta) an app review process, none of which can be provisioned from inside this codebase.

**Security incident, mid-session**: AWS returned `AWSCompromisedKeyQuarantineV3` on every Bedrock call — the account's AWS credentials had been flagged compromised. Traced a *confirmed* (different, older) secret leak in this repo's public git history: commit `baa73f6` ("Initial commit for NutriSafe") committed `server/.env` in the clear with a real JWT secret, a real Gemini API key, and the Google OAuth client ID still in use today — still sitting in history on the public `github.com/AnantTirupati/nutrisafe` repo. Rotating the AWS access key alone did not clear the quarantine (a second, differently-named IAM user under the same AWS account was also already quarantined) — this needed an AWS Support case before it cleared. Confirmed resolved by re-running the same live scan test that had been failing. **Still outstanding**: the leaked secrets are still in git history and need a proper scrub (`git filter-repo` + force-push + rotate the Gemini key/JWT secret too), and GitHub secret-scanning/push-protection should be turned on for this repo if it isn't already.

---

## 2026-08-23 (continued II) — Real pricing, usage transparency, legal docs, chatbot output bug

**Pricing was fixed for real, not just relabeled.** The ₹299 one-time "lifetime" charge — already flagged in `MARKET.md` as structurally wrong for an AI product — is now ₹500 per payment for **30 days** of Premium access, tracked with an actual `User.premiumExpiresAt` field instead of a permanent boolean. `src/lib/premium.ts`'s `getPremiumStatus()`/`isPremiumActive()` check the database directly rather than trusting the session's cached `isPremium` flag, which can be up to 30 days stale — that staleness didn't matter when Premium never expired, but would have let an expired account keep premium-tier usage limits for weeks otherwise. Wired into `/api/analyze`, `/api/chat`, `/api/diet-plan`, `/api/usage`, and the dashboard. Existing lifetime grants (`premiumExpiresAt` null) are grandfathered — never expire, per the "honor what was already sold" principle from `MARKET.md`.

**Renewal is honestly manual right now** — return to `/premium` and pay again; there is no auto-recurring charge. Real auto-billing needs the Razorpay Subscriptions API (Plans + Subscriptions + a renewal webhook), which is a separate, larger build against live payment infrastructure and wasn't done in this pass — the premium page, refund policy, and landing pricing cards all say this explicitly rather than implying automatic renewal that doesn't exist.

**Real-time usage transparency, "like any other AI product"**: `getUsageSummary()` (read-only) backs `/api/usage`, surfaced on the Dashboard (all three metered actions, reset times, upgrade prompt), the Scan page (live scan quota), and now the Health AI chat header (live "N messages left today").

**Legal documents, for real**: Terms of Service, Privacy Policy, Refund Policy, Fair Usage Policy at `/legal/*`, grounded in the actual sub-processors and enforced limits (not templated boilerplate) — cross-referenced from the landing footer, signup consent line, and premium checkout.

**Chatbot output bug, found by actually testing real output** (not caught by `tsc` or code review — needed a live Bedrock response to surface): `formatMessage()`'s header-line regex only rendered the emoji and bolded label, silently discarding any text that followed on the same line — and the model frequently puts the actual answer right after `**Summary:**` on one line rather than the next. Real content was being dropped from every response where that happened. Fixed, along with a second bug in the same function where indented sub-bullets (nested under a numbered list item) didn't match the bullet regex (required the dash at column 0) and fell through to unstyled plain paragraphs. Also fixed the `sendMessage()` catch block, which had no parameter and unconditionally showed a generic "something went wrong" message — including when the real reason was a usage-cap 429 with a specific, useful message that was being thrown away.

**A recurring debugging lesson worth naming explicitly**: several "bugs" investigated this session turned out to be the Next.js dev server running stale compiled code after an env var, middleware, or model schema change — not real application bugs. Confirmed pattern (again) with `premiumExpiresAt`: the field silently failed to persist on the first test, looked like a real logic bug, and turned out to be a stale route compile — a full restart fixed it immediately. When something that looks correct in code review doesn't work live, restart the dev server before assuming the code is wrong.
