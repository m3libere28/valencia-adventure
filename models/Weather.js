const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true
    },
    temperature: {
        current: Number,
        feels_like: Number,
        min: Number,
        max: Number
    },
    humidity: Number,
    description: String,
    icon: String,
    wind: {
        speed: Number,
        direction: Number
    },
    timestamp: {
        type: Date,
        default: Date.now,
        expires: 3600 // Document will be automatically deleted after 1 hour
    }
});

module.exports = mongoose.model('Weather', weatherSchema);
