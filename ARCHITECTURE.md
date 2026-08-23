# NutriSafe — Architecture

Technical reference for how the system is actually built. Every claim here is verified against the current codebase, not the README (which is out of date — see the note at the bottom).

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14.2.15 (App Router) | Server Components by default; `"use client"` where interactivity is needed |
| Language | TypeScript | `tsc --noEmit` is the only enforced check — no lint config currently resolves (see `WORKFLOW.md`) |
| Auth | NextAuth.js v4 | JWT session strategy, 30-day expiry. Email/password (bcrypt) + Google OAuth |
| Database | MongoDB Atlas via Mongoose | Connection cached across hot-reloads in `src/lib/db.ts` |
| AI — text & vision | **AWS Bedrock** | Amazon Nova Pro (text) + Qwen3-VL 235B (vision/OCR), via `@aws-sdk/client-bedrock-runtime`. **Not** Google Gemini — see note below |
| Payments | Razorpay | One-time order + signature verification, no webhook (see `PRODUCT_STRATEGY.md` §4) |
| Barcode data | Open Food Facts (public API) | Primary source; Serper (Google Search API) + Bedrock is the fallback for barcodes OFF doesn't have |
| Styling | Tailwind CSS v3 | Custom `primary` scale derived from brand green; `.card`/`.btn-primary`/`.input` utility classes in `globals.css` |

### On the AI provider naming
`src/lib/gemini.ts` is misnamed — every function in it calls AWS Bedrock. This dates to commit `5947566` ("Migrate from Gemini to AWS Bedrock Nova Pro"), which changed the implementation but not the filename. `GEMINI_API_KEY` in `.env.local` and the `@google/generative-ai` dependency in `package.json` are both unused dead weight. User-facing copy was corrected this session; the filename and dependency are still open (see `PRODUCT_STRATEGY.md` §3).

## Route map

```
src/app/
├── page.tsx                          # landing (public)
├── auth/{signin,signup,error}/       # public
├── (protected)/                      # gated by middleware.ts
│   ├── layout.tsx                    # Sidebar + Topbar + ToastProvider + HealthChatbot (mounted once, global)
│   ├── dashboard/
│   ├── scan/                         # merged with the former safe-foods page
│   ├── safe-foods/                   # now just a redirect → /scan#safe-foods
│   ├── history/
│   ├── diet-plan/                    # gated by <PremiumGate>
│   ├── my-plans/, my-plans/[id]/
│   ├── profile/
│   └── premium/
└── api/
    ├── auth/{register,[...nextauth]}/
    ├── analyze/                      # the core scan pipeline
    ├── barcode/[barcode]/            # OFF lookup + Serper/Bedrock fallback
    ├── chat/                         # Health AI chatbot
    ├── diet-plan/                    # AI generation (premium-gated client-side, not server-side — see below)
    ├── diet-plans/, diet-plans/[id]/ # saved-plan CRUD
    ├── history/, safe-foods/         # ScanHistory reads
    ├── profile/                      # HealthProfile CRUD
    └── premium/{create-order,verify}/
```

**Note on premium gating**: `/api/diet-plan` (the generation endpoint) does not check `session.user.isPremium` server-side — the gate is only the `<PremiumGate>` UI wrapper on the client page. Anyone who calls the API directly with a valid session bypasses the paywall entirely. Worth closing before the pricing changes in `MARKET.md` go live.

## Data model

Six Mongoose collections, all in `src/models/`:

- **User** — email, optional `passwordHash`, OAuth `accounts[]`, `isPremium`/`premiumSince`/`premiumOrderId`. `emailVerified` field exists but nothing ever sets it (dead field — no verification flow exists).
- **HealthProfile** — 1:1 with User (`unique` index on `userId`). Age, gender, `medicalConditions[]`, `allergies[]`, `dietaryPreference`, `preferredLanguage` (10 Indian languages + English), `additionalNotes`.
- **ScanHistory** — one document per scan: ingredients, `riskLevel` (`"low"|"medium"|"high"` — internal value unchanged; see `DESIGN.md` for why the *displayed* labels are different), `ingredientInsights[]`, `recommendations[]`. Indexed on `{userId, createdAt}`.
- **FoodProduct** — product-level cache target (barcode-indexed) that's never actually queried before creating a new one — every scan of the same barcode re-runs the full AI pipeline (`PRODUCT_STRATEGY.md` §5).
- **DietPlan** — saved plans, markdown-ish content string parsed client-side into sections. Indexed on `{userId, createdAt}` (added this session — was missing).
- **IngredientKnowledge** — fully defined, **never imported anywhere outside its own file**. Was clearly meant to ground ingredient explanations in a reviewed reference instead of a fresh LLM call every time; never wired in.

## Auth flow

NextAuth v4, JWT strategy. Two providers:
1. **Credentials** — email/password, bcrypt-hashed (`cost=12`).
2. **Google OAuth** — on first sign-in, the `signIn` callback finds-or-creates a `User` + default `HealthProfile` by email.

Route protection is `src/middleware.ts` calling `getToken()` against a matcher array — **not** automatic from the `(protected)` folder structure. This is a manually-maintained list that can silently drift from the actual folder structure (it did — three routes were missing until this session). There's no lint rule or test asserting the matcher covers everything under `(protected)/`.

## External integrations & their failure modes

| Service | Used for | What happens if it's down/rate-limited |
|---|---|---|
| AWS Bedrock | All AI (analysis, chat, diet plans, OCR, translation) | Route catches the error, returns a generic 500 with a message — no retry, no circuit breaker, no fallback model |
| Open Food Facts | Barcode → product lookup | Falls through to Serper + Bedrock identification automatically (already has a fallback) |
| Serper | Web search fallback for unknown barcodes | Falls through to a broader query once, then returns empty string — analysis proceeds with whatever text is available |
| Razorpay | Payment | Client-only verification path (see `PRODUCT_STRATEGY.md` §4) — no webhook reconciliation |
| MongoDB Atlas | Everything | Connection is cached but uncached failures throw straight up to the route handler's `catch` |

None of these have a rate limiter in front of them. `PRODUCT_STRATEGY.md` §1 covers the cost exposure this creates.

## Deployment

No CI/CD configuration found in the repo (no `.github/workflows/`, no `vercel.json`). `next.config.mjs` is close to default. Deployment target is not codified anywhere — see `WORKFLOW.md`.

## Known architectural debt (cross-reference)

Full detail lives in `PRODUCT_STRATEGY.md`; summarized here for context:
- No caching layer for repeated barcode scans (§5)
- No rate limiting on any AI-backed endpoint (§1) — the single biggest cost-exposure risk
- No payment ledger, no Razorpay webhook (§4)
- Mixed Next.js dynamic-route param conventions across API routes (§8) — a landmine for the eventual Next 15 upgrade
- No structured error observability (console.error only)

## README accuracy note

`README.md` at the repo root still describes Google Gemini as the AI provider and lists it as a setup prerequisite. It is out of date per the findings above and should be rewritten alongside the `gemini.ts` → `ai.ts` rename.
