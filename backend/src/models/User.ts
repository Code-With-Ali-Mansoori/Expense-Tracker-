import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  monthlyIncome: number;
  purpose: 'tracking' | 'savings' | 'habits' | 'other';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  monthlyIncome: { type: Number, default: 0 },
  purpose: {
    type: String,
    enum: ['tracking', 'savings', 'habits', 'other'],
    default: 'other',
  },
  createdAt: { type: Date, default: Date.now },
});

export const User = model<IUser>('User', UserSchema);
