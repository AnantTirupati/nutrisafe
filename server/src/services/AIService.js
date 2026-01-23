const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "mock_key");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const generateDietAdvice = async (userProfile, product, riskAnalysis) => {
    // Construct the System Prompt
    const systemPrompt = `
You are a specialized Clinical Dietitian AI.
Your Goal: Analyze food risk and provide safe eating advice.
Constraints: 
1. EXPLAIN risks simply (5th grade level).
2. SUGGEST 2 safer alternatives.
3. ADVISE on portion control.
4. DO NOT give medical diagnosis.
5. ALWAYS append disclaimer: "This is not medical advice."
  `;

    const userContext = `
User Conditions: ${userProfile.diseases.join(', ')}
User Allergies: ${userProfile.allergies.join(', ')}
  `;

    const foodContext = `
Product: ${product.name}
Ingredients: ${product.ingredients.join(', ')}
Risk Findings: ${riskAnalysis.overallRisk}
Specific Risks: ${riskAnalysis.risks.map(r => `${r.ingredient} (${r.reason})`).join(', ')}
  `;

    const fullPrompt = `${systemPrompt}\n\n${userContext}\n\n${foodContext}\n\nTask: Provide your analysis.`;

    console.log("--- AI PROMPT GENERATED ---");
    // console.log(fullPrompt); // Optional debug
    console.log("---------------------------");

    let finalResponse = "";

    // 1. Try Real Gemini API
    try {
        if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes('mock')) {
            throw new Error("No valid API Key set");
        }

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        finalResponse = response.text();
        console.log("✅ Gemini API Success");

    } catch (error) {
        console.error("⚠️ Gemini API Failed (Using Fallback):", error.message);

        // 2. Mock Fallback (for Demo or Error)
        if (riskAnalysis.overallRisk === 'HIGH') {
            finalResponse = `
### ⚠️ Analysis (Offline Mode)
This product is **HIGH RISK** for you. It contains **${riskAnalysis.risks.map(r => r.ingredient).join(', ')}**, which are not recommended for **${userProfile.diseases.join(' or ')}**.

### 🥦 Safer Alternatives
1. Fresh fruit or unseasoned roasted nuts.
2. Low-sodium, sugar-free versions of this product.

### 🍽️ Portion Advice
If you must eat this, limit to a very small amount (less than 1 serving). Avoid eating it on an empty stomach.

*This is not medical advice.*
        `;
        } else if (riskAnalysis.overallRisk === 'MODERATE') {
            finalResponse = `
### ⚠️ Analysis (Offline Mode)
This product is **MODERATE RISK**. It contains ingredients that should be limited.

### 🥦 Safer Alternatives
1. Homemade version with less salt/sugar.
2. Brands explicitly labeled "Heart Healthy".

### 🍽️ Portion Advice
Eat in moderation. Pair with fiber-rich foods to slow absorption.

*This is not medical advice.*
        `;
        } else {
            finalResponse = `
### ✅ Analysis (Offline Mode)
This product appears **SAFE** for your specific conditions based on the ingredients list.

### 🥦 Tips
Enjoy as part of a balanced diet! 

*This is not medical advice.*
        `;
        }
    }

    return {
        prompt: fullPrompt,
        response: finalResponse
    };
};

module.exports = { generateDietAdvice };
