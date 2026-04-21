'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { HelpCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// Assume we have some way to trigger the actual hint to show up

interface HintButtonProps {
  hints: string[];
}

export default function HintButton({ hints }: HintButtonProps) {
  const { team, setTeam } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  
  if (!team) return null;

  const usedCount = team.round_hints_used || 0;
  const hasMoreHints = usedCount < hints.length;

  const getPenaltyText = () => {
    if (usedCount === 0) return "Free";
    if (usedCount === 1) return "-1 Minute";
    if (usedCount === 2) return "-3 Minutes";
    return "-5 Minutes";
  };

  const calculatePenalty = (currentUsed: number) => {
    if (currentUsed === 0) return 0;
    if (currentUsed === 1) return 1;
    if (currentUsed === 2) return 3;
    return 5;
  };

  const handleUseHint = () => {
    if (!hasMoreHints) return;
    
    const penalty = calculatePenalty(usedCount);
    
    // In a real app we'd call Supabase here to update the DB
    setTeam({
      ...team,
      hints_used: (team.hints_used || 0) + 1,
      round_hints_used: usedCount + 1,
      penalty_minutes: (team.penalty_minutes || 0) + penalty
    });
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="glass p-3 rounded-full hover:bg-white/5 transition-colors border-yellow-500/30 neon-text-cyan flex items-center justify-center relative group"
        title="Need a hint?"
      >
        <HelpCircle size={24} className="text-yellow-400 group-hover:animate-spin-slow" />
        {usedCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {usedCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-4 w-72 glass p-4 rounded-xl border border-yellow-500/20 shadow-2xl z-50 flex flex-col gap-3"
          >
            <div className="flex items-start gap-2 text-yellow-400">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <h4 className="font-bold uppercase tracking-wider text-sm">System Help</h4>
            </div>
            
            {/* Show already unlocked hints */}
            <div className="flex flex-col gap-2">
              {hints.slice(0, usedCount).map((hint, i) => (
                <div key={i} className="text-sm bg-black/40 p-2 border border-white/5 rounded text-gray-200">
                  <strong className="text-cyan-400">Hint {i + 1}:</strong> {hint}
                </div>
              ))}
            </div>

            {/* Next Hint Info */}
            {hasMoreHints ? (
              <div className="mt-2 bg-yellow-500/10 border border-yellow-500/30 rounded p-3 flex flex-col items-center text-center gap-2">
                <span className="text-xs text-yellow-200/70 uppercase">Next Hint Cost:</span>
                <span className="text-lg font-mono font-bold text-red-400">{getPenaltyText()}</span>
                <button
                  onClick={handleUseHint}
                  className="mt-1 w-full bg-yellow-500 text-black font-bold uppercase text-xs py-2 rounded hover:bg-yellow-400 transition-colors"
                >
                  Unlock Hint
                </button>
              </div>
            ) : (
              <div className="text-xs text-center text-gray-500 mt-2 uppercase tracking-widest">
                No more hints available
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
