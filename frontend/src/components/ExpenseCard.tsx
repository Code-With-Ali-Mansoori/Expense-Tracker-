import React from 'react';
import { 
  Utensils, Compass, ShoppingBag, Receipt, 
  Film, Heart, HelpCircle, Calendar, CreditCard, 
  Wallet, Sparkles, Edit2, Trash2 
} from 'lucide-react';
import { Expense } from '../types';

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

export const categoryMeta = {
  food: { icon: Utensils, color: 'text-amber-500', bg: 'bg-amber-50 border-amber-100/50' },
  travel: { icon: Compass, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100/50' },
  shopping: { icon: ShoppingBag, color: 'text-pink-500', bg: 'bg-pink-50 border-pink-100/50' },
  bills: { icon: Receipt, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100/50' },
  entertainment: { icon: Film, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-100/50' },
  health: { icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100/50' },
  other: { icon: HelpCircle, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-100/50' },
};

export const paymentMeta = {
  cash: { label: 'Cash', icon: Wallet },
  card: { label: 'Card', icon: CreditCard },
  upi: { label: 'UPI', icon: Sparkles },
  other: { label: 'Other', icon: HelpCircle },
};

export const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense, onDelete }) => {
  const meta = categoryMeta[expense.category] || categoryMeta.other;
  const CategoryIcon = meta.icon;
  
  const payMeta = paymentMeta[expense.paymentMode] || paymentMeta.other;
  const PayIcon = payMeta.icon;

  const formattedDate = new Date(expense.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(expense.createdAt || expense.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const handleEdit = () => {
    window.dispatchEvent(new CustomEvent('open-expense-modal', { detail: { expense } }));
  };

  return (
    <div className="bg-white rounded-2xl p-4 flex justify-between items-center transition-all duration-300 hover:scale-[1.01] hover:shadow-mockup-hover border border-slate-100 shadow-[0_4px_20px_rgba(30,27,75,0.02)]">
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Category Circle Icon */}
        <div className={`p-3 rounded-2xl border flex-shrink-0 ${meta.bg}`}>
          <CategoryIcon className={`w-5 h-5 ${meta.color}`} />
        </div>
        <div className="min-w-0">
          <h4 className="font-bold text-sm text-mockup-textDark truncate pr-1">{expense.name}</h4>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-mockup-textGray text-xs">
            <span className="font-semibold text-[11px] text-mockup-textLight">
              {formattedTime}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
            <span className="flex items-center gap-1 font-semibold text-[11px] text-mockup-textLight">
              <Calendar size={11} />
              {formattedDate}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-200"></span>
            <span className="flex items-center gap-1 capitalize font-semibold text-[11px] text-mockup-textLight">
              <PayIcon size={11} />
              {payMeta.label}
            </span>
          </div>
          {expense.notes && (
            <p className="text-[10px] text-mockup-textLight italic mt-1 line-clamp-1">
              {expense.notes}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <div className="text-right">
          <span className="font-bold text-sm text-rose-500 font-heading">
            -₹{expense.amount.toLocaleString('en-IN')}
          </span>
        </div>
        
        {/* Action Controls */}
        <div className="flex gap-1 ml-2">
          <button 
            onClick={handleEdit}
            className="p-2 hover:bg-slate-50 text-mockup-textLight hover:text-mockup-purple rounded-xl transition-colors"
            title="Edit"
          >
            <Edit2 size={13} />
          </button>
          <button 
            onClick={() => onDelete(expense._id)}
            className="p-2 hover:bg-rose-50 text-mockup-textLight hover:text-rose-500 rounded-xl transition-colors"
            title="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
