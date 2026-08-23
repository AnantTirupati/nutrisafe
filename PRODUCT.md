# NutriSafe — Product Overview

## What it is

NutriSafe answers one question, fast: **"can I eat this, given my specific health situation?"** A user scans a packaged food (barcode, label photo, or typed ingredients), and gets back a plain-language verdict — Good Fit, Use Caution, or Not Recommended — personalized to their actual medical conditions, allergies, and diet preference, not a generic nutrition score.

That personalization is the entire point of the product. A generic "this food is 6/10 healthy" score (what most competitors ship) doesn't tell a diabetic whether *this specific* sweetener spikes their blood sugar, or tell someone with a peanut allergy whether "may contain traces" applies. NutriSafe's AI layer exists specifically to bridge "here's a raw ingredient list" and "here's what that means for *you*."

## Who it's for

Built India-first: the health-profile options include PCOS and thyroid conditions (disproportionately common in Indian women), the diet-plan generator explicitly prefers Indian food options, and the profile supports 9 Indian languages plus English for output. The addressable population this maps to is large and specific — India has one of the world's largest diabetic populations and a fast-growing packaged-food market where ingredient labels are often confusing, in English-only text, or simply not scrutinized by a household member managing a condition on someone else's behalf (a parent managing a child's allergy, an adult child managing an elderly parent's diabetes diet).

## Current stage

Early — a working MVP with real users signing up (per `git log`, the core feature set landed over roughly two months, Jan–Mar 2026), built by a two-person team, no committed test suite, and a monetization model (₹299 lifetime) that doesn't yet reflect the actual cost of running it. This is normal for this stage, but it means the next phase of work is as much about *making it sustainable* as adding features — see `MARKET.md`.

## What makes it defensible (vs. generic nutrition-score apps)

1. **Condition-specific reasoning**, not a universal health score. The AI prompt explicitly connects each ingredient to the user's actual conditions ("since you have Diabetes, this high sugar is like pouring oil on a fire").
2. **Multiple input paths** — barcode, photo, or manual entry — so a product with a damaged barcode, no barcode data in Open Food Facts, or a home-cooked/loose item is still coverable.
3. **A companion AI chat**, not just a scanner — nutrition Q&A, BMI/calorie math, and meal planning grounded in the same health profile, so the product isn't just a one-shot lookup tool but something with a reason to be opened daily.
4. **Language coverage** most competitors (largely US/EU-built) don't bother with.

## What's missing to be a durable business, not just a working demo

This is the honest gap list, expanded in the other docs:
- **Pricing that covers cost** (`MARKET.md`) — the current one-time ₹299 charge for unlimited lifetime access to an AI feature is a well-known anti-pattern for AI products specifically, because marginal cost per use doesn't approach zero the way it does for traditional SaaS.
- **A reviewed knowledge layer**, not pure LLM improvisation, for the ingredients that come up over and over (`PRODUCT_STRATEGY.md` §7) — matters both for cost (less redundant AI inference) and for trust (a consistent, correctable answer instead of a fresh guess every time).
- **A real growth loop** beyond "hope people find the app store listing" (`MARKET.md`).
- **Operational maturity**: tests, a deploy pipeline, a payment audit trail, rate limiting (`WORKFLOW.md`, `ARCHITECTURE.md`).

## Roadmap: deferred on purpose

Two ideas came out of a retention-strategy review and were deliberately **not** built yet — they're real, validated-by-reasoning ideas, not rejected ones, but they both need actual user behavior to design well rather than a guess:

- **Tying Diet Plan, Chat, and the Safe Foods list into one "shop from your list" loop** — right now these are three separate destinations competing for separate visits instead of one connected flow. The shape of the right integration (a real shopping-list UI? a grocery-store-mode? something else?) should come from watching how real users actually move between the three today, not from a design guess before anyone's used the current version.
- **Family/household multi-profile plans** — the direct answer to "how does one subscriber become several," and the top upsell candidate in `MARKET.md`. Also the most structurally invasive of the two: `HealthProfile` is hard-coded 1:1 with `User` today, and building this means real decisions about profile-switching UX, shared vs. private scan history, and billing-per-seat that are much cheaper to get right once there's a real household actually asking for it.

**The operating principle**: get real users on the current feature set first, then let their actual usage patterns — not further internal speculation — decide which of these (or something else entirely) is worth building next.

## Guiding principles (established or reinforced this session)

- **Say what's true.** The landing page previously claimed a clinical-expert chat feature that doesn't exist, a "clinically approved" certification that doesn't exist, and a pricing tier with no feature behind it. All removed. A health product's credibility compounds — every accurate claim earns trust for the next one; every caught exaggeration costs trust for everything else the product says, including the actual risk verdicts.
- **Don't borrow more certainty or alarm than the analysis actually has.** "High Risk" on a snack reads like a poison warning for what is, honestly, a personalized-suitability estimate from an LLM reading an ingredient list — not a lab test. Renamed to Good Fit / Use Caution / Not Recommended this session; see `DESIGN.md`.
- **Cost-aware by default.** Every new AI-backed feature should ship with an answer to "what does this cost per use, and what stops someone from calling it 10,000 times for free" before it ships, not after a bill arrives.
