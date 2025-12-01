import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { generateAIResponse } from '../services/geminiService';
import { Send, Bot, User, Sparkles, Loader2, Quote, FilePenLine, Zap, X } from 'lucide-react';

interface Props {
  context?: string;
  lang: 'fa' | 'en';
  onClose?: () => void;
}

const AIAssistant: React.FC<Props> = ({ context, lang, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: lang === 'fa' ? 'سلام! من دستیار هوشمند تحقیقاتی شما هستم. چطور می‌توانم کمک کنم؟' : 'Hello! I am your AI research assistant. Ask me anything about your project.',
      timestamp: Date.now()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async (text: string = input, mode: 'chat' | 'improve' | 'summarize' = 'chat') => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const responseText = await generateAIResponse(userMsg.text, context || "General Academic Context", mode);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                <Sparkles size={16} fill="currentColor" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">{lang === 'fa' ? 'دستیار هوشمند' : 'AI Companion'}</h3>
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Gemini 2.5 Active</span>
                </div>
            </div>
        </div>
        {onClose && (
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition">
                <X size={18} />
            </button>
        )}
      </div>

      {/* Quick Actions */}
      {context && messages.length < 4 && (
        <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 flex gap-2 overflow-x-auto hide-scrollbar shrink-0">
            <button 
                onClick={() => handleSend("Summarize this project briefly.", 'summarize')}
                className="text-[10px] font-bold flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap shadow-sm hover:shadow-md"
            >
                <Quote size={10} /> Summarize
            </button>
            <button 
                onClick={() => handleSend("Suggest improvements for the description.", 'improve')}
                className="text-[10px] font-bold flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap shadow-sm hover:shadow-md"
            >
                <FilePenLine size={10} /> Improve
            </button>
            <button 
                onClick={() => handleSend("What are key related works I should check?", 'chat')}
                className="text-[10px] font-bold flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap shadow-sm hover:shadow-md"
            >
                <Zap size={10} /> Suggestions
            </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-[#0b101a] custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300`}>
            {msg.role === 'model' && (
                 <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-100 dark:border-slate-700 mt-1">
                    <Bot size={14} />
                 </div>
            )}
            
            <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-6 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-sm' 
                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-sm'
            }`}>
              {msg.text.split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0 min-h-[1rem]">{line}</p>)}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3 animate-pulse">
             <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 text-indigo-600 flex items-center justify-center border border-slate-100 dark:border-slate-700"><Bot size={14} /></div>
             <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                <div className="flex gap-1">
                    <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
        <div className="flex gap-2 items-end bg-slate-100 dark:bg-slate-900 rounded-2xl p-1.5 border border-transparent focus-within:border-indigo-500/50 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-inner focus-within:shadow-md focus-within:shadow-indigo-500/10">
            <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder={lang === 'fa' ? 'سوال خود را بپرسید...' : 'Ask AI...'}
                className="flex-1 bg-transparent border-none px-3 py-2 focus:ring-0 outline-none dark:text-white text-xs placeholder-slate-400 resize-none max-h-24 min-h-[36px] custom-scrollbar"
                rows={1}
            />
            <button 
            onClick={() => handleSend()}
            disabled={loading || !input}
            className="w-8 h-8 mb-0.5 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition shadow-sm hover:scale-105 active:scale-95"
            >
            <Send size={14} className={lang === 'fa' ? 'rotate-180 mr-0.5' : 'ml-0.5'} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;