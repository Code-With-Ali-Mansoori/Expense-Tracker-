import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wallet, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setServerError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-mockup-bg relative overflow-hidden">
      {/* Decorative subtle gradient glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#EDE9FE] rounded-full blur-[120px] pointer-events-none opacity-60"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFEFEA] rounded-full blur-[120px] pointer-events-none opacity-60"></div>

      <div className="w-full max-w-sm z-10 flex flex-col items-center">
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 bg-gradient-to-tr from-mockup-purple to-indigo-500 rounded-3xl text-white mb-3">
            <Wallet className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-3xl font-bold text-mockup-textDark tracking-tight font-heading">Expense Tracker</h2>
          <p className="text-[10px] text-mockup-textLight mt-1 uppercase tracking-widest font-semibold">MERN Expense Tracker</p>
        </div>

        {/* Credentials Form Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-[0_12px_40px_rgba(30,27,75,0.04)] border border-slate-100/60 w-full">
          <h3 className="text-base font-bold text-mockup-textDark mb-6 text-center font-heading">
            Log In to Your Account
          </h3>

          {serverError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-500 text-xs px-3.5 py-3 rounded-xl mb-5 text-center font-semibold">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[10px] font-bold text-mockup-textDark mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register('email')}
                className="w-full bg-slate-50 border border-slate-200/85 rounded-xl px-4 py-2.5 text-xs text-mockup-textDark focus:bg-white focus:outline-none focus:border-mockup-purple focus:ring-2 focus:ring-mockup-purple/10 transition-all placeholder-slate-400 font-semibold"
              />
              {errors.email && (
                <span className="text-xs text-rose-500 mt-1.5 block font-semibold">{errors.email.message}</span>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[10px] font-bold text-mockup-textDark mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="w-full bg-slate-50 border border-slate-200/85 rounded-xl px-4 py-2.5 text-xs text-mockup-textDark focus:bg-white focus:outline-none focus:border-mockup-purple focus:ring-2 focus:ring-mockup-purple/10 transition-all placeholder-slate-400 font-semibold"
              />
              {errors.password && (
                <span className="text-xs text-rose-500 mt-1.5 block font-semibold">{errors.password.message}</span>
              )}
            </div>

            {/* Submit Trigger */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-mockup-purple hover:bg-mockup-purpleHover text-white font-bold py-3 rounded-xl text-xs shadow-sm transition-all duration-300 transform active:scale-98 flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={14} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Redirect */}
        <p className="text-center text-xs text-mockup-textGray mt-6 font-semibold">
          Don't have an account?{' '}
          <Link to="/register" className="text-mockup-purple hover:text-mockup-purpleHover font-bold transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Login;
