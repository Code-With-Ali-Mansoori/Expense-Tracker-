"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
const preferencesSchema = zod_1.z.object({
    monthlyIncome: zod_1.z.number().min(0, 'Monthly income must be at least 0'),
    purpose: zod_1.z.enum(['tracking', 'savings', 'habits', 'other']),
});
// GET /api/user/me
router.get('/me', auth_1.verifyToken, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        return res.status(500).json({ error: 'Server error fetching user profile' });
    }
});
// PATCH /api/user/preferences
router.patch('/preferences', auth_1.verifyToken, async (req, res) => {
    try {
        const parseResult = preferencesSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ error: parseResult.error.errors[0].message });
        }
        const { monthlyIncome, purpose } = parseResult.data;
        const user = await User_1.User.findByIdAndUpdate(req.userId, { $set: { monthlyIncome, purpose } }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.status(200).json(user);
    }
    catch (error) {
        console.error('Error updating user preferences:', error);
        return res.status(500).json({ error: 'Server error updating preferences' });
    }
});
exports.default = router;
