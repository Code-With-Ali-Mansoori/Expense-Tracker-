import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowDownRight, ArrowUpRight, BarChart3, 
  Calendar, Info, LayoutGrid, ChevronDown, User, Loader2 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';
import { useExpenses } from '../hooks/useExpenses';
import { useAuth } from '../hooks/useAuth';
import { categoryMeta } from '../components/ExpenseCard';

const categoryColors = {
  food: '#0D9488',        // Teal
  travel: '#EAB308',      // Yellow
  shopping: '#F97316',    // Orange
  bills: '#6366F1',       // Indigo
  entertainment: '#EC4899', // Pink
  health: '#EF4444',      // Red
  other: '#64748B',       // Slate
};

const categoryLabels: Record<string, string> = {
  food: 'Food & dining',
  travel: 'Transport',
  shopping: 'Shopping',
  bills: 'Bills & Utilities',
  entertainment: 'Entertainment',
  health: 'Health & Care',
  other: 'Other',
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { analyticsQuery } = useExpenses();
  const [activeToggle, setActiveToggle] = useState<'income' | 'expenses'>('expenses');
  const [timeframe, setTimeframe] = useState<'monthly' | 'weekly'>('monthly');

  const isLoading = analyticsQuery.isPending;
  const analytics = analyticsQuery.data;

  // Months list for dropdown (last 6 months)
  const monthsList = React.useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push({
        label: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
        month: d.getMonth(),
        year: d.getFullYear(),
      });
    }
    return list;
  }, []);

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const selectedMonth = monthsList[selectedMonthIndex];

  // Calculate start/end of the selected month
  const dateRange = React.useMemo(() => {
    const start = new Date(selectedMonth.year, selectedMonth.month, 1);
    const end = new Date(selectedMonth.year, selectedMonth.month + 1, 0, 23, 59, 59, 999);
    
    const startStr = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-01`;
    const endStr = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`;
    
    return { startStr, endStr };
  }, [selectedMonth]);

  // Query expenses for the selected month
  const { expensesQuery } = useExpenses({
    startDate: dateRange.startStr,
    endDate: dateRange.endStr,
  });

  // Format 4 weeks chart data
  const chartData = React.useMemo(() => {
    const expensesList = expensesQuery.data || [];
    const weeklyTotals = [0, 0, 0, 0];
    
    expensesList.forEach((exp) => {
      const expDate = new Date(exp.date);
      const day = expDate.getDate();
      
      if (day >= 1 && day <= 7) {
        weeklyTotals[0] += exp.amount;
      } else if (day >= 8 && day <= 14) {
        weeklyTotals[1] += exp.amount;
      } else if (day >= 15 && day <= 21) {
        weeklyTotals[2] += exp.amount;
      } else if (day >= 22) {
        weeklyTotals[3] += exp.amount;
      }
    });
    
    return [
      { name: 'Week 1', Expenses: weeklyTotals[0] },
      { name: 'Week 2', Expenses: weeklyTotals[1] },
      { name: 'Week 3', Expenses: weeklyTotals[2] },
      { name: 'Week 4', Expenses: weeklyTotals[3] },
    ];
  }, [expensesQuery.data]);

  // Formatting values for summary cards (remains current month summary)
  const income = analytics?.totalIncome || user?.monthlyIncome || 0;
  const expenses = analytics?.totalExpenses || 0;
  const categoryBreakdown = analytics?.categoryBreakdown || [];

  const totalSpentAllTime = categoryBreakdown.reduce((sum, item) => sum + item.amount, 0);

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning!';
    if (hrs < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  // Custom tooltip for BarChart
  const CustomTooltipBar = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-[0_10px_25px_rgba(30,27,75,0.08)] text-xs font-semibold text-mockup-textDark">
          <p className="text-mockup-textLight mb-1">{payload[0].payload.name}</p>
          <p className="flex items-center gap-1.5 text-mockup-purple">
            <span className="w-2 h-2 rounded-full bg-mockup-purple" />
            <span>Expenses: ₹{payload[0].value.toLocaleString('en-IN')}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const pieData = categoryBreakdown
    .filter(item => item.amount > 0)
    .map(item => ({
      name: categoryLabels[item.category] || item.category,
      value: item.amount,
      color: categoryColors[item.category as keyof typeof categoryColors] || categoryColors.other,
    }));

  const hasExpenses = pieData.length > 0;
  const displayPieData = hasExpenses ? pieData : [
    { name: 'No Expenses', value: 1, color: '#374151' }
  ];

  return (
    <div className="w-full">
      {/* Top Header */}
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

        {/* Page Title */}
        <div className="text-center md:text-left flex-1 md:flex-initial mx-4 md:mx-0">
          <h1 className="text-lg md:text-2xl font-bold text-mockup-textDark tracking-tight font-heading">
            Dashboard
          </h1>
        </div>

        {/* Action placeholder or spacer */}
        <div className="w-10 h-10 md:hidden" />
      </div>

      {isLoading ? (
        // Loading skeleton
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="h-28 bg-white border border-slate-100 rounded-3xl"></div>
            <div className="h-28 bg-white border border-slate-100 rounded-3xl"></div>
            <div className="h-28 bg-white border border-slate-100 rounded-3xl"></div>
            <div className="h-28 bg-white border border-slate-100 rounded-3xl"></div>
          </div>
          <div className="h-80 bg-white border border-slate-100 rounded-3xl"></div>
          <div className="h-60 bg-white border border-slate-100 rounded-3xl"></div>
        </div>
      ) : (
        /* Main Layout Grid matching dashboardUI.jpeg and category.png */
        <div className="space-y-8">
          
          {/* Top Section: Summary Cards (Left) and Weekly Trend Chart (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left part: 2x2 Summary Cards grid */}
            <div className="lg:col-span-5 flex flex-col h-full">
              <div className="grid grid-cols-2 gap-4 flex-1">
                
                {/* Monthly Income Card */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100/80 shadow-[0_4px_25px_rgba(30,27,75,0.02)] flex flex-col justify-between hover:scale-[1.01] transition-transform">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-xl">
                      <ArrowDownRight size={15} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] text-mockup-textGray font-bold uppercase tracking-wider">Monthly Income</span>
                  </div>
                  <span className="text-xl font-bold text-mockup-textDark tracking-tight block mt-3 font-heading">
                    ₹{income.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Saved Card */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100/80 shadow-[0_4px_25px_rgba(30,27,75,0.02)] flex flex-col justify-between hover:scale-[1.01] transition-transform">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-mockup-bgPurple text-mockup-purple border border-violet-100 rounded-xl">
                      <ArrowDownRight size={15} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] text-mockup-textGray font-bold uppercase tracking-wider">Saved</span>
                  </div>
                  <span className="text-xl font-bold text-mockup-purple tracking-tight block mt-3 font-heading">
                    ₹{(income - expenses).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Expense Card */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100/80 shadow-[0_4px_25px_rgba(30,27,75,0.02)] flex flex-col justify-between hover:scale-[1.01] transition-transform">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-mockup-bgOrange text-mockup-orange border border-orange-100 rounded-xl">
                      <ArrowUpRight size={15} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] text-mockup-textGray font-bold uppercase tracking-wider">Expense</span>
                  </div>
                  <span className="text-xl font-bold text-mockup-orange tracking-tight block mt-3 font-heading">
                    ₹{expenses.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Avg spent % rate Card */}
                <div className="bg-white rounded-3xl p-5 border border-slate-100/80 shadow-[0_4px_25px_rgba(30,27,75,0.02)] flex flex-col justify-between hover:scale-[1.01] transition-transform">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 text-blue-500 border border-blue-100 rounded-xl">
                      <ArrowUpRight size={15} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] text-mockup-textGray font-bold uppercase tracking-wider">Avg spent % rate</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600 tracking-tight block mt-3 font-heading">
                    {income > 0 ? Math.round((expenses / income) * 100) : 0}%
                  </span>
                </div>

              </div>
            </div>

            {/* Right part: Weekly Trend Line Graph */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-[32px] p-6 border border-slate-100/80 shadow-[0_4px_25px_rgba(30,27,75,0.02)] h-full flex flex-col justify-between min-h-[250px]">
                
                {/* Weekly Trend Header */}
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold text-mockup-textDark font-heading">Weekly Statistics</h3>
                    <span className="text-[10px] text-mockup-textLight font-semibold uppercase tracking-wider block mt-0.5">
                      Weekly Expenses Trend (1 Month)
                    </span>
                  </div>
                  
                  {/* Dropdown for Month Selection */}
                  <div className="relative">
                    <select
                      value={selectedMonthIndex}
                      onChange={(e) => setSelectedMonthIndex(Number(e.target.value))}
                      className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl pl-3 pr-8 py-1.5 text-xs text-mockup-textDark font-semibold focus:outline-none focus:border-mockup-purple focus:ring-1 focus:ring-mockup-purple/10 cursor-pointer"
                    >
                      {monthsList.map((m, idx) => (
                        <option key={idx} value={idx}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-mockup-textLight">
                      <ChevronDown size={14} className="stroke-[2.5]" />
                    </div>
                  </div>
                </div>

                {/* Bar Chart Container */}
                <div className="h-44 sm:h-52 w-full flex-1 flex flex-col justify-center">
                  {expensesQuery.isPending ? (
                    <div className="h-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-mockup-purple" />
                    </div>
                  ) : chartData.every(w => w.Expenses === 0) ? (
                    <div className="h-full flex flex-col items-center justify-center text-mockup-textLight text-xs gap-1.5 font-medium">
                      <Info size={16} /> No weekly trend data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }} barSize={32}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#94A3B8" 
                          fontSize={9} 
                          fontWeight={600}
                          tickLine={false} 
                          axisLine={false} 
                        />
                        <YAxis 
                          stroke="#94A3B8" 
                          fontSize={9} 
                          fontWeight={600}
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => `₹${val}`}
                        />
                        <Tooltip content={<CustomTooltipBar />} />
                        <Bar 
                          dataKey="Expenses" 
                          fill="#7C3AED" 
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

              </div>
            </div>

          </div>

          {/* Bottom Section: Spending by Category Pie (Left) and Category Breakdown Listing (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Bottom Left: Spending by Category (Donut Chart) */}
            <div className="lg:col-span-6">
              <div className="bg-white text-mockup-textDark rounded-[32px] p-6 border border-slate-100/80 shadow-[0_4px_25px_rgba(30,27,75,0.02)] flex flex-col justify-between min-h-[300px]">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold text-mockup-textDark font-heading">Spending by category</h3>
                    <span className="text-[10px] text-mockup-textLight font-bold uppercase tracking-wider block mt-0.5">
                      {new Date().toLocaleString('default', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* Donut Chart and Legend Row */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 my-auto">
                  {/* Chart Container */}
                  <div className="w-full sm:w-1/2 h-44 flex items-center justify-center relative">
                    {/* Inner text overlay in the center of Donut Chart */}
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-[10px] uppercase font-bold text-mockup-textLight tracking-wider">Total spent</span>
                      <span className="text-base font-bold text-mockup-textDark">₹{totalSpentAllTime.toLocaleString('en-IN')}</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={displayPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {displayPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => hasExpenses ? `₹${value.toLocaleString('en-IN')}` : 'No data'}
                          contentStyle={{ 
                            borderRadius: '16px', 
                            background: '#FFFFFF', 
                            border: '1px solid rgba(30, 27, 75, 0.08)',
                            color: '#1E1B4B',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend list */}
                  <div className="w-full sm:w-1/2 space-y-2 max-h-[160px] overflow-y-auto pr-1">
                    {pieData.map((item, index) => {
                      const pct = totalSpentAllTime > 0 ? Math.round((item.value / totalSpentAllTime) * 100) : 0;
                      return (
                        <div key={index} className="flex justify-between items-center text-xs font-semibold text-mockup-textGray">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                            <span className="truncate max-w-[90px]">{item.name}</span>
                          </div>
                          <span style={{ color: item.color }} className="font-bold">{pct}%</span>
                        </div>
                      );
                    })}
                    {!hasExpenses && (
                      <p className="text-[11px] text-mockup-textLight text-center py-4">No categories spent yet</p>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Right: Category Breakdown Listing */}
            <div className="lg:col-span-6">
              <div className="bg-white text-mockup-textDark rounded-[32px] p-6 border border-slate-100/80 shadow-[0_4px_25px_rgba(30,27,75,0.02)] flex flex-col justify-between min-h-[300px]">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-base font-bold text-mockup-textDark font-heading">Category breakdown</h3>
                  <span className="text-[10px] font-bold text-mockup-textLight uppercase tracking-wider">All-time Breakdown</span>
                </div>

                <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 flex-1">
                  {categoryBreakdown.length === 0 || categoryBreakdown.every(item => item.amount === 0) ? (
                    <p className="text-xs text-mockup-textLight text-center py-8 font-medium">No expenses logged yet</p>
                  ) : (
                    categoryBreakdown
                      .filter((item) => item.amount > 0)
                      .map((item) => {
                        const meta = categoryMeta[item.category as keyof typeof categoryMeta] || categoryMeta.other;
                        const Icon = meta.icon;
                        const percentage = totalSpentAllTime > 0 ? Math.round((item.amount / totalSpentAllTime) * 100) : 0;
                        const color = categoryColors[item.category as keyof typeof categoryColors] || categoryColors.other;
                        
                        return (
                          <div key={item.category} className="flex flex-col gap-1.5 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-slate-50 flex items-center justify-center" style={{ color: color }}>
                                  <Icon className="w-4.5 h-4.5" />
                                </div>
                                <div>
                                  <span className="capitalize font-bold text-mockup-textDark block text-xs">
                                    {categoryLabels[item.category] || item.category}
                                  </span>
                                  <span className="text-[10px] text-mockup-textLight font-semibold">{item.count} transactions</span>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <span className="font-bold text-rose-500 block font-heading">
                                  -₹{item.amount.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] text-mockup-textLight font-semibold">
                                  {percentage}% of spend
                                </span>
                              </div>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-0.5">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ width: `${percentage}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>

              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
