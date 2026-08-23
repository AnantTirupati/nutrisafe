# NutriSafe — Product & Engineering Foundations Review

Researched directly against the current codebase (routes, API handlers, models, and the AI/payment integrations) — not general SaaS advice. Every item below points at a specific file. Ordered by how much it threatens the product's footing if left alone.

---

## 0. Route inventory (for reference)

**Public**
- `/` — landing
- `/auth/signin`, `/auth/signup`, `/auth/error`

**Authenticated** (all gated by `middleware.ts` — three of these were *not* actually gated until this pass, see §2)
- `/dashboard`, `/scan`, `/history`, `/safe-foods`, `/profile`
- `/diet-plan`, `/my-plans`, `/my-plans/[id]`, `/premium`

**API**
- `POST /api/auth/register`, `/api/auth/[...nextauth]` (NextAuth)
- `POST /api/analyze`, `GET /api/barcode/[barcode]`, `POST /api/chat`
- `POST /api/diet-plan`, `GET+POST /api/diet-plans`, `GET+PUT+DELETE /api/diet-plans/[id]`
- `GET /api/history`, `GET /api/safe-foods`, `GET+PUT /api/profile`
- `POST /api/premium/create-order`, `POST /api/premium/verify`

---

## 1. The free tier gives away the expensive feature; the paid tier gates the cheap one

This is the single biggest risk to the business, and it's a pure logic bug, not a UI one.

Look at what's actually gated by `PremiumGate` (`src/components/PremiumGate.tsx`): only `/diet-plan`, one Bedrock text-generation call per request.

Now look at what's **not** gated — free and unlimited for every signed-in user, forever:

- **`/api/analyze`** (`src/app/api/analyze/route.ts`) — up to *three* model calls per scan: OCR (Qwen-VL) if a photo was uploaded, a translation pass, and the main ingredient analysis. A barcode miss adds a Serper web search plus a fourth model call (`src/app/api/barcode/[barcode]/route.ts` → `identifyProductFromSearch`).
- **`/api/chat`** (`src/app/api/chat/route.ts`) — unlimited messages, unlimited image uploads, no daily cap. Only bounded by a 2000-character message and 40-message history window per *request*, not per day.

So the feature that costs the most to run per use (scan analysis, with OCR/search fallback) is completely free and unmetered, while the feature that costs the least (a single diet-plan generation) is the only thing behind the ₹299 paywall. Any spike in signups — organic, a Reddit post, a bot — turns directly into an uncapped AWS Bedrock bill with zero revenue attached to it, because there is no rate limiting anywhere in the codebase (confirmed: no middleware, no per-route throttle, no usage-count field on `User` or `HealthProfile`).

**Recommended fix**, in order of effort:
1. Add a simple daily usage counter (e.g. `scansToday` / `chatMessagesToday` + `resetAt` on `User`) and cap free-tier usage — even a generous cap (20 scans/day, 30 chat messages/day) closes the uncapped-cost hole without feeling punitive.
2. Move the free/premium line to match cost, not feature category: keep basic barcode-only scanning free (cheapest path — one model call), but gate OCR-photo scanning and the fallback web-search path behind premium, alongside diet plans.
3. At minimum, add IP/user-level rate limiting (even a naive in-memory or Upstash-Redis token bucket in `analyze` and `chat`) before this ships to real users.

---

## 2. Three protected pages weren't actually protected — fixed in this pass

`middleware.ts`'s `matcher` only listed `/dashboard`, `/profile`, `/scan`, `/history`, `/safe-foods`. `/diet-plan`, `/my-plans`, `/my-plans/[id]`, and `/premium` all live under the same `(protected)` route group but were missing from the matcher — confirmed by curling each route with no session cookie and getting `200` instead of a redirect to sign-in. The API routes underneath were still checking `session.user.id` correctly, so no data actually leaked, but unauthenticated visitors landed on broken client pages (failed fetches, no redirect) instead of the sign-in screen.

**Fixed**: added all three paths to the matcher; verified each now returns `307 → /auth/signin?callbackUrl=...`.

The underlying lesson for "footing": route protection lived in two places (the folder structure *and* a hand-maintained matcher array) that can silently drift apart. Consider a lint rule or a startup assertion that diffs the `(protected)` folder's routes against the middleware matcher, so this can't happen again silently.

---

## 3. The product doesn't run on the AI it says it runs on

`src/lib/gemini.ts` — despite the filename, every export in it calls **AWS Bedrock** (`amazon.nova-pro-v1:0` for text, `qwen.qwen3-vl-235b-a22b` for vision), via `@aws-sdk/client-bedrock-runtime`. There is no import of `@google/generative-ai` anywhere in `src/`, and `GEMINI_API_KEY` in `.env.local` is never read by any code path (confirmed by grep). Meanwhile the UI told users otherwise in seven places — the landing page, the diet-plan loading state, and the chatbot's own disclaimer all said "Gemini AI" or "Gemini Vision."

**Fixed in this pass**: all seven user-facing mentions now say "NutriSafe AI" instead of naming a vendor that isn't actually used.

**Still open** (not UI, so out of scope for this pass, but real):
- `README.md` still documents "Google Gemini (OCR + ingredient analysis)" and lists Gemini as a prerequisite — actively wrong setup instructions for anyone who clones this repo.
- `package.json` still carries `@google/generative-ai` as a dependency it never imports — dead weight, and a landmine for the next engineer who assumes it's live because it's installed.
- Rename `src/lib/gemini.ts` → `src/lib/ai.ts` (or `bedrock.ts`) so the filename stops lying to whoever opens it next.

This matters beyond tidiness: a health-adjacent product's credibility rests partly on being accurate about what's actually checking your food against your allergies. Claiming one AI vendor while running another is the kind of inconsistency that, if a user or reviewer ever notices, undermines trust in everything else the product claims — including the risk levels it hands out.

---

## 4. Payments: no ledger, no webhook — a lost-payment edge case waiting to happen

`src/app/api/premium/verify/route.ts` checks the Razorpay HMAC signature correctly (that part matches Razorpay's own documented flow — no bug there). But two structural gaps sit next to it:

- **No transaction record.** Success just sets three fields on `User` (`isPremium`, `premiumSince`, `premiumOrderId`) and stops. There is no `Payment`/`Transaction` collection recording amount, currency, timestamp, or status. If a customer disputes a charge, asks for a receipt, or premium access needs to be revoked and reinstated, there's nothing to look up beyond a single order-id string sitting on the user document.
- **No webhook.** Verification only happens when the browser calls `/api/premium/verify` after checkout completes client-side (`src/app/(protected)/premium/page.tsx`). If the tab closes, the network blips, or the browser crashes between Razorpay capturing payment and that callback firing, Razorpay has the money and NutriSafe has no record of it — the user paid and got nothing, with no server-side reconciliation path to catch it.

**Recommended fix**: add a `Payment` collection (order id, payment id, amount, status, timestamps) written in `verify`, and register a Razorpay webhook endpoint (`payment.captured`) as the source of truth for granting premium — treat the client-side `verify` call as a fast-path UX nicety, not the only path.

---

## 5. Scans are never deduplicated or cached

`/api/analyze` calls `FoodProduct.create(...)` unconditionally on every request (`src/app/api/analyze/route.ts:102`) — it never checks whether a `FoodProduct` for that barcode already exists, even though `FoodProduct.barcode` is indexed specifically for that lookup (`src/models/FoodProduct.ts:19`). Two consequences:

1. **Cost**: every scan of a popular product (a bottle of Coke, Maggi noodles) re-runs the full Bedrock analysis pipeline from scratch for every user who scans it, even minutes apart — same product, same ingredients, same health-condition-agnostic base analysis, paid for again in full each time.
2. **Data bloat**: the `FoodProduct` collection accumulates one duplicate document per scan of the same item, with no way to tell "this is the same Maggi noodles as that other document" without a secondary dedup pass.

**Recommended fix**: on barcode-sourced scans, look up `FoodProduct.findOne({ barcode })` first. If found and reasonably fresh (e.g. `updatedAt` within 30–90 days, since ingredient formulations do change), reuse its `ingredients`/`ingredientsText` and skip straight to the profile-specific risk analysis — that's the one part that's genuinely per-user and can't be cached, since it depends on the individual's conditions and allergies. Caching the *product identification* step (OCR/search/OFF lookup) while keeping the *risk analysis* step per-user gets most of the cost savings without stale-personalization risk.

---

## 6. Account recovery has no floor

`User.emailVerified` exists in the schema (`src/models/User.ts:6`) but nothing ever sets it — no verification email is ever sent, so it's a dead field. More importantly: **there is no forgot-password flow at all.** A user who signs up with email+password and forgets it has exactly two options — remember it, or abandon the account and register a new one with the same email (which will fail, since email is unique) or a different email (fragmenting their scan history and health profile). For a health app where someone's whole point is building up a profile and history over time, losing access permanently on a forgotten password is a real churn risk, not a minor gap.

**Recommended fix**: standard NextAuth email-based password reset (a `PasswordResetToken` collection, a short-lived signed link, a `/auth/reset-password` page). This is a well-trodden pattern — the gap here isn't difficulty, it's that it was never built.

---

## 7. An entire model was scaffolded and never connected

`src/models/IngredientKnowledge.ts` defines a full schema — name, aliases, category, E-numbers, health-condition associations — clearly meant to be a curated, reviewed knowledge base of ingredients. It is imported *nowhere* outside its own file (confirmed by grep across `src/`). Every ingredient explanation a user sees today comes fresh from the LLM with no grounding against a maintained reference, which means:

- The same ingredient (say, "Sodium Benzoate") could get subtly different explanations or risk framing across two different scans, since nothing anchors the model's output to a reviewed source.
- There's no way to fix a wrong or legally-risky ingredient explanation without it silently regenerating differently next time — no place to correct the record.

**Recommended fix**: either wire this model in (RAG-style: look up known ingredients here first, feed matches into the analysis prompt as grounding context, and let the LLM handle only the personalization layer) or remove it if the knowledge-base approach was abandoned — a half-built, disconnected model is worse than either finished state, since it looks load-bearing to the next engineer who reads the schema.

---

## 8. Smaller structural items worth batching into one cleanup pass

- **Missing index**: `DietPlan` has no index on `userId`, unlike `ScanHistory` which explicitly indexes `{userId, createdAt}` for the identical access pattern (`/api/diet-plans` does `DietPlan.find({userId}).sort({createdAt:-1})` with a full collection scan). Cheap to add, and it's the same query shape someone already remembered to index once.
- **Inconsistent Next.js route param typing**: `src/app/api/barcode/[barcode]/route.ts` types `params` as `Promise<{barcode: string}>` (the Next.js 15 convention) while `src/app/api/diet-plans/[id]/route.ts` types it as a plain sync object (the Next.js 14 convention this app is actually pinned to, per `package.json`). Both happen to work today because `await` on a non-promise just resolves immediately, but it's a landmine for the eventual Next 15 upgrade — one route will need to change, the other won't, and it won't be obvious which from the type alone.
- **`translateText` runs unconditionally** on every `/api/analyze` call (`src/app/api/analyze/route.ts:59`), even when the input is already English — an avoidable extra model round-trip on the majority-English-input path. A quick language heuristic (or just checking the barcode source's locale) before paying for a translation call would cut latency and cost on the common case.
- **No structured error observability**: every route's catch block does `console.error` and returns a generic message — fine for local dev, but there's no correlation ID, no external error tracking (Sentry or equivalent), and no alerting. The first sign of a Bedrock outage or Atlas connection issue in production would be users reporting broken scans, not a dashboard.
- **`.gitignore` has a corrupted duplicate line** (line 40 is `.env.local` mangled into space-separated characters, likely from a `PowerShell echo` write that used the wrong text encoding). Harmless today since the correctly-formed `.env.local` entry on line 14 already covers it, but worth a clean rewrite so a future edit to that section doesn't silently break on the garbled bytes.

---

## Priority order, if only doing three things next

1. **Cap or gate the expensive endpoints** (§1) — this is the one with actual financial exposure the moment traffic isn't zero.
2. **Add a payment ledger + webhook** (§4) — the one with real-money customer-trust exposure.
3. **Cache product identification by barcode** (§5) — the one that pays for itself immediately and gets easier to justify the more usage grows.

Everything else here is real, but survivable if traffic stays low; those three compound with scale.
