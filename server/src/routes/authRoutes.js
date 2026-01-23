const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', require('../controllers/authController').googleLogin);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, require('../controllers/authController').updateUserProfile);

module.exports = router;
