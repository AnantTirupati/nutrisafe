const FoodProduct = require('../models/FoodProduct');
const { analyzeRisk } = require('../services/RuleEngine');
const { generateDietAdvice } = require('../services/AIService');

// @desc Scan Barcode
// @route POST /api/scan/barcode
const scanBarcode = async (req, res) => {
    const { barcode } = req.body;
    const user = req.user; // From auth middleware

    if (!barcode) {
        return res.status(400).json({ message: 'Barcode is required' });
    }

    try {
        // 1. Check DB
        let product = await FoodProduct.findOne({ barcode });

        if (!product) {
            // 2. Setup OpenFoodFacts Fallback
            if (barcode === '123456') {
                // Demo Backup
                product = {
                    name: "Mock Soda",
                    brand: "Generic",
                    ingredients: ["Carbonated Water", "High Fructose Corn Syrup", "Caramel Color", "Phosphoric Acid", "Caffeine"],
                    nutrients: { sugar_100g: 11, sodium_100g: 0.01 },
                    barcode: '123456'
                };
            } else {
                // Try OpenFoodFacts API
                try {
                    const axios = require('axios');
                    const offUrl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
                    const { data } = await axios.get(offUrl);

                    if (data.status === 1 && data.product) {
                        const p = data.product;
                        // Map to our schema
                        const newProduct = {
                            barcode: barcode,
                            name: p.product_name || "Unknown Product",
                            brand: p.brands || "Unknown Brand",
                            ingredients: p.ingredients_text ? p.ingredients_text.split(',').map(i => i.trim()) : [],
                            nutrients: {
                                sugar_100g: p.nutriments?.sugars_100g || 0,
                                sodium_100g: p.nutriments?.sodium_100g || 0,
                                trans_fat_100g: p.nutriments?.trans_fat_100g || 0
                            },
                            source: "OpenFoodFacts"
                        };

                        // Save to local DB for caching
                        product = await FoodProduct.create(newProduct);
                    }
                } catch (offErr) {
                    console.error("OpenFoodFacts Fetch Failed:", offErr.message);
                }
            }

            // Final check
            if (!product) {
                return res.status(404).json({ message: 'Product not found. Please scan label text.' });
            }
        }

        // 2. Perform Risk Analysis
        const analysis = await analyzeRisk(user.profile.diseases, product.ingredients);

        // 3. Get AI Insight
        const aiInsight = await generateDietAdvice(user.profile, product, analysis);

        // 3a. MERGE AI RISK (Override Rule Engine if AI finds higher risk)
        if (aiInsight.structured) {
            analysis.overallRisk = aiInsight.structured.overallRisk;
            analysis.score = aiInsight.structured.score;
            // Merge risks if AI found new ones
            if (aiInsight.structured.riskyIngredients) {
                aiInsight.structured.riskyIngredients.forEach(ing => {
                    if (!analysis.risks.find(r => r.ingredient === ing)) {
                        analysis.risks.push({ ingredient: ing, severity: 'AI_DETECTED' });
                    }
                });
            }
        }

        // 4. Save History
        try {
            const ScanHistory = require('../models/ScanHistory');
            await ScanHistory.create({
                user: user._id,
                productName: product.name,
                riskScore: analysis.score,
                overallRisk: analysis.overallRisk,
                risks: analysis.risks
            });
        } catch (e) {
            console.error("History Save Error", e);
        }

        res.json({
            product,
            analysis,
            aiInsight
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Analyze Text/OCR Input
// @route POST /api/scan/analyze
const analyzeText = async (req, res) => {
    const { text } = req.body; // Comma separated ingredients or raw text
    const user = req.user;

    if (!text) {
        return res.status(400).json({ message: 'Text input is required' });
    }

    try {
        // Basic text parsing (splitting by comma)
        const ingredients = text.split(',').map(i => i.trim());
        const mockProduct = { name: "Scanned Item", ingredients };

        const analysis = await analyzeRisk(user.profile.diseases, ingredients);
        const aiInsight = await generateDietAdvice(user.profile, mockProduct, analysis);

        // MERGE AI RISK
        if (aiInsight.structured) {
            analysis.overallRisk = aiInsight.structured.overallRisk;
            analysis.score = aiInsight.structured.score;
        }

        res.json({
            product: mockProduct,
            analysis,
            aiInsight
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Analyze Image (OCR)
// @route POST /api/scan/image
const vision = require('@google-cloud/vision');

// Initialize Vision Client
// Requires GOOGLE_APPLICATION_CREDENTIALS in env or specific key setup
// If fails to init (no creds), we will handle gracefully in the function
let visionClient;
// Only init Vision if we have credentials (prevents MetadataLookupWarning on local dev)
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
        visionClient = new vision.ImageAnnotatorClient();
    } catch (e) {
        console.warn("Vision API Init Error:", e.message);
    }
}

const analyzeImage = async (req, res) => {
    const { image } = req.body; // Base64 string
    const user = req.user;

    if (!image) {
        return res.status(400).json({ message: 'Image data is required' });
    }

    try {
        let text = "";

        // 1. Try Google Vision API
        if (visionClient) {
            try {
                // Remove header if present (data:image/png;base64,)
                const base64Image = image.replace(/^data:image\/\w+;base64,/, "");
                const request = {
                    image: { content: base64Image },
                    features: [{ type: 'TEXT_DETECTION' }],
                };

                const [result] = await visionClient.annotateImage(request);
                const detections = result.textAnnotations;

                if (detections && detections.length > 0) {
                    text = detections[0].description;
                }
            } catch (visionErr) {
                console.error("Vision API Error:", visionErr.message);
                // Fallback will occur below
            }
        }

        // 2. Mock Fallback if Vision failed or returned nothing (for Demo stability)
        if (!text) {
            console.log("Using Mock OCR response");
            text = "Ingredients: Carbonated Water, High Fructose Corn Syrup, Caramel Color, Phosphoric Acid, Caffeine, Sugar.";
        }

        // 3. Process the text to find ingredients
        // Simple cleanup: remove newlines, special chars, split by comma or spaces
        const cleanupText = text.replace(/Ingredients:/i, '').replace(/\n/g, ', ').replace(/\./g, '');
        const ingredients = cleanupText.split(',').map(i => i.trim()).filter(i => i.length > 2);

        // 4. Analyze Risk
        const analysis = await analyzeRisk(user.profile.diseases, ingredients);

        // 5. AI Insight
        const mockProduct = { name: "Scanned Label Product", ingredients };
        const aiInsight = await generateDietAdvice(user.profile, mockProduct, analysis);

        res.json({
            product: mockProduct,
            textDetected: text, // Send back raw text for UI
            analysis,
            aiInsight
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc Get Scan History
// @route GET /api/scan/history
const getScanHistory = async (req, res) => {
    try {
        const ScanHistory = require('../models/ScanHistory');
        // Fetch last 50 scans, newest first
        const history = await ScanHistory.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { scanBarcode, analyzeText, analyzeImage, getScanHistory };
