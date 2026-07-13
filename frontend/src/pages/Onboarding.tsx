import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BarChart, PiggyBank, Search, Settings, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { GoalPurpose } from '../types';

const onboardingSchema = z.object({
  monthlyIncome: z.coerce.number().gt(0, 'Monthly income must be greater than 0'),
  purpose: z.enum(['tracking', 'savings', 'habits', 'other']),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const Onboarding: React.FC = () => {
  const { user, updatePreferences } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If user already did onboarding, skip and go home
  useEffect(() => {
    if (user && user.monthlyIncome > 0) {
      navigate('/');
    }
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      monthlyIncome: undefined,
      purpose: 'tracking',
    },
  });

  const selectedPurpose = watch('purpose');

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await updatePreferences(data.monthlyIncome, data.purpose);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const purposes = [
    {
      id: 'tracking' as GoalPurpose,
      title: 'Expense Tracking',
      desc: 'Keep a clean log of all your expenses',
      icon: BarChart,
      color: 'text-blue-500 bg-blue-50 border-blue-100/50',
      activeColor: 'border-mockup-purple ring-4 ring-mockup-purple/10 bg-mockup-bgPurple/10',
    },
    {
      id: 'savings' as GoalPurpose,
      title: 'Goal Savings',
      desc: 'Optimize monthly budgets to save more money',
      icon: PiggyBank,
      color: 'text-emerald-500 bg-emerald-50 border-emerald-100/50',
      activeColor: 'border-mockup-purple ring-4 ring-mockup-purple/10 bg-mockup-bgPurple/10',
    },
    {
      id: 'habits' as GoalPurpose,
      title: 'Habits Analytics',
      desc: 'Understand spending behaviors and patterns',
      icon: Search,
      color: 'text-mockup-purple bg-mockup-bgPurple border-[#DDD6FE]/30',
      activeColor: 'border-mockup-purple ring-4 ring-mockup-purple/10 bg-mockup-bgPurple/10',
    },
    {
      id: 'other' as GoalPurpose,
      title: 'Other / Mixed',
      desc: 'Multiple personal finance goals combined',
      icon: Settings,
      color: 'text-slate-500 bg-slate-50 border-slate-100/50',
      activeColor: 'border-mockup-purple ring-4 ring-mockup-purple/10 bg-mockup-bgPurple/10',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-mockup-bg relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#EDE9FE] rounded-full blur-[120px] pointer-events-none opacity-60"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFEFEA] rounded-full blur-[120px] pointer-events-none opacity-60"></div>

      <div className="w-full max-w-md z-10 my-8 flex flex-col items-center">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-mockup-textDark tracking-tight font-heading">
            Welcome, {user?.name}!
          </h2>
          <p className="text-xs text-mockup-textGray mt-2 font-bold uppercase tracking-wider">
            Let's configure your expense preferences
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-[0_12px_40px_rgba(30,27,75,0.04)] border border-slate-100/60 w-full">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-500 text-xs px-3.5 py-3 rounded-xl mb-5 text-center font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Income field */}
            <div>
              <label className="block text-[10px] font-bold text-mockup-textDark mb-1.5 uppercase tracking-wider">
                Monthly Income (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 50000"
                {...register('monthlyIncome')}
                className="w-full bg-slate-50 border border-slate-200/85 rounded-xl px-4 py-3 text-xs text-mockup-textDark focus:bg-white focus:outline-none focus:border-mockup-purple focus:ring-2 focus:ring-mockup-purple/10 transition-all placeholder-slate-400 font-semibold"
              />
              {errors.monthlyIncome && (
                <span className="text-xs text-rose-500 mt-1.5 block font-semibold">{errors.monthlyIncome.message}</span>
              )}
            </div>

            {/* Purpose selection cards */}
            <div>
              <label className="block text-[10px] font-bold text-mockup-textDark mb-3 uppercase tracking-wider">
                What is your financial goal?
              </label>
              <div className="grid grid-cols-1 gap-3">
                {purposes.map(({ id, title, desc, icon: Icon, color, activeColor }) => {
                  const isActive = selectedPurpose === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setValue('purpose', id)}
                      className={`bg-white rounded-2xl p-3.5 text-left border flex items-center gap-4 transition-all duration-300 ${
                        isActive ? activeColor : 'border-slate-100 hover:border-slate-200/60 hover:bg-slate-50/30'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border flex-shrink-0 flex items-center justify-center ${color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-mockup-textDark leading-none">{title}</h4>
                        <p className="text-[10px] text-mockup-textLight font-semibold mt-1">{desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-mockup-purple hover:bg-mockup-purpleHover text-white font-bold py-3.5 rounded-xl text-xs shadow-sm transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Complete Setup</span>
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Onboarding;
