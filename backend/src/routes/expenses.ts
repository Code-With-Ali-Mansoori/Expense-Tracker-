import { Router, Response } from 'express';
import { z } from 'zod';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { Expense } from '../models/Expense';

const router = Router();

const expenseCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().gt(0, 'Amount must be greater than 0'),
  date: z.string().transform((val) => new Date(val)),
  category: z.enum(['food', 'travel', 'shopping', 'bills', 'entertainment', 'health', 'other']),
  paymentMode: z.enum(['cash', 'card', 'upi', 'other']),
  notes: z.string().optional(),
});

const expenseUpdateSchema = expenseCreateSchema.partial();

// POST /api/expenses
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = expenseCreateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const expenseData = parseResult.data;
    const newExpense = new Expense({
      ...expenseData,
      userId: req.userId,
    });

    await newExpense.save();
    return res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({ error: 'Server error creating expense' });
  }
});

// GET /api/expenses (supports filters: category, paymentMode, startDate, endDate)
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { category, paymentMode, startDate, endDate } = req.query;
    
    // Base filter to restrict to current user
    const filter: any = { userId: req.userId };

    if (category) {
      filter.category = category;
    }

    if (paymentMode) {
      filter.paymentMode = paymentMode;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate as string);
      }
    }

    // Retrieve sorted by date descending, then creation date descending
    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
    return res.status(200).json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return res.status(500).json({ error: 'Server error fetching expenses' });
  }
});

// GET /api/expenses/:id
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    return res.status(200).json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return res.status(500).json({ error: 'Server error fetching expense' });
  }
});

// PATCH /api/expenses/:id
router.patch('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const parseResult = expenseUpdateSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: parseResult.error.errors[0].message });
    }

    const updateData = parseResult.data;

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found or unauthorized' });
    }

    return res.status(200).json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return res.status(500).json({ error: 'Server error updating expense' });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found or unauthorized' });
    }
    return res.status(200).json({ message: 'Expense deleted successfully', id: expense._id });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({ error: 'Server error deleting expense' });
  }
});

export default router;
