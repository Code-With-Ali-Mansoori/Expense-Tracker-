"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const Expense_1 = require("../models/Expense");
const router = (0, express_1.Router)();
const expenseCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    amount: zod_1.z.number().gt(0, 'Amount must be greater than 0'),
    date: zod_1.z.string().transform((val) => new Date(val)),
    category: zod_1.z.enum(['food', 'travel', 'shopping', 'bills', 'entertainment', 'health', 'other']),
    paymentMode: zod_1.z.enum(['cash', 'card', 'upi', 'other']),
    notes: zod_1.z.string().optional(),
});
const expenseUpdateSchema = expenseCreateSchema.partial();
// POST /api/expenses
router.post('/', auth_1.verifyToken, async (req, res) => {
    try {
        const parseResult = expenseCreateSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.errors[0].message });
        }
        const expenseData = parseResult.data;
        const newExpense = new Expense_1.Expense({
            ...expenseData,
            userId: req.userId,
        });
        await newExpense.save();
        return res.status(201).json(newExpense);
    }
    catch (error) {
        console.error('Error creating expense:', error);
        return res.status(500).json({ error: 'Server error creating expense' });
    }
});
// GET /api/expenses (supports filters: category, paymentMode, startDate, endDate)
router.get('/', auth_1.verifyToken, async (req, res) => {
    try {
        const { category, paymentMode, startDate, endDate } = req.query;
        // Base filter to restrict to current user
        const filter = { userId: req.userId };
        if (category) {
            filter.category = category;
        }
        if (paymentMode) {
            filter.paymentMode = paymentMode;
        }
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) {
                filter.date.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.date.$lte = new Date(endDate);
            }
        }
        // Retrieve sorted by date descending, then creation date descending
        const expenses = await Expense_1.Expense.find(filter).sort({ date: -1, createdAt: -1 });
        return res.status(200).json(expenses);
    }
    catch (error) {
        console.error('Error fetching expenses:', error);
        return res.status(500).json({ error: 'Server error fetching expenses' });
    }
});
// GET /api/expenses/:id
router.get('/:id', auth_1.verifyToken, async (req, res) => {
    try {
        const expense = await Expense_1.Expense.findOne({ _id: req.params.id, userId: req.userId });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        return res.status(200).json(expense);
    }
    catch (error) {
        console.error('Error fetching expense:', error);
        return res.status(500).json({ error: 'Server error fetching expense' });
    }
});
// PATCH /api/expenses/:id
router.patch('/:id', auth_1.verifyToken, async (req, res) => {
    try {
        const parseResult = expenseUpdateSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.errors[0].message });
        }
        const updateData = parseResult.data;
        const expense = await Expense_1.Expense.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, { $set: updateData }, { new: true, runValidators: true });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found or unauthorized' });
        }
        return res.status(200).json(expense);
    }
    catch (error) {
        console.error('Error updating expense:', error);
        return res.status(500).json({ error: 'Server error updating expense' });
    }
});
// DELETE /api/expenses/:id
router.delete('/:id', auth_1.verifyToken, async (req, res) => {
    try {
        const expense = await Expense_1.Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!expense) {
            return res.status(404).json({ error: 'Expense not found or unauthorized' });
        }
        return res.status(200).json({ message: 'Expense deleted successfully', id: expense._id });
    }
    catch (error) {
        console.error('Error deleting expense:', error);
        return res.status(500).json({ error: 'Server error deleting expense' });
    }
});
exports.default = router;
