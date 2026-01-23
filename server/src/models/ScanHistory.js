const mongoose = require('mongoose');

const scanHistorySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    productName: {
        type: String,
        required: true
    },
    scannedText: {
        type: String // optional, if OCR was used
    },
    riskScore: {
        type: Number,
        required: true
    },
    overallRisk: {
        type: String, // HIGH, MODERATE, LOW
        required: true
    },
    risks: [{
        ingredient: String,
        severity: String
    }], // Store brief snapshot of why it was risky
    scannedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
