const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    recurring: {
        type: Boolean,
        default: false
    },
    frequency: {
        type: String,
        enum: ['one-time', 'weekly', 'monthly', 'yearly'],
        default: 'one-time'
    }
});

const budgetSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    totalBudget: {
        type: Number,
        required: true
    },
    expenses: [expenseSchema],
    categories: [{
        name: String,
        budget: Number,
        color: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Budget', budgetSchema);
