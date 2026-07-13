import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, ArrowUpRight, ArrowDownRight, Wallet, 
  History, AlertCircle, LayoutGrid, Search, X 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useExpenses } from '../hooks/useExpenses';
import { ExpenseCard } from '../components/ExpenseCard';
import { useAuth } from '../hooks/useAuth';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const { expensesQuery, analyticsQuery, deleteExpense } = useExpenses();
  const [searchTerm, setSearchTerm] = useState('');

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning!';
    if (hrs < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  const handleNotificationClick = () => {
    toast('No new notifications.', {
      icon: '🔔',
      style: {
        background: '#FFFFFF',
        color: '#1E1B4B',
        border: '1px solid rgba(30, 27, 75, 0.08)',
      },
    });
  };

  const handleMenuClick = () => {
    toast('Quick Menu: Use the tabs below to navigate.', {
      icon: '📱',
      style: {
        background: '#FFFFFF',
        color: '#1E1B4B',
        border: '1px solid rgba(30, 27, 75, 0.08)',
      },
    });
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this transaction?');
    if (!confirmDelete) return;

    try {
      await deleteExpense(id);
      toast.success('Transaction deleted successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete transaction.');
    }
  };

  const isLoading = expensesQuery.isPending || analyticsQuery.isPending;

  const rawExpenses = expensesQuery.data || [];
  const analytics = analyticsQuery.data;

  // Filter based on search term
  const filteredExpenses = rawExpenses.filter((exp) => 
    exp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Computed values
  const totalIncome = analytics?.totalIncome || user?.monthlyIncome || 0;
  const totalExpenses = analytics?.totalExpenses || 0;
  const netBalance = totalIncome - totalExpenses;

  // Recent 6 expenses for desktop display, or full list for filtering
  const displayExpenses = searchTerm ? filteredExpenses : filteredExpenses.slice(0, 6);

  return (
    <div className="w-full">
      {/* Header (Responsive Layout Grid) */}
      <div className="flex justify-between items-center mb-6">
        {/* Mobile Greeting (Left side for mobile UI instead of profile logo) */}
        <Link
          to="/profile"
          className="md:hidden text-left flex flex-col justify-center select-none"
        >
          <span className="text-[9px] text-mockup-textLight font-semibold tracking-wider uppercase leading-none">
            {getGreeting()}
          </span>
          <span className="text-xs font-bold text-mockup-textDark mt-0.5 leading-none block">
            {user?.name}
          </span>
        </Link>

        {/* Desktop Welcome Title */}
        <div className="hidden md:block">
          <span className="text-xs text-mockup-textLight font-bold uppercase tracking-wider">Welcome back,</span>
          <h2 className="text-2xl font-bold text-mockup-textDark mt-0.5 font-heading">{user?.name}</h2>
        </div>

        {/* Mobile Page Title in center */}
        <h1 className="md:hidden text-base font-bold text-mockup-textDark tracking-tight font-heading flex-1 text-center mx-2">
          Home
        </h1>

      </div>

      {/* Main Grid: Responsive 2 Columns for Desktop, 1 Column for Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Balance Gradient Card and Summary Analytics */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Balance Gradient Card */}
          <div className="relative overflow-hidden bg-gradient-to-tr from-[#556DF6] via-[#A851EC] to-[#F1697E] rounded-[32px] p-6 shadow-[0_12px_30px_rgba(30,27,75,0.04)] border border-white/10 hover:scale-[1.01] transition-transform duration-300">

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 text-[11px] font-bold text-white/80 uppercase tracking-widest">
                <span>Total Balance</span>
                <span className="text-[10px]">▼</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white mt-2 mb-8 tracking-tight font-heading">
              ₹{netBalance.toLocaleString('en-IN')}
            </h1>

            {/* Income / Expense details inside Balance Card */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
              
              {/* Income columns */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/15 rounded-2xl text-white flex items-center justify-center">
                  <ArrowDownRight size={18} className="stroke-[2.8]" />
                </div>
                <div>
                  <span className="text-xs text-white/80 block uppercase tracking-widest font-bold">Income</span>
                  <span className="text-base font-bold text-white font-heading">
                    ₹{totalIncome.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Expenses columns */}
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/15 rounded-2xl text-white flex items-center justify-center">
                  <ArrowUpRight size={18} className="stroke-[2.8]" />
                </div>
                <div>
                  <span className="text-xs text-white/80 block uppercase tracking-widest font-bold">Expenses</span>
                  <span className="text-base font-bold text-white font-heading">
                    ₹{totalExpenses.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Stats Summary Card for Desktop */}
          <div className="hidden lg:block bg-white rounded-3xl p-5 border border-slate-100/80 shadow-[0_4px_25px_rgba(30,27,75,0.02)]">
            <h3 className="text-xs uppercase tracking-widest font-bold text-mockup-textDark mb-4">Financial Health</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-mockup-textGray mb-1">
                  <span>Expenses Limit Ratio</span>
                  <span className="text-mockup-purple">{totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-mockup-purple h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0, 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-[11px] text-mockup-textLight leading-relaxed mt-2 font-medium">
                {totalExpenses > totalIncome 
                  ? "Warning: Your expenditures exceed your income limits. Try querying the AI Advisor for optimization strategies."
                  : "Good status! Keep tracking transactions to preserve savings ratios."}
              </p>
            </div>
          </div>

          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-expense-modal', { detail: { expense: null } }))}
            className="hidden lg:flex w-full items-center justify-center gap-2 bg-mockup-purple hover:bg-mockup-purpleHover text-white font-semibold py-3 rounded-xl text-sm transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>Add new Expense</span>
          </button>

        </div>

        {/* Right Column: Recent Transactions & Search Bar */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Header section with see-all */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-mockup-textDark font-bold">
              <History size={16} className="text-mockup-purple" />
              <h3 className="text-sm uppercase tracking-wider font-heading">Recent Transactions</h3>
            </div>
            <Link
              to="/dashboard"
              className="text-xs text-mockup-purple hover:text-mockup-purpleHover font-bold transition-colors"
            >
              See All
            </Link>
          </div>

          {/* Desktop & Mobile Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mockup-textLight" size={15} />
            <input
              type="text"
              placeholder="Search merchant or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl pl-10 pr-8 py-2.5 text-xs text-mockup-textDark focus:outline-none focus:border-mockup-purple focus:ring-2 focus:ring-mockup-purple/5 transition-all shadow-[0_4px_20px_rgba(30,27,75,0.01)] placeholder-slate-400 font-semibold"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mockup-textLight hover:text-mockup-textDark"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Loading, Empty and Cards display workspace */}
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-16 w-full bg-white border border-slate-100 rounded-2xl animate-pulse flex items-center justify-between px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                    <div className="space-y-2">
                      <div className="h-3.5 w-24 bg-slate-100 rounded"></div>
                      <div className="h-2.5 w-16 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                  <div className="h-4 w-12 bg-slate-100 rounded"></div>
                </div>
              ))}
            </div>
          ) : displayExpenses.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-slate-100 mt-2 shadow-[0_4px_20px_rgba(30,27,75,0.01)]">
              <div className="p-3 bg-mockup-bgPurple text-mockup-purple rounded-2xl mb-3">
                <Wallet className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h4 className="font-bold text-mockup-textDark text-sm">No transactions found</h4>
              <p className="text-xs text-mockup-textLight max-w-xs mt-1 leading-relaxed font-semibold">
                {searchTerm 
                  ? "Try resetting your search query or verify categories."
                  : "Click the '+' button to log your first expenditure."}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {displayExpenses.map((expense) => (
                <ExpenseCard
                  key={expense._id}
                  expense={expense}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
