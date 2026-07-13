import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

import { queryClient } from './lib/queryClient';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Onboarding } from './pages/Onboarding';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { AIAdvisor } from './pages/AIAdvisor';
import { Profile } from './pages/Profile';
import { Welcome } from './pages/Welcome';

// Layout components
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { ExpenseForm } from './components/ExpenseForm';

// Protected route validator
const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-mockup-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-mockup-purple" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }

  return <Outlet />;
};

// Global Layout (Sidebar on Desktop, Bottom Nav on Mobile, shared Modal)
const DashboardLayout: React.FC = () => {
  const { user } = useAuth();

  // If user has not completed onboarding, force onboarding page
  if (user && user.monthlyIncome === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-mockup-bg text-mockup-textDark flex flex-col md:flex-row w-full">
      {/* Sticky navigation sidebar on desktop screens */}
      <Sidebar />
      
      {/* Main Page Workspace */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav Menu (mobile-only, hidden on desktop) */}
      <BottomNav />
      
      {/* Add/Edit Expense modal dialog */}
      <ExpenseForm />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Welcome Screen */}
            <Route path="/welcome" element={<Welcome />} />
            
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Onboarding Route (Forces onboarding if income is not set) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Authenticated Dashboard Core */}
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ai-advisor" element={<AIAdvisor />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#1E1B4B',
              border: '1px solid rgba(30, 27, 75, 0.08)',
              fontSize: '13px',
              borderRadius: '16px',
              fontWeight: 600,
              boxShadow: '0 10px 30px rgba(30, 27, 75, 0.06)',
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
