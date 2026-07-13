import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ChatMessage } from '../types';

export const useChat = () => {
  const queryClient = useQueryClient();

  // Query to fetch the persistent chat thread for the current user
  const chatHistoryQuery = useQuery<ChatMessage[]>({
    queryKey: ['chatHistory'],
    queryFn: async () => {
      const res = await api.get('/ai/chat/history');
      return res.data;
    },
  });

  // Mutation to send a new chat message to the server
  const sendMessageMutation = useMutation<{ reply: string }, Error, string>({
    mutationFn: async (messageText) => {
      const res = await api.post('/ai/chat', { message: messageText });
      return res.data;
    },
    onSuccess: () => {
      // Invalidate the chat history to trigger an automatic refetch
      queryClient.invalidateQueries({ queryKey: ['chatHistory'] });
    },
  });

  return {
    chatHistoryQuery,
    sendMessage: sendMessageMutation.mutateAsync,
    isSending: sendMessageMutation.isPending,
  };
};
