# NutriSafe

A production-ready food safety & diet assistant that analyzes packaged food ingredients against your health conditions and allergies. Get instant risk levels, plain-language ingredient explanations, and personalized recommendations.

## Features

- **Authentication**: Email/password signup and Google OAuth (NextAuth.js)
- **Health profile**: Age, gender, medical conditions (Diabetes, Hypertension, PCOS, Heart Disease, etc.), allergies (Nuts, Gluten, Lactose, Soy, etc.), dietary preference (Veg / Non-Veg / Vegan)
- **Food input**:
  - **Barcode**: Fetch product from Open Food Facts and analyze
  - **Label photo**: Upload image → OCR (Gemini) → extract ingredients → analyze
  - **Manual**: Type product name and ingredients
- **AI analysis**: Gemini interprets ingredients, cross-checks your profile, returns risk level (Low / Medium / High), per-ingredient insights (safe / caution / harmful), and recommendations
- **Scan history**: Past scans with timestamps and risk levels
- **Safe for me**: List of low-risk foods you’ve scanned

## Tech stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API routes, NextAuth.js
- **Database**: MongoDB (Mongoose)
- **AI**: Google Gemini (OCR + ingredient analysis)
- **Barcode data**: Open Food Facts API (no key required)

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Cloud project with OAuth consent screen and Gemini API enabled

## Setup

1. **Clone and install**

   ```bash
   cd nutrisafe
   npm install
   ```


3. **Run MongoDB** (if local)

   ```bash
   mongod
   ```

4. **Run dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app/` – App Router pages and API routes
- `src/app/(protected)/` – Dashboard, profile, scan, history, safe-foods (auth required)
- `src/app/api/` – Auth, profile, barcode, analyze, history, safe-foods
- `src/lib/` – DB, auth config, Gemini client, utils
- `src/models/` – Mongoose schemas (User, HealthProfile, FoodProduct, ScanHistory, IngredientKnowledge)
- `src/components/` – DashboardNav, RiskBadge

## Security & privacy

- Health data is stored only in your MongoDB; it is not sent to third parties except to Gemini for analysis (product/ingredients + your profile for personalization).
- Passwords are hashed with bcrypt.
- Session is JWT-based (NextAuth). Protect `/dashboard`, `/profile`, `/scan`, `/history`, `/safe-foods` via middleware (already configured).

## License

MIT.
