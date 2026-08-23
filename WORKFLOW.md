# NutriSafe — Development Workflow

How to actually work on this codebase day to day. Written from what's real in the repo right now, including the gaps.

## Running locally

```bash
npm install
npm run dev      # next dev, http://localhost:3000
```

MongoDB is remote (Atlas) — no local DB setup needed, just a valid `MONGODB_URI`.

### Environment variables (`.env.local`, gitignored)

| Variable | Used for |
|---|---|
| `NEXTAUTH_URL`, `NEXTAUTH_SECRET` | NextAuth session signing |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google OAuth provider |
| `MONGODB_URI` | Atlas connection string |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `BEDROCK_NOVA_PRO_ID`, `BEDROCK_QWEN_ID` | AWS Bedrock (the actual AI provider — see `ARCHITECTURE.md`) |
| `SERPER_API_KEY` | Barcode web-search fallback |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Payments |
| `GEMINI_API_KEY` | **Unused.** Dead — nothing in `src/` reads it. Safe to remove once `lib/gemini.ts` is renamed. |

If you're missing AWS or Serper credentials, scanning and chat will fail at runtime with a generic 500 — there's no local mock/stub for the AI layer.

## Checks

- **Type checking**: `npx tsc --noEmit -p tsconfig.json` — this is the only check that currently works and should be run before considering any change done.
- **Linting**: `npm run lint` (`next lint`) is **broken** — there's no ESLint config file, so it drops into an interactive "how would you like to configure ESLint?" prompt instead of running. Either run `next lint` once interactively to generate a config and commit it, or accept that lint isn't enforced right now.
- **Tests**: there are none. No test framework is in `package.json` (`devDependencies` has TypeScript/ESLint/Tailwind tooling only). Every verification in this project so far has been manual: `tsc --noEmit`, curling the dev server, and — for anything touching auth or data — creating a real throwaway account, exercising the flow, and deleting it afterward. That's a real gap for a codebase handling health data and payments; adding even a thin integration-test layer around the auth flow and the payment-verification route should be a near-term priority, not a nice-to-have.

## Branching & commits

Git history shows two contributors (`Anant`, `Aakshant Kumar`) committing straight to `main` — no branches, no PRs visible in history. That's workable at current team size but won't survive a third or fourth contributor without collision risk, especially on files like `middleware.ts` and the auth callbacks where a silent regression (like the route-protection gap fixed this session) is easy to introduce and hard to notice without a reviewer. Recommend: feature branches + at minimum a self-review diff read before merging, once the team grows past two people.

**Commit hygiene**: recent history has a few commits that bundle unrelated changes (e.g., one commit that both migrated the AI provider *and* disabled middleware "for debugging" — the middleware change was never reverted or revisited, and sat as a silent auth gap for months). Prefer one concern per commit, and if something is disabled "temporarily," leave a `// TODO` referencing why and treat it as a tracked item, not implicit.

## Deployment

Not currently codified. No `.github/workflows/`, no `vercel.json`, no Dockerfile. Whoever deploys this today does so by some manual process outside the repo — that should be written down here once it's decided, including:
- Where env vars are set for production (they can't be `.env.local` in prod)
- Whether `NEXTAUTH_URL` and Google OAuth redirect URIs are updated for the production domain
- A migration story for MongoDB indexes (Mongoose creates them lazily on first connect in dev; confirm this happens in prod too, or run an explicit index-sync step)

## Working with the AI layer

`src/lib/gemini.ts` (misnamed — see `ARCHITECTURE.md`) is the single choke point for every Bedrock call. When changing a prompt:
- The system prompts (`getSystemPrompt`, `buildHealthChatbotSystemPrompt`) are large inline template strings — test a prompt change against a few real profiles (a diabetic profile, an allergy profile, an empty/default profile) before merging, since there's no automated eval harness for prompt quality.
- Every AI call is synchronous and un-cached — see `PRODUCT_STRATEGY.md` §1 and §5 before adding a new AI-backed feature. Ask "what happens if 1,000 people hit this in an hour" before shipping it uncapped.

## Working with Mongoose models

Models use the `mongoose.models.X ?? mongoose.model(...)` guard pattern (required for Next.js hot-reload — without it you get "Cannot overwrite model once compiled" errors in dev). Follow the same pattern for any new model. If a query filters or sorts by a field regularly, add the index in the schema file itself (see `ScanHistory` and `DietPlan` for the pattern) — don't rely on MongoDB's default `_id` index for anything queried by `userId`.
