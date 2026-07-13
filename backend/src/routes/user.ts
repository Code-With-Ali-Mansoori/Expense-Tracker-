import { Router, Response } from 'express';
import { z } from 'zod';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

const preferencesSchema = z.object({
  monthlyIncome: z.number().min(0, 'Monthly income must be at least 0'),
  purpose: z.enum(['tracking', 'savings', 'habits', 'other']),
});

// GET /api/user/me
router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Server error fetching user profile' });
  }
});

// PATCH /api/user/preferences
router.patch('/preferences', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = preferencesSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const { monthlyIncome, purpose } = parseResult.data;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { monthlyIncome, purpose } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return res.status(500).json({ error: 'Server error updating preferences' });
  }
});

export default router;
