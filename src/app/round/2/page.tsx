'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import HintButton from '@/components/ui/HintButton';
import { characters, Character } from '@/data/characters';
import { UserSearch, ArrowRight, UserX, Skull } from 'lucide-react';

const MAX_ATTEMPTS = 10;

export default function Round2() {
  const router = useRouter();
  const { team, setTeam } = useGameStore();
  
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [target, setTarget] = useState<Character | null>(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [guess, setGuess] = useState('');
  const [history, setHistory] = useState<{guess: string, correct: boolean}[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  
  const domains = Array.from(new Set(characters.map(c => c.domain)));

  useEffect(() => {
    if (!team) {
      router.replace('/');
      return;
    }
    setTeam({ ...team, current_round: 2 });
  }, []);

  // Broadcast live state to admin spy (combined to avoid stale spread races)
  useEffect(() => {
    if (!target || !team) return;
    const payload = {
      domain: target.domain,
      hintsRevealed: currentHintIndex + 1,
      totalHints: target.hints.length,
      history,
      gameState,
      attemptsUsed: history.length,
    };
    const needsUpdate =
      team.current_target !== target.name ||
      JSON.stringify(team.state_payload) !== JSON.stringify(payload);
    if (needsUpdate) setTeam({ ...team, current_round: 2, current_target: target.name, state_payload: payload });
  }, [target, currentHintIndex, history, gameState]);

  const handleDomainSelect = (d: string) => {
    setSelectedDomain(d);
    const domainChars = characters.filter(c => c.domain === d);
    setTarget(domainChars[Math.floor(Math.random() * domainChars.length)]);
  };

  if (!selectedDomain) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] w-full mt-8">
         <h1 className="text-3xl font-bold font-mono neon-text-cyan mb-8 tracking-widest uppercase text-center">Select Target Domain</h1>
         <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
           {domains.map(d => (
             <button
                key={d}
                onClick={() => handleDomainSelect(d)}
                className="bg-black/50 border border-cyan-500/30 text-cyan-400 p-6 rounded-xl hover:bg-cyan-900/30 hover:border-cyan-400 transition-all uppercase tracking-widest font-bold"
             >
               {d}
             </button>
           ))}
         </div>
      </div>
    );
  }

  if (!target) return null;

  const attemptsRemaining = MAX_ATTEMPTS - history.length;

  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameState !== 'playing' || !guess.trim()) return;

    const formattedGuess = guess.trim().toLowerCase();
    const isCorrect = formattedGuess === target.name.toLowerCase() || 
                      !!(target.aliases && target.aliases.some(a => a.toLowerCase() === formattedGuess));

    setHistory([{ guess: guess.trim(), correct: isCorrect }, ...history]);
    setGuess('');

    if (isCorrect) {
      setGameState('won');
    } else {
      if (attemptsRemaining - 1 <= 0) {
        setGameState('lost');
      } else {
        // Reveal next hint if available
        if (currentHintIndex < target.hints.length - 1) {
          setCurrentHintIndex((prev) => prev + 1);
        }
      }
    }
  };

  const finishRound = () => {
    if(team) {
      setTeam({
        ...team,
        keys_unlocked: Math.max(team.keys_unlocked, 2),
        round_hints_used: 0
      });
    }
    router.push('/round/2/success');
  };

  const restartRound = () => {
    // We optionally penalize restart, or just let them try again. Let's just pick a new random target.
    const domainChars = characters.filter(c => c.domain === selectedDomain);
    const randomChar = domainChars[Math.floor(Math.random() * domainChars.length)];
    setTarget(randomChar);
    setCurrentHintIndex(0);
    setHistory([]);
    setGameState('playing');
  };

  const roundHints = target ? target.hints.slice(currentHintIndex + 1) : [];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto mt-8 relative">
      <div className="w-full flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-wider neon-text-cyan flex items-center gap-3">
             <UserSearch className="text-cyan-400" /> ROUND 2: THREAT INTELLIGENCE
          </h1>
          <p className="text-gray-400 uppercase tracking-widest text-sm mt-1">Identify the target entity from active logs</p>
        </div>
        <HintButton hints={roundHints} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        {/* Left: Hint Display */}
        <div className="lg:col-span-2 glass rounded-2xl p-6 border-cyan-500/20 flex flex-col gap-4">
           <div className="flex justify-between items-center mb-4">
             <div className="bg-purple-900/40 text-purple-400 py-1 px-3 rounded border border-purple-500/30 text-xs uppercase tracking-widest font-bold">
               Domain: {target.domain}
             </div>
             <div className={`font-mono text-sm ${attemptsRemaining <= 3 ? 'text-red-400 animate-pulse' : 'text-cyan-500'}`}>
               Attempts Reamining: {attemptsRemaining} / {MAX_ATTEMPTS}
             </div>
           </div>

           <div className="flex-1 flex flex-col gap-3 min-h-[300px]">
              {target.hints.slice(0, currentHintIndex + 1).map((h, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: 'spring' }}
                  key={i} 
                  className={`p-4 rounded-xl border ${i === currentHintIndex ? 'bg-cyan-900/20 border-cyan-500/50 text-cyan-50 neon-border-cyan' : 'bg-white/5 border-white/10 text-gray-400'}`}
                >
                  <span className="text-xs font-bold uppercase tracking-widest opacity-50 block mb-1">Clue {i + 1}</span>
                  {h}
                </motion.div>
              ))}
           </div>

           {gameState === 'playing' && (
             <form onSubmit={handleGuess} className="mt-4 flex gap-3 relative">
               <input 
                 type="text" 
                 value={guess}
                 onChange={e => setGuess(e.target.value)}
                 className="flex-1 bg-black/50 border border-cyan-500/30 rounded-lg p-4 font-mono text-white focus:outline-none focus:border-cyan-400 transition-colors uppercase placeholder:text-gray-600"
                 placeholder="Input Target Name..."
               />
               <button 
                  type="submit"
                  disabled={!guess.trim()}
                  className="bg-cyan-600/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 font-bold px-8 rounded-lg uppercase tracking-widest transition-all neon-text-cyan disabled:opacity-50"
               >
                 Submit
               </button>
             </form>
           )}

           {gameState !== 'playing' && (
             <div className={`mt-4 p-6 rounded-xl border flex flex-col items-center text-center gap-4 ${gameState === 'won' ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                {gameState === 'won' ? (
                  <>
                    <h3 className="text-2xl font-bold text-green-400">TARGET IDENTIFIED</h3>
                    <p className="text-green-100">You correctly identified <span className="font-bold underline">{target.name}</span> in {history.length} attempts.</p>
                    <button onClick={finishRound} className="bg-green-600/30 px-6 py-3 rounded-lg border border-green-500 text-green-300 font-bold uppercase tracking-widest hover:bg-green-500/40">Proceed</button>
                  </>
                ) : (
                  <>
                    <Skull className="text-red-500" size={48} />
                    <h3 className="text-2xl font-bold text-red-500">IDENTIFICATION FAILED</h3>
                    <p className="text-red-200">The target was <span className="font-bold underline">{target.name}</span>.</p>
                    <button onClick={restartRound} className="bg-red-600/30 px-6 py-3 rounded-lg border border-red-500 text-red-300 font-bold uppercase tracking-widest hover:bg-red-500/40 mt-2">Retry Sequence</button>
                  </>
                )}
             </div>
           )}
        </div>

        {/* Right: Guess History */}
        <div className="glass rounded-2xl p-6 border-white/5 flex flex-col h-[500px] lg:h-auto">
          <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
            <UserX size={14} /> Scan History
          </h3>
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 custom-scrollbar">
            <AnimatePresence>
              {history.length === 0 && (
                <div className="text-gray-600 text-sm italic py-4 text-center">No scans attempted yet.</div>
              )}
              {history.map((h, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`p-3 rounded border text-sm flex justify-between items-center ${h.correct ? 'bg-green-900/20 border-green-500/30 text-green-300' : 'bg-red-900/10 border-red-500/20 text-red-300/70'}`}
                >
                  <span className="font-mono uppercase truncate">{h.guess}</span>
                  <span className="text-[10px] tracking-widest uppercase opacity-70">
                    {h.correct ? 'Match' : 'Mismatch'}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
