const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc Register new user
// @route POST /api/auth/register
// @desc Register new user
// @route POST /api/auth/register
const registerUser = async (req, res) => {
    const { name, email, phone, password, profile } = req.body;

    try {
        if (!email && !phone) {
            return res.status(400).json({ message: 'Please provide email or phone' });
        }

        // Check if user exists
        const query = {};
        if (email) query.email = email;
        if (phone) query.phone = phone;

        // MongoDB $or if checking both, but usually we just check the identifier provided
        // Simple check:
        const existingUser = await User.findOne({ $or: [{ email: email || null }, { phone: phone || null }] });

        if (existingUser) {
            // specific logic to say WHICH one exists could be good, but generic is fine for now
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
            profile: profile || {}
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profile: user.profile,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Authenticate user & get token
// @route POST /api/auth/login
const loginUser = async (req, res) => {
    const { email, phone, password } = req.body;

    try {
        let user;
        if (email) {
            user = await User.findOne({ email });
        } else if (phone) {
            user = await User.findOne({ phone });
        }

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profile: user.profile,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Get user profile
// @route GET /api/user/profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc Google OAuth Login
// @route POST /api/auth/google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
    const { token } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, email, picture } = ticket.getPayload();

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // Login existing
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profile: user.profile,
                token: generateToken(user._id)
            });
        } else {
            // Create New
            // Note: Password is required by schema, we generate a random secure one for OAuth users
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = await User.create({
                name,
                email,
                password: randomPassword,
                profile: {
                    diseases: [], // Empty initially, user should update profile
                    allergies: []
                }
            });

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                profile: user.profile,
                token: generateToken(user._id),
                isNewUser: true // Flag to frontend to redirect to profile setup
            });
        }

    } catch (error) {
        res.status(401).json({ message: 'Google Token Verification Failed', error: error.message });
    }
};

// @desc Update user profile
// @route PUT /api/user/profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;

            if (req.body.profile) {
                user.profile = {
                    ...user.profile,
                    ...req.body.profile
                };
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                profile: updatedUser.profile,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile, googleLogin };
