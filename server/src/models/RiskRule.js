const mongoose = require('mongoose');

const riskRuleSchema = new mongoose.Schema({
    condition: {
        type: String,
        required: true,
        index: true // e.g., "Diabetes"
    },
    risk_ingredient: {
        type: String,
        required: true // e.g., "Sugar", "Sucrose", "High Fructose Corn Syrup"
    },
    severity: {
        type: String,
        enum: ['HIGH', 'MODERATE', 'SAFE'],
        default: 'MODERATE'
    },
    reason: {
        type: String,
        required: true // e.g., "Causes rapid blood sugar spike."
    }
});

module.exports = mongoose.model('RiskRule', riskRuleSchema);
