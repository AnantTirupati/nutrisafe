# NutriSafe — Market Strategy & Pricing

## The core problem with current pricing

NutriSafe charges **₹299 once, for lifetime access** to the AI Diet & Workout Plan generator (`/premium`, `/api/premium/*`). Scanning itself — the more expensive feature — is entirely free and unlimited for everyone, forever, with no account-level cap of any kind (verified in `src/app/api/analyze/route.ts` and `src/app/api/chat/route.ts` — neither checks `isPremium` or any usage counter).

This is backwards, and it's backwards in a way that's specific to AI products, not pricing in general:

**Traditional SaaS** has near-zero marginal cost per user action — once the software is built, one more login or one more button click costs almost nothing extra. A lifetime deal is survivable there because the cost curve is flat.

**This product's core actions have real, non-zero marginal cost every single time they run**: every scan calls AWS Bedrock (Nova Pro for text analysis; Qwen3-VL for photo OCR), every unrecognized barcode adds a Serper search call plus another Bedrock call, every chat message is a Bedrock call, every diet plan generation is a long Bedrock call (the prompt in `lib/gemini.ts` requests a multi-section structured output — BMI/BMR/TDEE math, a full day of meals, a grocery list, a workout plan, a weekly overview). None of that gets cheaper the tenth time a user does it. A "lifetime" price is a bet that a user's *total* future usage costs less than what they paid once — and nothing in the product limits usage, so that bet has no ceiling.

**The honest fix isn't "charge more for the same lifetime deal."** It's recognizing that a product whose value is *repeated* AI inference over time needs *recurring* revenue over time. This is the standard, well-understood shape of AI-product economics — it's why essentially no serious AI-powered consumer app (ChatGPT Plus, Notion AI, GitHub Copilot, every nutrition-AI competitor below) sells lifetime access to its AI features. NutriSafe should stop being the exception.

## What comparable products charge

Public pricing, general knowledge as of research — **verify current figures before using these in any external pitch material**, they're benchmarks for reasoning about NutriSafe's position, not numbers to cite as fact elsewhere:

| Product | Category | Approximate pricing model |
|---|---|---|
| Yuka | Barcode health-score scanner (France, global) | Mostly free/donation-supported; not a strong monetization comparable, but proves scan-first UX works at massive scale |
| MyFitnessPal Premium | Nutrition tracking | ~$80/year (US pricing — not PPP-adjusted for India) |
| Cronometer Gold | Nutrition tracking | ~$50/year |
| HealthifyMe | Diet + fitness coaching (India) | Tiered subscription plans, roughly ₹1,000s per quarter for coached plans — the closest India-market comparable, and notably **subscription-only**, no lifetime tier |
| Fig | Allergy-focused scanner (US) | Subscription |

The pattern that matters: **every serious player in this category is subscription-based.** None of them sell lifetime AI access. NutriSafe is currently an outlier, and not in a good way.

## Proposed structure: tiered subscription, INR-first, India PPP-appropriate

This is a **starting recommendation to validate**, not a final locked number — actual willingness-to-pay should be tested (a price-sensitivity survey to the existing user base, or an A/B test on the checkout page) before fully committing. The reasoning behind each tier is what should survive that validation even if the exact rupee figures move.

### Free — the trust-building tier
- Barcode scanning: capped (e.g. ~15/month) — the cheapest AI path, no OCR or search fallback involved.
- No photo-label OCR (the more expensive Qwen3-VL path).
- A small taste of AI chat (e.g. 5 messages/month), not unlimited.
- No diet plan generation.
- Full scan history and Safe Foods list retained — this is the retention hook, keep it generous even on Free.

### Plus (~₹149/mo, or ~₹999–1,199/yr at a ~35–40% annual discount) — the mass-market tier
- Unlimited barcode scanning.
- Photo-label OCR included, capped at a level that covers normal household use (e.g. ~30/month).
- AI chat with a real but bounded cap (e.g. ~100 messages/month).
- 2 diet-plan generations per month.
- **This tier alone, at one subscriber for two months, already exceeds total lifetime revenue from the current ₹299 one-time price** — the core economic fix.

### Pro (~₹299/mo, or ~₹2,499/yr) — for someone actively managing a condition
- Everything unlimited: scans, OCR, chat.
- Unlimited diet-plan regeneration.
- Priority AI processing (a real, meaningful differentiator now that there's a tier below it — the old landing page promised this as a premium feature; make it true).
- First access to a curated ingredient-knowledge layer once `IngredientKnowledge` is actually wired in (`PRODUCT_STRATEGY.md` §7) — more consistent, reviewed answers instead of a fresh LLM guess every time.

### Family (~₹399/mo, or ~₹3,499/yr) — **proposed, not yet built**
- Up to 5 linked profiles under one household account, shared scan history and a combined Safe Foods list for grocery shopping.
- No feature in the current data model supports this (`HealthProfile` is strictly 1:1 with `User` — see `FEATURES.md`); this is real engineering work, not a pricing toggle. It's proposed here because it's also the most direct answer to the growth question below — a single Family subscriber *is* multiple active users by construction.

### Handling existing ₹299 lifetime purchasers
Honor what was already sold — grandfather existing lifetime buyers on their current access rather than retroactively downgrading them. Close the lifetime SKU to new signups going forward. Breaking a promise already made to paying customers costs more trust than the original pricing mistake did; the fix is to stop selling it, not to claw it back.

### Before any of this ships
1. Pull real Bedrock cost-per-request data from AWS Cost Explorer, broken down by call type (text analysis, OCR, chat, diet-plan generation) — the tier caps above are reasoned from the *shape* of the cost problem (unbounded usage vs. one fixed payment), not from verified per-call dollar figures. Get the real numbers before finalizing exact cap thresholds.
2. Enforce caps **server-side**, not just in the UI. `/api/diet-plan` currently has no `isPremium` check at all — the only gate is the client-side `<PremiumGate>` wrapper, which anyone calling the API directly bypasses (`ARCHITECTURE.md`). Any tier structure is fake until the API layer actually enforces it.
3. Add a payment ledger and a Razorpay webhook before turning on recurring billing (`PRODUCT_STRATEGY.md` §4) — recurring subscriptions fail in more ways than one-time payments (renewal failures, expired cards, disputed recurring charges) and need an audit trail a single `isPremium` boolean can't provide.

## Growth strategy: how one user becomes four

Paid acquisition (ads) is the slowest, most expensive way to grow a consumer health app and shouldn't be the primary plan. The product has three growth mechanisms available that compound instead of just adding linearly:

### 1. Turn scan data into public content (SEO)
People already search "is [product] safe for diabetics," "[product] ingredients PCOS," etc. — this is real, existing search demand. Every product NutriSafe has already analyzed could have an optional public result page (stripped of personal data, generalized to common conditions) that ranks for exactly those queries. This is a proven playbook in this category — it's how ingredient-scanning apps in other markets built organic traffic without ad spend — and NutriSafe already generates the underlying content as a byproduct of its core feature; it just isn't published anywhere public yet. This is a real engineering + content-moderation scope item, not a marketing-only initiative.

### 2. Meet users on WhatsApp, not just in an app store
India runs on WhatsApp. A WhatsApp Business API bot — forward a barcode photo, get a verdict back — removes the single biggest first-touch friction point (installing an app before getting any value) and is a channel several India-focused consumer products have used to acquire users at a fraction of app-install cost. It's also a natural forwarding mechanism: someone in a family WhatsApp group gets a useful answer, forwards the bot to the group.

### 3. Make the product multiply by design: Family plans + condition communities
This is the literal "1 → 2 → 4" mechanism:
- **Family plan** (proposed above): one subscription, multiple real users under one household, by construction. The person managing a parent's diabetes diet or a child's allergy is very often not the person who'll eventually manage their own — each household member becomes a plausible future independent subscriber.
- **Condition-specific communities**: diabetes and PCOS support communities are large, active, and trust-driven on Indian social platforms — a recommendation from someone managing the same condition carries far more weight than an ad for a health product. A referral incentive ("invite someone managing the same condition, you both get a month free") targeted at these communities converts better than generic referral programs because the audience is pre-qualified by shared need.
- **B2B2C partnerships**: pharmacy chains, diagnostic labs, and corporate wellness programs are an underused channel for a product like this — NutriSafe becomes a value-add benefit distributed by a trusted intermediary rather than something a consumer has to independently discover and trust cold.

None of these three require the product to change its core value proposition — they distribute the existing value proposition (personalized food safety) through channels that compound (content that keeps ranking, a household that keeps using it, a community that keeps referring) instead of one that resets to zero every month (ads).
