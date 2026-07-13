import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { Expense } from '../models/Expense';

const router = Router();

// GET /api/analytics/summary
router.get('/summary', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalIncome = user.monthlyIncome;

    // Calculate current month's start and end dates
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Sum of expenses for the current month
    const thisMonthExpenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });
    
    const totalExpenses = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const savings = totalIncome - totalExpenses;

    // Calculate 6-week trend
    // Find the current week's start (Monday)
    const tempDate = new Date(now);
    const day = tempDate.getDay();
    const diff = tempDate.getDate() - day + (day === 0 ? -6 : 1);
    const currentWeekStart = new Date(tempDate.setDate(diff));
    currentWeekStart.setHours(0, 0, 0, 0);

    const weeks: { start: Date; end: Date; label: string; amount: number }[] = [];
    for (let i = 3; i >= 0; i--) {
      const wStart = new Date(currentWeekStart.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const wEnd = new Date(wStart.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
      
      const label = `${wStart.toLocaleString('default', { month: 'short' })} ${wStart.getDate()}`;
      weeks.push({ start: wStart, end: wEnd, label, amount: 0 });
    }

    const oldestWeekStart = weeks[0].start;
    const trendExpenses = await Expense.find({
      userId: req.userId,
      date: { $gte: oldestWeekStart },
    });

    trendExpenses.forEach((exp) => {
      const expTime = new Date(exp.date).getTime();
      for (const w of weeks) {
        if (expTime >= w.start.getTime() && expTime <= w.end.getTime()) {
          w.amount += exp.amount;
          break;
        }
      }
    });

    const weeklyTrend = weeks.map((w) => ({
      week: w.label,
      amount: w.amount,
    }));

    // Category breakdown (all time)
    const allExpenses = await Expense.find({ userId: req.userId });
    const categoryMap: { [key: string]: { amount: number; count: number } } = {
      food: { amount: 0, count: 0 },
      travel: { amount: 0, count: 0 },
      shopping: { amount: 0, count: 0 },
      bills: { amount: 0, count: 0 },
      entertainment: { amount: 0, count: 0 },
      health: { amount: 0, count: 0 },
      other: { amount: 0, count: 0 },
    };

    allExpenses.forEach((exp) => {
      if (categoryMap[exp.category]) {
        categoryMap[exp.category].amount += exp.amount;
        categoryMap[exp.category].count += 1;
      }
    });

    const categoryBreakdown = Object.keys(categoryMap).map((cat) => ({
      category: cat,
      amount: categoryMap[cat].amount,
      count: categoryMap[cat].count,
    }));

    return res.status(200).json({
      totalIncome,
      totalExpenses,
      savings,
      weeklyTrend,
      categoryBreakdown,
    });
  } catch (error) {
    console.error('Error generating analytics summary:', error);
    return res.status(500).json({ error: 'Server error generating analytics' });
  }
});

export default router;
