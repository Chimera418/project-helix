'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { KeyRound, ArrowRight } from 'lucide-react';

export default function Round2Success() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-2xl mx-auto text-center gap-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: 20 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-32 h-32 rounded-full border-4 border-green-500 m-auto flex items-center justify-center bg-green-900/30 neon-border-green shadow-[0_0_50px_rgba(0,255,0,0.3)]"
      >
        <KeyRound size={64} className="text-green-400" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold font-mono text-white mb-2">TARGET ELIMINATED</h2>
        <p className="text-gray-400 uppercase tracking-widest text-sm mb-6">Round 2 Cleared</p>
        
        <div className="glass p-6 rounded-xl border-green-500/30 inline-block">
          <p className="text-xs uppercase tracking-[0.2em] text-green-500 mb-2">Acquired Item</p>
          <p className="text-2xl font-bold neon-text-green tracking-wider bg-black/50 py-3 px-6 rounded border border-green-500/10">KEY FRAGMENT 2</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <button
          onClick={() => router.push('/round/3')}
          className="inline-flex items-center gap-2 bg-green-600/20 hover:bg-green-500/30 border border-green-500 text-green-400 font-bold py-4 px-8 rounded-lg uppercase tracking-widest transition-colors neon-text-green mt-8"
        >
          Initialize Don't Wordle <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}
