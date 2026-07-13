import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BarChart3, Bot, User, Plus } from 'lucide-react';

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 py-2 px-4 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] md:hidden rounded-t-3xl">
      <div className="grid grid-cols-5 items-center justify-items-center">
        
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 w-full transition-all duration-300 ${
              isActive
                ? 'text-mockup-purple font-semibold active-nav-tab scale-105'
                : 'text-mockup-textLight hover:text-mockup-textDark'
            }`
          }
        >
          <Home size={20} className="stroke-[2.2]" />
          <span className="text-[9px] tracking-wide font-medium">Home</span>
        </NavLink>

        {/* Dashboard / Stats */}
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 w-full transition-all duration-300 ${
              isActive
                ? 'text-mockup-purple font-semibold active-nav-tab scale-105'
                : 'text-mockup-textLight hover:text-mockup-textDark'
            }`
          }
        >
          <BarChart3 size={20} className="stroke-[2.2]" />
          <span className="text-[9px] tracking-wide font-medium">Dashboard</span>
        </NavLink>

        {/* Rounded Purple Add Button aligned like other navigation items */}
        <div className="flex items-center justify-center w-full">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-expense-modal', { detail: { expense: null } }))}
            className="flex items-center justify-center bg-mockup-purple hover:bg-mockup-purpleHover text-white rounded-full w-10 h-10 shadow-sm transition-all duration-300 transform active:scale-90 hover:scale-105"
            aria-label="Add Expense"
          >
            <Plus size={20} className="stroke-[2.5]" />
          </button>
        </div>

        {/* AI Advisor */}
        <NavLink
          to="/ai-advisor"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 w-full transition-all duration-300 ${
              isActive
                ? 'text-mockup-purple font-semibold active-nav-tab scale-105'
                : 'text-mockup-textLight hover:text-mockup-textDark'
            }`
          }
        >
          <Bot size={20} className="stroke-[2.2]" />
          <span className="text-[9px] tracking-wide font-medium">AI Advisor</span>
        </NavLink>

        {/* Profile */}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 w-full transition-all duration-300 ${
              isActive
                ? 'text-mockup-purple font-semibold active-nav-tab scale-105'
                : 'text-mockup-textLight hover:text-mockup-textDark'
            }`
          }
        >
          <User size={20} className="stroke-[2.2]" />
          <span className="text-[9px] tracking-wide font-medium">Profile</span>
        </NavLink>

      </div>
    </nav>
  );
};
