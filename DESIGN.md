# NutriSafe — Design System

The visual and content language established across the product this session. Written so the next person adding a page or component doesn't have to reverse-engineer it from scattered Tailwind classes.

## Color

**Brand.** One green scale, defined once in `tailwind.config.ts` as `primary` (50→900), derived from the marketing site's original brand colors: `#153322` (dark, near-black green — hero backgrounds, footer, primary-900) and `#4aa366` (mid accent — CTAs, links, primary-500). Every `btn-primary`, badge, focus ring, and active-nav-state across the *entire* app — landing and signed-in — pulls from this one scale. Before this session, the app interior used Tailwind's stock green (`#16a34a`) while the landing page used the real brand color; they read as two different products. Don't reintroduce a second color system for a new page — retint `primary` if the brand color itself needs to change, don't hardcode a competing hex.

**Semantic status color** is a *separate* concern from brand color and must stay separate:
- Green (`green-*`) = good fit / safe / success
- Amber (`amber-*`) = caution / needs attention
- Red (`red-*`) = not recommended / error / destructive action

These map 1:1 to `RiskBadge` and to form/toast feedback (`ToastProvider`). Never repurpose brand green to mean "safe" in a context where amber/red siblings are also present — use the semantic scale so the three states stay visually distinct from each other, independent of whatever the brand accent happens to be.

**Premium/gold** (`amber-400`→`orange-500` gradient) is a third, deliberate exception: the `/premium` page and `Crown` icon markers use gold specifically to signal "premium tier," a convention borrowed from way outside this palette (loyalty programs, premium tiers everywhere) precisely because it needs to read as different from both brand-green and semantic-amber-caution. Don't use gold anywhere else.

## Typography

Two contexts, two (intentionally different) type systems — don't merge them:

- **Landing page** (`src/app/page.tsx`, `LandingNav`): **Outfit** (headings, 600–800 weight) + **Figtree** (body/UI, 400–700), loaded via a single Google Fonts `@import` in `globals.css`. Chosen because they were already the dominant pairing on the page before this session's cleanup (the page previously had *six* competing font families, including a CJK-optimized face on an English heading — all removed).
- **Signed-in app**: **Inter**, loaded via `next/font/google` in the root layout as the default `font-sans`. Deliberately *not* Outfit/Figtree — introducing a third font family into the app interior would repeat the exact fragmentation problem just fixed on the landing page. Inter was kept because "trustworthy, accessible, professional, clean" — the mood a health-data dashboard needs — is exactly what Inter already provides; there was no reason to add a new typeface just because a generic dashboard template suggested one.
- The **"NutriSafe" wordmark** is Outfit-extrabold everywhere it appears (landing nav, landing footer, signed-in sidebar, auth pages) — this was inconsistent (a different lucide `Shield` + default-weight-Inter treatment in the app) and was unified this session.

## Voice: how results are described

**Never describe a food's fit for a user's health profile as "risk" without qualification.** "High Risk" on a badge over a snack reads like a lethality warning, not what it actually is: a personalized-suitability rating. As of this session, the display labels are:

| Internal value (DB/API — unchanged) | Displayed as |
|---|---|
| `low` | **Good Fit** |
| `medium` | **Use Caution** |
| `high` | **Not Recommended** |

The underlying `riskLevel` enum, `RiskHistory` schema field names, and the AI prompt contract in `lib/gemini.ts` all still use `low`/`medium`/`high` — that's a data-model concern, not a copy concern, and changing it would require a migration and touch the AI output contract for no user-facing benefit. Only the *label* changed, everywhere it's rendered: `RiskBadge`, the dashboard's result-breakdown legend and stat tiles, the scan page's ingredient-insight tags (`harmful` → displayed as "Avoid"), and every piece of marketing copy that used to say "risk levels."

Apply the same instinct to any new copy: describe what the AI actually assessed (fit for *your* profile) rather than borrowing danger/hazard language that implies more certainty or severity than a food-label analysis can honestly claim.

## Layout

**Signed-in app**: fixed left sidebar (`Sidebar.tsx`, 256px, `lg:` and up) + `Topbar` (search, notifications, profile) + scrollable content area (`max-w-6xl`, centered). Below `lg`, the sidebar collapses to a slim top bar with a hamburger-triggered slide-out drawer — never an icon-only nav row (icon-only nav loses screen-reader discoverability and cramps at in-between widths; this replaced an earlier icon-row pattern for exactly that reason).

**Cards** are the base content unit: `rounded-2xl border border-slate-200 bg-white shadow-sm`, consistent padding (`p-5`/`p-6`). Don't invent a second card treatment (different radius, different border) for a new section — extend the existing `.card` utility or match its values inline if Tailwind arbitrary values are needed.

**Empty states** always pair an icon + one line of explanation + (where there's a next action) a CTA — never a blank section. See `history/page.tsx`, `scan/page.tsx`'s Safe Foods section, and the dashboard's per-section fallbacks for the pattern.

## Components (`src/components/`)

- `RiskBadge` — the one place status-label text is defined; see Voice section above.
- `Sidebar` — the whole-app navigation shell, desktop rail + mobile drawer in one component.
- `Topbar` — search + notifications + profile, sits above page content in the protected layout.
- `HealthChatbot` — floating widget, mounted once at the protected-layout level (not per-page) so it's available from every authenticated route.
- `PremiumGate` — blurred-preview paywall wrapper. Its skeleton is hand-shaped to mirror the actual page behind it (the Diet Plan form) rather than generic placeholder bars — do this for any new gated page rather than reusing a one-size-fits-all skeleton.
- `ui/Modal`, `ui/ConfirmDialog`, `ui/PromptDialog`, `ui/ToastProvider` — the shared primitives that replaced every native `alert()`/`confirm()`/`window.prompt()` in the app this session. Use these for any new destructive-confirm, name-prompt, or error-surfacing need — don't reach for the native browser dialogs, they break the whole design system's visual consistency and (for `alert`/`confirm`) block the JS thread.

## Accessibility baseline established this session

- `role="tablist"`/`role="tab"`/`aria-selected` on the scan page's input-method tabs.
- `aria-live="polite"`/`role="status"` on the profile page's save-result banner and the toast system.
- `aria-label` on every icon-only button (sidebar hamburger, sign-out, chatbot toggle).
- Raw NextAuth error codes (`OAuthAccountNotLinked`, etc.) mapped to actual sentences on `/auth/error` rather than shown verbatim.
- `prefers-reduced-motion` guard on the premium page's ambient background animation.

Carry these forward for new interactive components — they're the floor, not a one-off fix.
