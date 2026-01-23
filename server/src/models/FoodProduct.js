const mongoose = require('mongoose');

const foodProductSchema = new mongoose.Schema({
    barcode: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String
    },
    ingredients: [{
        type: String // We will store ingredients as individual strings or a full text block if needed. Array is better for matching.
    }],
    nutrients: {
        sugar_100g: Number,
        sodium_100g: Number,
        trans_fat_100g: Number,
        calories_100g: Number,
        description: String // For other nutrients
    },
    image_url: String,
    source: {
        type: String,
        default: 'UserScan'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FoodProduct', foodProductSchema);
