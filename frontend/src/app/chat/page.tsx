'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LogOut, Bot, User as UserIcon, Loader2, Info, HelpCircle, Search as SearchIcon, MessageSquare, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import faqsData from '@/lib/faqs.json';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Source {
  chunk: string;
  score: number;
  faiss_dist: number;
  bm25_score: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
  sources?: Source[];
  fallback?: boolean;
}

export default function ChatPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your Support Copilot. Ask me anything about our software."
    }
  ]);
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-300">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const messageText = customInput || input;
    if (!messageText.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post('/api/query/', { query: messageText });
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.answer,
        confidence: response.data.confidence,
        sources: response.data.sources,
        fallback: response.data.fallback
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I had trouble connecting to the server. (Target: ${api.defaults.baseURL}) Details: ${error.response?.data?.detail || error.message || "Network issue"}`,
        fallback: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const filteredFaqs = faqsData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col font-sans selection:bg-cyan-500/30 transition-colors duration-300 relative overflow-hidden">
      {/* Back glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-400/5 dark:bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="flex-none h-16 border-b border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/50 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-cyan-600 dark:bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Bot size={20} className="text-white" />
            </div>
            <h1 className="font-semibold tracking-wide text-lg text-slate-900 dark:text-cyan-100 flex items-center gap-2">
              SaaS Copilot
              <span className="text-[10px] bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-500/30">RAG</span>
            </h1>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 text-sm">
            <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
            <span className="text-slate-800 dark:text-slate-300 font-medium">{user?.username}</span>
          </div>
          <ThemeToggle />
          <button 
            onClick={logout}
            className="p-2 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-hidden flex flex-col lg:flex-row w-full bg-white dark:bg-black">
        {/* Chat Area */}
        <section className="flex-grow flex flex-col relative min-w-0 h-[calc(100vh-4rem)] bg-slate-50 dark:bg-black/40">
          
          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6">
            <div className="max-w-5xl w-full mx-auto space-y-6 pb-4">
              <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={clsx("flex gap-3 max-w-2xl", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}
                >
                  <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm", 
                    msg.role === 'user' ? "bg-slate-200 border-slate-300 dark:bg-slate-800 border dark:border-slate-700" : "bg-cyan-600 dark:bg-cyan-500 shadow-cyan-500/20"
                  )}>
                    {msg.role === 'user' ? <UserIcon size={16} className="text-slate-600 dark:text-slate-300"/> : <Bot size={18} className="text-white"/>}
                  </div>
                  
                  <div className={clsx("flex flex-col gap-1.5", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className={clsx(
                      "px-4 py-3 rounded-2xl text-[14px] leading-relaxed break-words max-w-full",
                      msg.role === 'user' 
                        ? "bg-cyan-600 text-white rounded-tr-sm shadow-md shadow-cyan-500/10" 
                        : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-tl-sm backdrop-blur-md shadow-sm"
                    )}>
                      {msg.content}
                    </div>
                    
                    {msg.role === 'assistant' && msg.id !== 'welcome' && (
                      <div className="flex items-center justify-between w-full px-1 mt-1">
                         {msg.fallback ? (
                           <span className="text-xs text-amber-500 flex items-center gap-1 font-medium">
                             <Info size={12}/> Low confidence fallback
                           </span>
                         ) : (
                           <span className={clsx("text-xs flex items-center gap-1 font-medium", 
                              ((msg.confidence || 0) / 0.03278) > 0.8 ? "text-cyan-600 dark:text-cyan-400" : "text-amber-500"
                           )}>
                             <Sparkles size={12} className="animate-pulse" />
                             Accuracy: {msg.confidence ? (Math.min((msg.confidence / 0.03278) * 100, 100)).toFixed(1) : 0}%
                           </span>
                         )}
                         <div className="flex items-center gap-1 text-slate-400">
                           <button className="hover:text-cyan-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"><ThumbsUp size={12}/></button>
                           <button className="hover:text-cyan-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"><ThumbsDown size={12}/></button>
                         </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="flex gap-3 max-w-2xl"
              >
                <div className="w-8 h-8 rounded-xl bg-cyan-600 dark:bg-cyan-500 shadow-md shadow-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={18} className="text-white"/>
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                  <div className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-500 dark:bg-cyan-400 rounded-full animate-bounce"></div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-black/60 backdrop-blur-md border-t border-slate-200 dark:border-white/10 flex flex-col gap-3">
            {messages.length <= 1 && (
              <div className="max-w-5xl mx-auto w-full flex flex-wrap gap-2 px-1">
                {faqsData.slice(0, 3).map((faq, i) => (
                  <button 
                    key={i}
                    onClick={() => setInput(faq.question)}
                    className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-cyan-50 dark:bg-white/5 dark:hover:bg-cyan-500/10 text-slate-600 hover:text-cyan-700 dark:text-slate-300 dark:hover:text-cyan-300 border border-slate-200 dark:border-white/10 rounded-full transition-all duration-200 flex items-center gap-1"
                  >
                    <MessageSquare size={12} />
                    {faq.question}
                  </button>
                ))}
              </div>
            )}
            
            <form onSubmit={handleSend} className="max-w-5xl mx-auto w-full relative group flex items-center gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a support question..."
                  className="w-full bg-slate-100 dark:bg-white/5 border border-transparent focus:border-cyan-500/30 dark:focus:border-cyan-500/30 focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-3 pr-12 text-[14px] text-slate-800 dark:text-slate-100 placeholder-slate-500 outline-none transition-all shadow-sm"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 pointer-events-none text-xs">
                   ⌘ K
                </div>
              </div>
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-xl transition-all duration-200 shadow-md shadow-cyan-500/10 flex items-center justify-center flex-shrink-0"
              >
                {isTyping ? <Loader2 size={18} className="animate-spin"/> : <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />}
              </button>
            </form>
            <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
              RAG Copilot uses pure retrieval models • Zero risk of hallucination
            </p>
          </div>
        </section>

        {/* Right Sidebar: Available Questions */}
        <aside className="w-full lg:w-80 xl:w-96 bg-white dark:bg-black/90 flex flex-col h-[calc(100vh-4rem)] hidden lg:flex">
          <div className="p-4 border-b border-slate-200 dark:border-white/10 shrink-0 space-y-3">
            <h2 className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <HelpCircle size={16} className="text-cyan-600 dark:text-cyan-400"/>
              Content Modules
            </h2>
            
            <div className="relative">
              <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-100 dark:bg-white/5 border border-transparent focus:border-cyan-500/30 dark:focus:border-cyan-500/30 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex-grow overflow-y-auto p-3 custom-scrollbar space-y-1.5">
             {filteredFaqs.map((faq, i) => (
               <button 
                 key={i}
                 onClick={() => setInput(faq.question)}
                 className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-cyan-500/5 rounded-xl text-xs text-slate-700 dark:text-slate-300 transition-all duration-200 group flex items-start gap-2 border border-transparent hover:border-slate-100 dark:hover:border-cyan-500/10"
               >
                 <MessageSquare size={14} className="flex-shrink-0 mt-0.5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
                 <span className="group-hover:text-slate-900 dark:group-hover:text-cyan-100 transition-colors leading-relaxed">{faq.question}</span>
               </button>
             ))}
             {filteredFaqs.length === 0 && (
               <div className="text-center p-4 text-xs text-slate-400">
                 No questions found matching &quot;{searchTerm}&quot;
               </div>
             )}
          </div>
        </aside>
      </main>
    </div>
  );
}
