import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Welcome: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (isAuthenticated) {
      navigate('/');
      return;
    }

    setIsLoading(true);
    try {
      await demoLogin();
      navigate('/');
    } catch (error) {
      console.error('Demo login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mockup-bg p-4">
      <div className="w-full max-w-md rounded-[36px] border border-slate-100/70 bg-white p-8 text-center shadow-[0_16px_45px_rgba(30,27,75,0.06)]">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-mockup-purple to-indigo-500 text-white">
          <Wallet className="h-7 w-7" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-mockup-textDark">Expense Tracker Demo</h1>

        <button
          onClick={handleStart}
          disabled={isLoading}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-mockup-purple px-4 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-mockup-purpleHover disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          <span>{isLoading ? 'Starting as Demo User...' : 'Start as Demo User'}</span>
        </button>
      </div>
    </div>
  );
};

export default Welcome;
