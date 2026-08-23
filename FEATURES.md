# NutriSafe — Feature Inventory

What the product actually does today, what's half-built, and what's proposed. Cross-referenced with `ARCHITECTURE.md` (how) and `MARKET.md` (what should gate free vs. paid).

## Live today

### Account & profile
- Email/password signup (bcrypt) and Google OAuth sign-in.
- Health profile: age, gender, medical conditions (12 options — Diabetes, Hypertension, PCOS, Heart/Kidney/Liver Disease, Celiac, IBS, GERD, Obesity, Thyroid, Other), allergies (13 options), dietary preference (Veg/Non-Veg/Vegan), preferred output language (English + 9 Indian languages).

### Scan & Safe Foods (`/scan`, merged this session)
- Three input methods: barcode (camera scan via `html5-qrcode`, or manual entry), label-photo upload (OCR via Bedrock Qwen3-VL), or manual ingredient text entry.
- Barcode lookup: Open Food Facts first, then a Serper web-search + Bedrock identification fallback for products OFF doesn't have.
- AI analysis returns a **Good Fit / Use Caution / Not Recommended** verdict (internal `low`/`medium`/`high`; see `DESIGN.md`), a plain-language summary, per-ingredient insight tags, actionable recommendations, and suggested-alternative product searches (linked out to Amazon/BigBasket/Blinkit).
- Every "Good Fit" scan is saved to a personal Safe Foods list, shown on the same page.

### Scan History (`/history`)
- Chronological list of every past scan with its verdict, most recent first (capped at 100).

### Diet & Workout Plan (`/diet-plan`) — **premium-gated**
- Form (height/weight/goal/activity/workout level/meals-per-day/workout minutes/free-text request) → one AI generation call → a structured plan (health summary with BMI/BMR/TDEE, a full day's meals, grocery list, workout plan, weekly overview, tips, disclaimer).
- Can be saved, and saved plans can be renamed and their content hand-edited (`/my-plans`, `/my-plans/[id]`).

### Health AI Chat (floating widget, every authenticated page)
- Free-form chat grounded in the user's health profile: meal planning, BMI/calorie math, general symptom guidance (explicitly non-diagnostic, with a standing disclaimer), and food-photo analysis.
- Labeled BETA in the UI — an accurate label, not a formality, given there's no usage cap or quality eval on it yet.

### Premium (`/premium`)
- ₹299 **one-time lifetime** unlock via Razorpay, currently gating only the Diet & Workout Plan generator. **This pricing model is the subject of `MARKET.md` — it does not cover the AI cost of an engaged user over time and is slated to change.**

### Dashboard (`/dashboard`, rebuilt this session)
- Live stat tiles (total scans, safe/caution/not-recommended counts), a result-breakdown bar, recent activity, a health-profile snapshot (conditions/allergies as chips, or a completion prompt if empty), and a Safe Foods summary block — all queried directly from MongoDB, not hardcoded.

## Built but not connected

- **`IngredientKnowledge` model** — a full schema for a curated ingredient reference (name, aliases, category, E-number, health-condition associations) that's never imported anywhere outside its own file. Every ingredient explanation today comes fresh from the LLM with nothing grounding it to a reviewed source. See `PRODUCT_STRATEGY.md` §7 and `ARCHITECTURE.md`.
- **`FoodProduct` cache** — indexed on `barcode` specifically so repeat scans of the same product could skip re-running the AI pipeline, but nothing ever queries it before creating a new document. See `PRODUCT_STRATEGY.md` §5.

## Explicitly not built (despite past marketing copy claiming otherwise)

Before this session, the landing page advertised a "Family Guard" tier (up to 5 family profiles, shared history) — **no such feature exists anywhere in the data model.** `HealthProfile` is strictly 1:1 with `User`. That copy has been removed from the landing page. Whether to actually build family/household profiles is a real roadmap question — see `MARKET.md`, since it's a plausible answer to "how do 1 user become 4."

## Gaps that block scaling the paid tier honestly

(Full detail in `PRODUCT_STRATEGY.md` — listed here because `FEATURES.md` and pricing are directly linked.)
- No usage caps anywhere — a free account can hit the most expensive endpoints (scan analysis with OCR/search fallback, unlimited chat) without limit. Any new pricing tier needs real caps enforced *server-side*, not just a UI-level `<PremiumGate>` wrapper (the `/api/diet-plan` route itself doesn't check `isPremium` today — see `ARCHITECTURE.md`).
- No payment ledger or webhook — can't yet support recurring billing reliably without building that first.
- No password reset flow — a real churn risk once there's a paying user base with something to lose access to.
