const RiskRule = require('../models/RiskRule');

/**
 * Analyze ingredients against user conditions
 * @param {Array} userDiseases - List of user's diseases (e.g. ['Diabetes'])
 * @param {Array} productIngredients - List of ingredients strings
 * @returns {Object} result - { score, risks: [], safe: boolean, analysisText }
 */
const analyzeRisk = async (userDiseases, productIngredients) => {
    if (!userDiseases || userDiseases.length === 0) {
        return { score: 10, risks: [], safe: true, analysisText: "No health conditions specified." };
    }

    // normalize ingredients
    const normalizedIngredients = productIngredients.map(i => i.toLowerCase().trim());

    // Fetch rules for these diseases
    const rules = await RiskRule.find({ condition: { $in: userDiseases } });

    let risks = [];
    let score = 10; // Start with perfect score

    for (const rule of rules) {
        const riskTerm = rule.risk_ingredient.toLowerCase();

        // Check if any ingredient contains the risk term
        // naive check: ingredient.includes(riskTerm) -> this covers "Cane Sugar" contains "Sugar"
        // Better check needed to avoid false positives but for MVP includes is okay if rules are specific.

        const match = normalizedIngredients.find(ing => ing.includes(riskTerm));

        if (match) {
            risks.push({
                ingredient: match,
                condition: rule.condition,
                severity: rule.severity,
                reason: rule.reason
            });

            // Deduction logic
            if (rule.severity === 'HIGH') score -= 5;
            else if (rule.severity === 'MODERATE') score -= 2;
        }
    }

    // Cap score
    if (score < 0) score = 0;

    // Determine status
    let overallRisk = 'SAFE';
    let color = 'green';
    if (score < 5) {
        overallRisk = 'HIGH';
        color = 'red';
    } else if (score < 8) {
        overallRisk = 'MODERATE';
        color = 'yellow';
    }

    return {
        score,
        overallRisk,
        color,
        risks, // Detail list
        success: true
    };
};

module.exports = { analyzeRisk };
