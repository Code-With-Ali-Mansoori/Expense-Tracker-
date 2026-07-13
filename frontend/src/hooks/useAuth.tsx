import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { User, GoalPurpose } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePreferences: (monthlyIncome: number, purpose: GoalPurpose) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('expense_tracker_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/user/me');
        setUser(res.data);
      } catch (err) {
        console.error('Failed to load user with token:', err);
        localStorage.removeItem('expense_tracker_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('expense_tracker_token', res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('expense_tracker_token', res.data.token);
      setUser(res.data.user);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('expense_tracker_token');
    setUser(null);
  };

  const updatePreferences = async (monthlyIncome: number, purpose: GoalPurpose) => {
    try {
      const res = await api.patch('/user/preferences', { monthlyIncome, purpose });
      setUser(res.data);
    } catch (err: any) {
      throw new Error(err.response?.data?.error || 'Failed to update preferences.');
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updatePreferences,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
