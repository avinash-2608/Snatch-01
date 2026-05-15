import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, User, Loader2 } from 'lucide-react';
import { fetchApi } from '../../api/api';

const predefinedSuggestions = [
  "Find offers under ₹200",
  "Best food deals near me",
  "Explain how the token system works"
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your Snatch AI Assistant. How can I help you discover amazing local deals today?", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    // Add user message to chat UI natively
    const userMessage = { id: Date.now(), text, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call Backend API
      const response = await fetchApi('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text })
      });

      // Render Gemini response dynamically
      const aiMessage = { id: Date.now() + 1, text: response.reply, isUser: false };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Fallback network bounds 
      const errorMsg = { id: Date.now() + 1, text: "I'm having trouble connecting right now. Please check your connection and try again.", isUser: false };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      
      {/* Floating Chatbot Button (If Closed) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="pulse-glow bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-4 rounded-2xl shadow-2xl shadow-indigo-500/40 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 animate-entry flex items-center justify-center group"
          title="Chat with Snatch AI"
        >
          <div className="relative">
            <Sparkles className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
        </button>
      )}

      {/* Modern Pop-up Chat Window with Glassmorphism */}
      {isOpen && (
        <div className="glass-card w-80 sm:w-96 rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 relative isolate" style={{ height: '500px', maxHeight: 'calc(100vh - 100px)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 p-4 flex justify-between items-center text-white z-10 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shadow-inner border border-white/20">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg tracking-wide">Snatch AI</h3>
                <p className="text-xs text-white/70">Always here to help</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Interface Scroll View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gradient-to-b from-gray-50/30 to-white/30 dark:from-slate-900/30 dark:to-slate-800/30">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  flex gap-2 max-w-[85%]
                  ${msg.isUser ? 'flex-row-reverse' : 'flex-row'}
                `}>
                  <div className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-full shadow-lg
                    ${msg.isUser ? 'bg-indigo-100 text-indigo-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'}
                  `}>
                    {msg.isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={`p-3.5 text-sm flex max-w-full shadow-lg backdrop-blur-sm
                    ${msg.isUser 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm border border-white/20' 
                      : 'bg-white/90 dark:bg-slate-800/90 text-gray-800 dark:text-slate-200 rounded-2xl rounded-tl-sm border border-white/30 dark:border-slate-600/50'}
                  `}>
                    <p className="leading-relaxed whitespace-pre-wrap word-break break-words">
                      {msg.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%] flex-row">
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full shadow-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="p-3 text-sm bg-white/90 dark:bg-slate-800/90 text-gray-800 dark:text-slate-200 rounded-2xl rounded-tl-sm border border-white/30 dark:border-slate-600/50 shadow-lg flex items-center gap-2 backdrop-blur-sm">
                    <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                    <span className="text-gray-500 dark:text-slate-400 animate-pulse">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Form Engine Interface */}
          <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-white/20 dark:border-slate-600/20">
            
            {/* Quick Suggestions */}
            {messages.length <= 2 && !isLoading && (
              <div className="flex flex-wrap gap-2 mb-3">
                {predefinedSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(suggestion)}
                    className="text-xs py-1.5 px-3 bg-indigo-50/80 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 rounded-full transition-all whitespace-nowrap hover:scale-105"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input Handler */}
            <form onSubmit={onSubmit} className="relative flex items-center">
              <input 
                type="text"
                className="w-full pl-4 pr-12 py-3.5 bg-gray-50/80 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-700 transition-all text-sm backdrop-blur-sm"
                placeholder="Ask Snatch AI..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-1.5 p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white disabled:opacity-50 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/30 flex items-center hover:scale-105 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
