import { Schema, model, Document, Types } from 'mongoose';

export interface IExpense extends Document {
  userId: Types.ObjectId;
  name: string;
  amount: number;
  date: Date;
  category: 'food' | 'travel' | 'shopping' | 'bills' | 'entertainment' | 'health' | 'other';
  paymentMode: 'cash' | 'card' | 'upi' | 'other';
  notes?: string;
  createdAt: Date;
}

const ExpenseSchema = new Schema<IExpense>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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

export const Expense = model<IExpense>('Expense', ExpenseSchema);
