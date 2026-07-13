import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, BarChart3, Bot, User, LogOut, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { to: '/ai-advisor', label: 'AI Advisor', icon: Bot },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    if (!confirmLogout) return;

    logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };



  return (
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-100 flex-col h-screen sticky top-0 flex-shrink-0 z-30">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-50 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-mockup-purple to-indigo-500 rounded-xl shadow-sm text-white">
          <Wallet size={20} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-mockup-textDark tracking-tight leading-none">FinTrace</h1>
          <span className="text-[10px] text-mockup-textLight uppercase tracking-wider font-semibold">Expense Tracker</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-mockup-bgPurple text-mockup-purple shadow-[0_4px_12px_rgba(124,58,237,0.06)]'
                  : 'text-mockup-textGray hover:text-mockup-textDark hover:bg-slate-50'
              }`
            }
          >
            <Icon size={18} className="stroke-[2]" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>



      {/* User Information Profile Footer */}
      {user && (
        <div className="p-4 border-t border-slate-50 bg-slate-50/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-mockup-bgPurple rounded-xl text-mockup-purple flex items-center justify-center font-bold text-sm uppercase">
              {user.name.slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-xs text-mockup-textDark truncate">{user.name}</h4>
              <p className="text-[10px] text-mockup-textGray truncate">{user.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut size={14} />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};
