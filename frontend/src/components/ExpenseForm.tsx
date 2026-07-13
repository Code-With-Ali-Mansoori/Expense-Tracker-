import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useExpenses } from '../hooks/useExpenses';
import { Expense, ExpenseCategory, PaymentMode } from '../types';

const expenseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.coerce.number().gt(0, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  category: z.enum(['food', 'travel', 'shopping', 'bills', 'entertainment', 'health', 'other']),
  paymentMode: z.enum(['cash', 'card', 'upi', 'other']),
  notes: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export const ExpenseForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  
  const { createExpense, updateExpense, isCreating, isUpdating } = useExpenses();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: '',
      amount: undefined,
      date: new Date().toISOString().split('T')[0],
      category: 'other',
      paymentMode: 'cash',
      notes: '',
    },
  });

  useEffect(() => {
    const handleOpenModal = (event: Event) => {
      const customEvent = event as CustomEvent<{ expense: Expense | null }>;
      const expense = customEvent.detail?.expense;
      
      setEditExpense(expense);
      if (expense) {
        // Pre-fill form values for editing
        reset({
          name: expense.name,
          amount: expense.amount,
          date: new Date(expense.date).toISOString().split('T')[0],
          category: expense.category,
          paymentMode: expense.paymentMode,
          notes: expense.notes || '',
        });
      } else {
        // Clear form values for adding
        reset({
          name: '',
          amount: undefined,
          date: new Date().toISOString().split('T')[0],
          category: 'food',
          paymentMode: 'upi',
          notes: '',
        });
      }
      setIsOpen(true);
    };

    window.addEventListener('open-expense-modal', handleOpenModal);
    return () => {
      window.removeEventListener('open-expense-modal', handleOpenModal);
    };
  }, [reset]);

  const handleClose = () => {
    setIsOpen(false);
    setEditExpense(null);
  };

  const onSubmit = async (data: ExpenseFormData) => {
    try {
      if (editExpense) {
        // Handle update
        await updateExpense({
          id: editExpense._id,
          data: data as any,
        });
        toast.success('Expense updated successfully!');
      } else {
        // Handle create
        await createExpense(data as any);
        toast.success('Expense added successfully!');
      }
      handleClose();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    }
  };

  if (!isOpen) return null;

  const isPending = isCreating || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E1B4B]/35 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-[0_20px_50px_rgba(30,27,75,0.12)] border border-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-mockup-textDark font-heading">
            {editExpense ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-100 text-mockup-textGray hover:text-mockup-textDark rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Expense Name */}
          <div>
            <label className="block text-[11px] font-bold text-mockup-textDark mb-1.5 uppercase tracking-wider">
              Transaction Name
            </label>
            <input
              type="text"
              placeholder="e.g. Starbucks Coffee"
              {...register('name')}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm text-mockup-textDark focus:bg-white focus:outline-none focus:border-mockup-purple focus:ring-2 focus:ring-mockup-purple/10 transition-all placeholder-slate-400 font-medium"
            />
            {errors.name && (
              <span className="text-xs text-rose-500 mt-1 block">{errors.name.message}</span>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-[11px] font-bold text-mockup-textDark mb-1.5 uppercase tracking-wider">
              Amount (₹)
            </label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              {...register('amount')}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm text-mockup-textDark focus:bg-white focus:outline-none focus:border-mockup-purple focus:ring-2 focus:ring-mockup-purple/10 transition-all placeholder-slate-400 font-semibold text-base"
            />
            {errors.amount && (
              <span className="text-xs text-rose-500 mt-1 block">{errors.amount.message}</span>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-bold text-mockup-textDark mb-1.5 uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              {...register('date')}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm text-mockup-textDark focus:bg-white focus:outline-none focus:border-mockup-purple focus:ring-2 focus:ring-mockup-purple/10 transition-all font-medium"
            />
            {errors.date && (
              <span className="text-xs text-rose-500 mt-1 block">{errors.date.message}</span>
            )}
          </div>

          {/* Grid for Category and Payment Mode */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Category */}
            <div>
              <label className="block text-[11px] font-bold text-mockup-textDark mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-sm text-mockup-textDark focus:bg-white focus:outline-none focus:border-mockup-purple focus:ring-2 focus:ring-mockup-purple/10 transition-all capitalize font-medium"
              >
                <option value="food">Food</option>
                <option value="travel">Travel</option>
                <option value="shopping">Shopping</option>
                <option value="bills">Bills</option>
                <option value="entertainment">Entertainment</option>
                <option value="health">Health</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <span className="text-xs text-rose-500 mt-1 block">{errors.category.message}</span>
              )}
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-[11px] font-bold text-mockup-textDark mb-1.5 uppercase tracking-wider">
                Payment Mode
              </label>
              <select
                {...register('paymentMode')}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-sm text-mockup-textDark focus:bg-white focus:outline-none focus:border-mockup-purple focus:ring-2 focus:ring-mockup-purple/10 transition-all capitalize font-medium"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
              {errors.paymentMode && (
                <span className="text-xs text-rose-500 mt-1 block">{errors.paymentMode.message}</span>
              )}
            </div>

          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-mockup-textDark mb-1.5 uppercase tracking-wider">
              Notes (Optional)
            </label>
            <textarea
              placeholder="Add optional notes here..."
              rows={2}
              {...register('notes')}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-sm text-mockup-textDark focus:bg-white focus:outline-none focus:border-mockup-purple focus:ring-2 focus:ring-mockup-purple/10 transition-all placeholder-slate-400 resize-none font-medium"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-mockup-textDark text-sm font-semibold py-3 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-mockup-purple hover:bg-mockup-purpleHover disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {editExpense ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
