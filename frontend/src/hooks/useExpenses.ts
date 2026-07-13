import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Expense, AnalyticsSummary, ExpenseCategory, PaymentMode } from '../types';

interface ExpenseFilters {
  category?: ExpenseCategory | '';
  paymentMode?: PaymentMode | '';
  startDate?: string;
  endDate?: string;
}

export const useExpenses = (filters: ExpenseFilters = {}) => {
  const queryClient = useQueryClient();

  // Query to fetch expenses list with optional filters
  const expensesQuery = useQuery<Expense[]>({
    queryKey: ['expenses', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.paymentMode) params.append('paymentMode', filters.paymentMode);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await api.get(`/expenses?${params.toString()}`);
      return res.data;
    },
  });

  // Query to fetch analytics summary
  const analyticsQuery = useQuery<AnalyticsSummary>({
    queryKey: ['analyticsSummary'],
    queryFn: async () => {
      const res = await api.get('/analytics/summary');
      return res.data;
    },
  });

  // Mutation to add expense
  const createExpenseMutation = useMutation<Expense, Error, Omit<Expense, '_id' | 'userId' | 'createdAt'>>({
    mutationFn: async (newExpense) => {
      const res = await api.post('/expenses', newExpense);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate both expenses list and analytics summary caches
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
    },
  });

  // Mutation to update expense
  const updateExpenseMutation = useMutation<Expense, Error, { id: string; data: Partial<Expense> }>({
    mutationFn: async ({ id, data }) => {
      const res = await api.patch(`/expenses/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
    },
  });

  // Mutation to delete expense
  const deleteExpenseMutation = useMutation<{ message: string; id: string }, Error, string>({
    mutationFn: async (id) => {
      const res = await api.delete(`/expenses/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['analyticsSummary'] });
    },
  });

  return {
    expensesQuery,
    analyticsQuery,
    createExpense: createExpenseMutation.mutateAsync,
    isCreating: createExpenseMutation.isPending,
    updateExpense: updateExpenseMutation.mutateAsync,
    isUpdating: updateExpenseMutation.isPending,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    isDeleting: deleteExpenseMutation.isPending,
  };
};
