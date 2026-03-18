'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LogOut, Bot, User as UserIcon, Loader2, Info } from 'lucide-react';
import clsx from 'clsx';

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

export default function Home() {
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
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post('/api/query/', { query: userMsg.content });
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.answer,
        confidence: response.data.confidence,
        sources: response.data.sources,
        fallback: response.data.fallback
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I had trouble connecting to the server. Please try again later.",
        fallback: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="flex-none h-16 border-b border-white/10 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Bot size={20} className="text-white" />
          </div>
          <h1 className="font-semibold tracking-wide text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-cyan-100">
            SaaS Copilot
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
            <span className="text-slate-300">{user?.username}</span>
          </div>
          <button 
            onClick={logout}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow overflow-hidden flex flex-col lg:flex-row max-w-7xl mx-auto w-full">
        {/* Chat Area */}
        <section className="flex-grow flex flex-col relative min-w-0 border-r border-white/5 h-[calc(100vh-4rem)]">
          
          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={clsx("flex gap-4 max-w-3xl", msg.role === 'user' ? "ml-auto flex-row-reverse" : "")}
                >
                  <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1", 
                    msg.role === 'user' ? "bg-slate-800 border border-slate-700" : "bg-gradient-to-br from-blue-600 to-cyan-600 shadow-md shadow-blue-500/20"
                  )}>
                    {msg.role === 'user' ? <UserIcon size={16} className="text-slate-300"/> : <Bot size={18} className="text-white"/>}
                  </div>
                  
                  <div className={clsx("flex flex-col gap-1", msg.role === 'user' ? "items-end" : "items-start")}>
                    <div className={clsx(
                      "px-5 py-3 rounded-2xl text-[15px] leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-slate-800 text-slate-100 border border-slate-700/50 rounded-tr-sm" 
                        : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-sm backdrop-blur-sm shadow-sm"
                    )}>
                      {msg.content}
                    </div>
                    
                    {msg.role === 'assistant' && msg.id !== 'welcome' && (
                      <div className="flex items-center gap-3 px-1 mt-1">
                         {msg.fallback ? (
                           <span className="text-xs text-orange-400 flex items-center gap-1">
                             <Info size={12}/> Low confidence fallback
                           </span>
                         ) : (
                           <span className={clsx("text-xs flex items-center gap-1", 
                              (msg.confidence || 0) > 0.8 ? "text-emerald-400" : "text-amber-400"
                           )}>
                             Confidence: {msg.confidence ? (msg.confidence * 100).toFixed(1) : 0}%
                           </span>
                         )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                className="flex gap-4 max-w-3xl"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={18} className="text-white"/>
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-slate-900/40 backdrop-blur-md border-t border-white/10">
            <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a support question..."
                className="w-full bg-slate-950 border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 rounded-xl px-5 py-4 pr-14 text-slate-100 placeholder-slate-500 outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors"
              >
                <Send size={18} className={input.trim() && !isTyping ? "translate-x-[-1px] translate-y-[1px]" : ""} />
              </button>
            </form>
            <p className="text-center text-[11px] text-slate-500 mt-3 font-medium tracking-wide uppercase">
              RAG Copilot uses pure retrieval without generative AI hallucinations.
            </p>
          </div>
        </section>

        {/* Sources / Explainability Sidebar */}
        <aside className="w-full lg:w-80 xl:w-96 bg-slate-900/20 border-l border-white/5 flex flex-col h-[calc(100vh-4rem)] hidden lg:flex">
          <div className="p-4 border-b border-white/5 bg-slate-900/40">
            <h2 className="font-semibold text-sm text-slate-300 flex items-center gap-2">
              <Info size={16} className="text-blue-400"/>
              Source Information
            </h2>
          </div>
          <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
            {messages.length > 1 ? (
              <div className="space-y-4">
                {messages[messages.length - 1].sources?.map((source, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="p-3 bg-white/[0.02] border border-white/10 rounded-xl text-sm"
                  >
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-white/5">
                      <span className="text-xs font-mono text-slate-500">Source #{i + 1}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                        Score: {source.score.toFixed(3)}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[13px]">{source.chunk}</p>
                    <div className="flex gap-2 mt-3 pt-2 border-t border-white/5 text-[10px] text-slate-500 font-mono">
                      <span>FAISS: {source.faiss_dist?.toFixed(2) ?? 'N/A'}</span>
                      <span>BM25: {source.bm25_score?.toFixed(2) ?? 'N/A'}</span>
                    </div>
                  </motion.div>
                ))}
                {!messages[messages.length - 1].sources?.length && (
                  <p className="text-sm text-slate-500 text-center mt-10">No sources retrieved for this message.</p>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-3 opacity-50">
                <Bot size={32} />
                <p className="text-sm text-center px-4">Ask a question to see the internal retrieval sources.</p>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
