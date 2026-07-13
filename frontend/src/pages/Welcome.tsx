import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Welcome: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-mockup-bg">
      <div className="w-full max-w-md bg-white rounded-[40px] px-8 py-12 shadow-[0_15px_40px_rgba(30,27,75,0.06)] border border-slate-100/50 flex flex-col items-center text-center">
        
        {/* Mockup Top Decorator */}
        <div className="w-32 h-1.5 bg-slate-100 rounded-full mb-8" />

        {/* 3D Wallet Illustration Card */}
        <div className="relative w-72 h-72 rounded-full bg-slate-50 flex items-center justify-center mb-10 overflow-visible">
          <div className="absolute inset-4 rounded-full bg-[#EDE9FE]/50 animate-pulse" />
          <img
            src="/wallet-3d.png"
            alt="3D Wallet illustration"
            className="w-56 h-56 object-contain z-10 drop-shadow-[0_15px_25px_rgba(124,58,237,0.15)] transform hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Text Content */}
        <h1 className="text-3xl font-bold text-mockup-textDark tracking-tight leading-tight px-2 font-heading">
          Save your money with Expense Tracker
        </h1>
        
        <p className="text-xs text-mockup-textGray mt-4 mb-10 leading-relaxed max-w-xs font-medium">
          Save money! The more your money works for you, the less you have to work for money.
        </p>

        {/* Start Button */}
        <button
          onClick={handleStart}
          className="w-full max-w-xs bg-mockup-purple hover:bg-mockup-purpleHover text-white font-bold py-4 rounded-[20px] shadow-sm transition-all duration-300 transform active:scale-98 text-sm"
        >
          Let's Start
        </button>

        {/* Bottom Decorator Bar */}
        <div className="w-20 h-1 bg-slate-200 rounded-full mt-10" />

      </div>
    </div>
  );
};

export default Welcome;
