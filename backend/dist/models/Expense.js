"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expense = void 0;
const mongoose_1 = require("mongoose");
const ExpenseSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    category: {
        type: String,
        enum: ['food', 'travel', 'shopping', 'bills', 'entertainment', 'health', 'other'],
        required: true,
    },
    paymentMode: {
        type: String,
        enum: ['cash', 'card', 'upi', 'other'],
        required: true,
    },
    notes: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
});
exports.Expense = (0, mongoose_1.model)('Expense', ExpenseSchema);
