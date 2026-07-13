import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User as UserIcon, Mail, Wallet, Shield, LogOut, Loader2, Save, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { GoalPurpose } from '../types';

const profileSchema = z.object({
  monthlyIncome: z.coerce.number().min(0, 'Income must be at least 0'),
  purpose: z.enum(['tracking', 'savings', 'habits', 'other']),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const Profile: React.FC = () => {
  const { user, updatePreferences, logout } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      monthlyIncome: user?.monthlyIncome || 0,
      purpose: user?.purpose || 'other',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      await updatePreferences(data.monthlyIncome, data.purpose);
      toast.success('Preferences updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update preferences.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (!confirmLogout) return;

    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const handleMenuClick = () => {
    toast('Quick Menu: Use the tabs below to navigate.', {
      icon: '⚙️',
      style: {
        background: '#FFFFFF',
        color: '#1E1B4B',
        border: '1px solid rgba(30, 27, 75, 0.08)',
      },
    });
  };

  return (
    <div className="w-full">
      
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        {/* Mobile menu trigger */}
        <button
          onClick={handleMenuClick}
          className="md:hidden p-2.5 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 text-mockup-textDark transition-all"
        >
          <LayoutGrid size={18} className="stroke-[2.2]" />
        </button>

        {/* Title */}
        <div className="text-center md:text-left flex-1 md:flex-initial mx-4 md:mx-0">
          <h1 className="text-lg md:text-2xl font-bold text-mockup-textDark tracking-tight font-heading">
            Profile Settings
          </h1>
        </div>

        {/* Action placeholder or spacer */}
        <div className="w-10 h-10 md:hidden" />
      </div>

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: User details summary */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* User Profile Card */}
          <div className="bg-white rounded-[32px] p-6 border border-slate-100/80 shadow-[0_4px_25px_rgba(30,27,75,0.02)] flex items-center lg:flex-col lg:text-center gap-4">
            <div className="w-16 h-16 bg-mockup-bgPurple rounded-3xl text-mockup-purple flex items-center justify-center font-bold text-2xl border border-[#DDD6FE]/35 shadow-sm uppercase lg:mb-2">
              {user?.name.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base text-mockup-textDark truncate font-heading">{user?.name}</h3>
              <p className="text-xs text-mockup-textLight flex items-center lg:justify-center gap-1.5 mt-1 font-semibold truncate">
                <Mail size={12} />
                {user?.email}
              </p>
            </div>
          </div>

          {/* Quick Account statistics or details */}
          <div className="hidden lg:block bg-white rounded-[32px] p-6 border border-slate-100/80 shadow-[0_4px_25px_rgba(30,27,75,0.02)] space-y-4 text-xs font-semibold text-mockup-textGray">
            <h4 className="font-bold text-mockup-textDark uppercase tracking-wider text-[11px]">System Status</h4>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-mockup-textLight">Security Check</span>
              <span className="text-emerald-500">Active</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-mockup-textLight">AI Advisor</span>
              <span className="text-mockup-purple">Connected</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-mockup-textLight">Currency format</span>
              <span className="text-mockup-textDark">INR (₹)</span>
            </div>
          </div>

        </div>

        {/* Right Column: Preferences update form */}
        <div className="lg:col-span-8">
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Form preferences card */}
            <div className="bg-white rounded-[32px] p-6 border border-slate-100/80 shadow-[0_4px_25px_rgba(30,27,75,0.02)] space-y-5">
              
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-mockup-purple flex items-center gap-2 mb-2">
                <Shield size={14} className="stroke-[2.5]" /> 
                <span>Account Preferences</span>
              </h4>

              {/* Income field */}
              <div>
                <label className="block text-[11px] font-bold text-mockup-textDark mb-1.5 uppercase tracking-wider">
                  Monthly Income (₹)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  {...register('monthlyIncome')}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-mockup-textDark focus:bg-white focus:outline-none focus:border-mockup-purple focus:ring-2 focus:ring-mockup-purple/10 transition-all font-semibold"
                />
                {errors.monthlyIncome && (
                  <span className="text-xs text-rose-500 mt-1 block font-medium">{errors.monthlyIncome.message}</span>
                )}
              </div>

              {/* Goal Purpose field */}
              <div>
                <label className="block text-[11px] font-bold text-mockup-textDark mb-1.5 uppercase tracking-wider">
                  Financial Goal
                </label>
                <select
                  {...register('purpose')}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs text-mockup-textDark focus:bg-white focus:outline-none focus:border-mockup-purple focus:ring-2 focus:ring-mockup-purple/10 transition-all capitalize font-semibold cursor-pointer"
                >
                  <option value="tracking">Expense Tracking</option>
                  <option value="savings">Goal Savings</option>
                  <option value="habits">Habits Analysis</option>
                  <option value="other">Other / Mixed</option>
                </select>
                {errors.purpose && (
                  <span className="text-xs text-rose-500 mt-1 block font-medium">{errors.purpose.message}</span>
                )}
              </div>

            </div>

            {/* Action buttons wrapper */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-mockup-purple hover:bg-mockup-purpleHover text-white text-xs font-bold py-3.5 rounded-2xl shadow-sm transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save size={14} className="stroke-[2.5]" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-white hover:bg-rose-50/50 border border-rose-300 hover:border-rose-400 text-rose-600 text-xs font-bold py-3.5 rounded-2xl transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2"
              >
                <LogOut size={14} className="stroke-[2.5]" />
                <span>Log Out</span>
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
};
export default Profile;
