const express = require('express');
const router = express.Router();
const { scanBarcode, analyzeText, analyzeImage } = require('../controllers/scanController');
const { protect } = require('../middleware/authMiddleware');

router.post('/barcode', protect, scanBarcode);
router.post('/analyze', protect, analyzeText);
router.post('/image', protect, analyzeImage);
router.get('/history', protect, require('../controllers/scanController').getScanHistory);

module.exports = router;
