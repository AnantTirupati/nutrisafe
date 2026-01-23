# 🚀 NutriSafe Deployment Guide

## Prerequisites
- **Node.js** (v16+)
- **MongoDB** (Running locally on port 27017)

## 1. Backend Setup
1. Open a terminal.
2. Navigate to server:
   ```bash
   cd server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Seed the Database (Initial Rules):
   ```bash
   npm run seed
   ```
5. Start the Server:
   ```bash
   npm start
   ```
   *Expected Output: `Server running on port 5000` & `MongoDB Connected...`*

## 2. Frontend Setup
1. Open a **new** terminal.
2. Navigate to client:
   ```bash
   cd client
   ```
3. Install dependencies (if not already done):
   ```bash
   npm install
   ```
4. Start the Client:
   ```bash
   npm run dev
   ```
5. Open browser at: **http://localhost:3000**

## 3. How to Demo
1. **Landing Page**: Click "Get Started" or "Try Demo Scan".
2. **Login**: Click **"Start Demo Mode (Diabetes Profile)"**.
   - This logs you in as a user with **Diabetes** & **Hypertension**.
3. **Scan Barcode**:
   - Use defaults or enter `123456` manually to simulate a soda scan.
   - Result: **RED / HIGH RISK** (Sugar content).
4. **Text Scan**:
   - Switch to "Ingredient Text" tab.
   - Type: `Salt, Sodium Benzoate, Palm Oil`.
   - Click "Analyze Risks".
   - Result: **Red/Yellow** based on Hypertension rules.
   - Read the AI Explanation.

## Troubleshooting
- **Mongo Error**: Ensure MongoDB service is running. If no Mongo, check `server/src/config/db.js` and set URI to a cloud Atlas URI if needed.
- **Camera Error**: Ensure browser permissions are allowed. If camera fails, use the Manual Input modes created for fallback.
