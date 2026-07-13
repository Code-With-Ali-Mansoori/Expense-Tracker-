export type GoalPurpose = 'tracking' | 'savings' | 'habits' | 'other';

export type ExpenseCategory = 'food' | 'travel' | 'shopping' | 'bills' | 'entertainment' | 'health' | 'other';

export type PaymentMode = 'cash' | 'card' | 'upi' | 'other';

export interface User {
  _id: string;
  name: string;
  email: string;
  monthlyIncome: number;
  purpose: GoalPurpose;
  createdAt: string;
}

export interface Expense {
  _id: string;
  userId: string;
  name: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  paymentMode: PaymentMode;
  notes?: string;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface WeeklyTrendItem {
  week: string;
  amount: number;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  count: number;
}

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  weeklyTrend: WeeklyTrendItem[];
  categoryBreakdown: CategoryBreakdownItem[];
}
