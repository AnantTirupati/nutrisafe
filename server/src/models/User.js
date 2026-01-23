const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        sparse: true // Allows null/undefined if signing up by phone
    },
    phone: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: true
    },
    profile: {
        diseases: [{
            type: String,
            enum: ['Diabetes', 'Hypertension', 'Celiac', 'Lactose Intolerance', 'Heart Disease', 'Kidney Disease', 'Thyroid', 'None'],
            default: 'None'
        }],
        allergies: [{
            type: String
        }],
        age: Number,
        weight: Number, // in kg
        dietGoal: String // e.g. "Weight Loss", "Maintain", "Muscle Gain"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
