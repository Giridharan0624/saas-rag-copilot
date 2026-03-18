'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Bot, User as UserIcon, Loader2, MessageSquare, Shield, Zap, Database } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LandingPage } from '@/components/LandingPage';

export default function Home() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black transition-colors duration-300">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-400/5 dark:bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Header */}
      <header className="flex-none h-16 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-black/50 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-600 dark:bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bot size={20} className="text-white" />
          </div>
          <h1 className="font-semibold tracking-wide text-lg text-slate-900 dark:text-cyan-100">
            SaaS Copilot
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10 text-sm">
            <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
            <span className="text-slate-800 dark:text-slate-300">{user?.username}</span>
          </div>
          <ThemeToggle />
          <button 
            onClick={logout}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Dashboard Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-6xl mx-auto w-full z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            Welcome back, <span className="text-cyan-600 dark:text-cyan-400">{user?.username}</span>!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Your SaaS support metrics are synced and retrieval streams are online.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
          {/* User Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm grow flex flex-col"
          >
            <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 text-cyan-600 dark:text-cyan-400">
              <UserIcon size={20} />
            </div>
            <h3 className="text-lg font-semibold mb-1">User Account</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Profile and session status.</p>
            <div className="mt-auto space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-400">Username</span>
                <span className="font-medium">{user?.username}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-400">Status</span>
                <span className="text-emerald-500 font-medium">Active</span>
              </div>
            </div>
          </motion.div>

          {/* System Details Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm grow flex flex-col"
          >
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
              <Database size={20} />
            </div>
            <h3 className="text-lg font-semibold mb-1">Retrieval Metrics</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Indices and backend telemetry.</p>
            <div className="mt-auto space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-400">FAISS Chunks</span>
                <span className="font-medium">Initialized</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-400">BM25 Retrieval</span>
                <span className="text-emerald-500 font-medium">Online</span>
              </div>
            </div>
          </motion.div>

          {/* Security details */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="p-6 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm grow flex flex-col"
          >
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
              <Shield size={20} />
            </div>
            <h3 className="text-lg font-semibold mb-1">Architecture</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Privacy and security guarantees.</p>
            <div className="mt-auto space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-400">JWT Tokens</span>
                <span className="font-medium">Secured</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-white/5">
                <span className="text-slate-400">Analytics</span>
                <span className="font-medium">SaaS Standard</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="flex flex-col items-center gap-3"
        >
          <button 
            onClick={() => router.push('/chat')}
            className="px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-semibold transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-3 group text-lg"
          >
            Launch Support Chat 
            <MessageSquare size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Safe from hallucinations</span>
        </motion.div>
      </main>
    </div>
  );
}
