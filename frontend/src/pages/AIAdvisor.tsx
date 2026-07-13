import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Loader2, Sparkles, LayoutGrid, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { useChat } from '../hooks/useChat';
import { useAuth } from '../hooks/useAuth';

export const AIAdvisor: React.FC = () => {
  const { user } = useAuth();
  const { chatHistoryQuery, sendMessage, isSending } = useChat();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const messages = chatHistoryQuery.data || [];
  const isLoadingHistory = chatHistoryQuery.isPending;

  // Auto scroll to bottom when messages list changes
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setInputText('');
    try {
      await sendMessage(textToSend);
    } catch (err: any) {
      toast.error(err.message || 'Failed to get response from AI.');
    }
  };

  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputText);
  };

  const suggestions = [
    'Where am I overspending this month?',
    'Am I saving enough based on my budget?',
    'Give me a tip to hit my savings goal.',
    'Compare my bills category spending.',
  ];

  const handleMenuClick = () => {
    toast('Quick Menu: Use the tabs below to navigate.', {
      icon: '🤖',
      style: {
        background: '#FFFFFF',
        color: '#1E1B4B',
        border: '1px solid rgba(30, 27, 75, 0.08)',
      },
    });
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-7rem)] md:h-[calc(100vh-5.5rem)]">
      
      {/* Chat Conversation Workspace */}
      <div className="flex-1 flex flex-col min-h-0 w-full">
        
        {/* Left Side: Desktop suggestions sidebar */}
        {/* Suggestions and Chat Conversation Workspace */}
        <div className="flex-1 flex flex-col bg-white border border-slate-100/80 p-4 min-h-0">
          
          {/* Chat Header inside the chat UI box */}
          <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-100 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-mockup-bgPurple text-mockup-purple flex items-center justify-center font-bold border border-[#DDD6FE]/30 shadow-sm flex-shrink-0">
              <Bot size={18} className="stroke-[2.2]" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-mockup-textDark leading-none">AI Advisor</h4>
              <span className="text-[9px] text-mockup-textLight font-semibold mt-1 block">Powered by Gemini</span>
            </div>
          </div>
          
          {/* Chat Bubble container */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-1 min-h-0 bg-slate-50/50 rounded-2xl border border-slate-50 p-4">
            {isLoadingHistory ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-mockup-purple" />
              </div>
            ) : messages.length === 0 ? (
              
              /* Suggestions placeholder (shown when chat is empty) */
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="p-4 bg-mockup-bgPurple text-mockup-purple rounded-full mb-4 shadow-sm">
                  <Sparkles className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-bold text-mockup-textDark text-sm font-heading">
                  Ask your personal AI Coach
                </h3>
                <p className="text-xs text-mockup-textGray max-w-xs mt-1 leading-relaxed font-semibold">
                  Ask details on your budget limits, transaction behaviors, or tips.
                </p>

                {/* Suggestions Grid (visible on both mobile and web if empty) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-6 w-full max-w-lg">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="bg-white border border-slate-100 hover:border-mockup-purple/30 text-left text-xs text-mockup-textDark font-bold py-3 px-3.5 rounded-xl shadow-[0_4px_15px_rgba(0,0,0,0.01)] transition-all active:scale-98"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Message list */
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={msg._id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {/* Assistant Avatar */}
                      {!isUser && (
                        <div className="w-8 h-8 rounded-xl bg-mockup-bgPurple text-mockup-purple flex items-center justify-center flex-shrink-0 font-bold border border-[#DDD6FE]/30 shadow-sm">
                          <Bot size={15} />
                        </div>
                      )}

                      {/* Bubble content */}
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed font-semibold shadow-[0_2px_8px_rgba(30,27,75,0.01)] ${
                          isUser
                            ? 'bg-mockup-purple text-white rounded-tr-none'
                            : 'bg-white text-mockup-textDark border border-slate-100 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>

                      {/* User Avatar */}
                      {isUser && (
                        <div className="w-8 h-8 rounded-xl bg-[#EDE9FE] text-mockup-purple flex items-center justify-center flex-shrink-0 font-bold border border-[#DDD6FE]/30 shadow-sm uppercase text-[10px]">
                          {user?.name.slice(0, 2)}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading advisor animation */}
                {isSending && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-xl bg-mockup-bgPurple text-mockup-purple flex items-center justify-center flex-shrink-0 border border-[#DDD6FE]/30">
                      <Bot size={15} />
                    </div>
                    <div className="bg-white border border-slate-100 text-mockup-textLight text-xs rounded-2xl px-4 py-3 rounded-tl-none flex items-center gap-2.5 font-semibold">
                      <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-mockup-purple animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-mockup-purple animate-bounce delay-200"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-mockup-purple animate-bounce delay-300"></span>
                      </div>
                      <span>Analyzing transaction limits...</span>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Form chat input wrapper */}
          <form onSubmit={onSubmitForm} className="flex gap-2 items-center flex-shrink-0 bg-white">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask a question about your budget..."
              disabled={isSending}
              className="flex-1 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-xs text-mockup-textDark focus:bg-white focus:outline-none focus:border-mockup-purple focus:ring-2 focus:ring-mockup-purple/5 transition-all placeholder-slate-400 font-semibold"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isSending}
              className="p-3.5 bg-mockup-purple hover:bg-mockup-purpleHover text-white rounded-2xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex-shrink-0 flex items-center justify-center"
            >
              <Send size={15} />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
};
export default AIAdvisor;
