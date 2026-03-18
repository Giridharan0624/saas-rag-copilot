import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bot, ArrowRight, Zap, Shield, Search } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-400/10 dark:bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      {/* Header with Theme Toggle */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-600 dark:bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bot size={24} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-wide dark:text-cyan-100">SaaS Copilot</span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 mt-16 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 text-sm font-medium mb-8 border border-cyan-200 dark:border-cyan-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Now Available in Early Access
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Smarter support with <br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500">
              pure retrieval AI
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Instantly resolve customer queries using your own documentation. Zero hallucinations, complete source transparency, and enterprise-grade accuracy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              Get Started for Free <ArrowRight size={18} />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              Log In to Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-5xl w-full"
        >
          <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-sm">
            <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 text-cyan-600 dark:text-cyan-400">
              <Zap size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Instant Answers</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">BM25 and FAISS hybrid retrieval delivers lightning-fast responses from your knowledge base.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-sm">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
              <Search size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Pure Retrieval</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">No black-box generation. Every answer is backed by direct text chunks perfectly matched to the question.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-sm">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">100% Reliable</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Zero risk of hallucinations or made-up facts means you can trust Copilot to talk directly to your users.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
