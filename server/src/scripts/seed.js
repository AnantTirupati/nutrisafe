const mongoose = require('mongoose');
const dotenv = require('dotenv');
const RiskRule = require('../models/RiskRule');
const connectDB = require('../config/db');

dotenv.config();
connectDB();

const importData = async () => {
    try {
        await RiskRule.deleteMany();

        const rules = [
            // Diabetes Rules
            { condition: 'Diabetes', risk_ingredient: 'Sugar', severity: 'HIGH', reason: 'Directly spikes blood glucose levels.' },
            { condition: 'Diabetes', risk_ingredient: 'Corn Syrup', severity: 'HIGH', reason: 'High glycemic index sweetener.' },
            { condition: 'Diabetes', risk_ingredient: 'Dextrose', severity: 'HIGH', reason: 'Rapidly absorbed sugar.' },
            { condition: 'Diabetes', risk_ingredient: 'Maltodextrin', severity: 'MODERATE', reason: 'Can affect blood sugar.' },

            // Hypertension (BP) Rules
            { condition: 'Hypertension', risk_ingredient: 'Salt', severity: 'HIGH', reason: 'Increases blood pressure.' },
            { condition: 'Hypertension', risk_ingredient: 'Sodium', severity: 'HIGH', reason: 'Main contributor to high blood pressure.' },
            { condition: 'Hypertension', risk_ingredient: 'Sodium Benzoate', severity: 'MODERATE', reason: 'Sodium preservative, adds to load.' },
            { condition: 'Hypertension', risk_ingredient: 'MSG', severity: 'MODERATE', reason: 'Contains sodium.' },

            // Heart Disease
            { condition: 'Heart Disease', risk_ingredient: 'Hydrogenated', severity: 'HIGH', reason: 'Indicator of Trans Fats.' },
            { condition: 'Heart Disease', risk_ingredient: 'Palm Oil', severity: 'MODERATE', reason: 'High saturated fat content.' },

            // Kidney Disease
            { condition: 'Kidney Disease', risk_ingredient: 'Sodium', severity: 'HIGH', reason: 'Fluid retention risk.' },
            { condition: 'Kidney Disease', risk_ingredient: 'Potassium', severity: 'MODERATE', reason: 'Should be monitored.' }
        ];

        await RiskRule.insertMany(rules);

        console.log('Risk Rules Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
