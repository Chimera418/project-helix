'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { DoorOpen, GlobeLock } from 'lucide-react';
import { parseISO, differenceInSeconds } from 'date-fns';

export default function Round5Final() {
  const router = useRouter();
  const { team, setTeam, timerDurationMinutes } = useGameStore();
  const [escapeCode, setEscapeCode] = useState('');
  const [isEscaped, setIsEscaped] = useState(false);
  const [error, setError] = useState('');
  const [finalTime, setFinalTime] = useState<string>('');
  const [targetWord, setTargetWord] = useState('');

  useEffect(() => {
    if (!team) {
      router.replace('/');
      return;
    }
    // Round 5 escape code = the same cipher_word used in Round 4
    const word = (team.cipher_word ?? team.current_target ?? '').toUpperCase();
    setTargetWord(word);
    setTeam({ ...team, current_round: 5, current_target: word });
  }, []);

  if (!team) return null;

  const handleEscape = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (escapeCode.trim().toUpperCase() === targetWord) {
      setIsEscaped(true);
      if (!team.end_time) {
        setTeam({ ...team, end_time: new Date().toISOString() });
      }
      if(team.start_time) {
        const start = parseISO(team.start_time);
        const elapsed = differenceInSeconds(new Date(), start);
        const totalElapsed = elapsed + (team.penalty_minutes || 0) * 60;
        const m = Math.floor(totalElapsed / 60);
        const s = totalElapsed % 60;
        setFinalTime(`${m}m ${s}s (including ${team.penalty_minutes || 0}m penalty)`);
      }
    } else {
      setError('INVALID DOOR CODE');
    }
  };

  if (isEscaped) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-2xl mx-auto text-center gap-8 relative z-50">
        <motion.div
           initial={{ opacity: 0, scale: 0.1 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ type: "spring", bounce: 0.5 }}
           className="w-48 h-48 rounded-full border-4 border-cyan-500 m-auto flex items-center justify-center bg-cyan-900/30 neon-border-cyan shadow-[0_0_100px_rgba(0,255,255,0.5)]"
        >
          <DoorOpen size={96} className="text-cyan-400" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h1 className="text-5xl md:text-7xl font-bold font-mono neon-text-cyan tracking-widest mb-4">ESCAPED</h1>
          <p className="text-xl text-gray-300 uppercase tracking-[0.3em] mb-8">Facility Breach Successful</p>

          <div className="glass p-8 rounded-2xl border-cyan-500/50 inline-flex flex-col gap-2">
             <span className="text-cyan-500 text-xs font-bold uppercase tracking-widest">Final Completion Time</span>
             <span className="text-3xl font-mono text-white">{finalTime}</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-2xl mx-auto text-center gap-8 relative z-50">
       <div className="glass p-12 rounded-3xl border-red-500/30 w-full relative overflow-hidden shadow-[0_0_50px_rgba(255,0,0,0.1)]">
          <div className="absolute inset-0 bg-red-900/10 pointer-events-none"></div>
          
          <GlobeLock size={64} className="text-red-500 mx-auto mb-6 opacity-80" />
          
          <h2 className="text-3xl font-bold font-mono tracking-widest text-white mb-2">ROUND 5: MAINFRAME OVERRIDE</h2>
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-4">Enter the escape code generated from your Cryptographic Bypass decryption to override the mainframe.</p>
          <div className="mb-6 px-4 py-2 bg-black/50 rounded-lg border border-red-500/20 font-mono text-xs text-gray-500">
            Hint: The code is the decrypted master password from Round 4 — ask your team.
          </div>

          <form onSubmit={handleEscape} className="flex flex-col items-center gap-6">
            <input 
                 type="text" 
                 value={escapeCode}
                 onChange={e => setEscapeCode(e.target.value)}
                 className="bg-black/80 border-2 border-red-500/50 rounded-xl w-full max-w-xs p-4 font-mono text-3xl text-center text-white focus:outline-none focus:border-red-400 transition-colors uppercase tracking-[0.3em] shadow-[inset_0_0_20px_rgba(255,0,0,0.2)]"
                 placeholder="CODE"
                 maxLength={10}
            />
            {error && <span className="text-red-500 text-sm font-mono animate-pulse">{error}</span>}
            
            <button 
                type="submit"
                disabled={!escapeCode.trim()}
                className="w-full max-w-xs bg-red-600 hover:bg-red-500 border border-red-400 text-white font-bold py-4 rounded-xl uppercase tracking-widest transition-all disabled:opacity-50 mt-4 shadow-[0_0_30px_rgba(255,0,0,0.4)]"
              >
                OPEN DOOR
             </button>
          </form>
       </div>
    </div>
  );
}
