const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    monthlyRent: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    bedrooms: {
        type: Number,
        required: true
    },
    bathrooms: {
        type: Number,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    utilities: {
        electricity: Number,
        water: Number,
        internet: Number,
        gas: Number
    },
    notes: String,
    favorite: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['interested', 'contacted', 'viewed', 'applied', 'rejected', 'accepted'],
        default: 'interested'
    },
    createdBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Apartment', apartmentSchema);
