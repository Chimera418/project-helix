'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import HintButton from '@/components/ui/HintButton';
import { VALID_WORDS } from '@/data/words';
import { Skull, AlertTriangle, ShieldCheck, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Simple types
type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';
interface Guess {
  word: string;
  statuses: LetterStatus[];
}

// Constraints extracted from all guesses
interface Constraints {
  greens: { [index: number]: string }; // index -> letter
  yellows: { [letter: string]: number[] }; // letter -> invalid indices
  grays: Set<string>;
}

// How many successful safe guesses needed to win
const REQUIRED_SURVIVALS = 6;

export default function Round3() {
  const router = useRouter();
  const { team, setTeam } = useGameStore();

  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [errorMessage, setErrorMessage] = useState('');

  // Undos left
  const [undos, setUndos] = useState(3);
  const [wordListVisible, setWordListVisible] = useState(false);
  const [wordSearch, setWordSearch] = useState('');

  // Single init: restore or pick target word
  useEffect(() => {
    if (!team) {
      router.replace('/');
      return;
    }
    // If this team already has a persisted wordle target, restore it.
    // This prevents the word from changing on every refresh.
    const saved = (team.state_payload?.targetWord as string | undefined);
    if (saved && saved.length === 5) {
      setTargetWord(saved.toUpperCase());
      // Also restore their guesses so progress isn't lost
      const savedGuesses = team.state_payload?.guesses;
      if (Array.isArray(savedGuesses) && savedGuesses.length > 0) {
        setGuesses(savedGuesses);
      }
      return;
    }
    // First time on this round: pick a random target that is NEVER the cipher word
    const cipherWord = team.cipher_word?.toUpperCase() ?? '';
    const pool = VALID_WORDS.filter(w => w.toUpperCase() !== cipherWord);
    setTargetWord(pool[Math.floor(Math.random() * pool.length)].toUpperCase());
  }, []);

  // Combined sync: always writes current_round: 3 + target + payload in one atomic update
  // Uses targetWord as the primary trigger so it only runs once target is known
  useEffect(() => {
    if (!team || !targetWord) return;

    const payload = { guesses, undos, targetWord };
    const needsUpdate =
      team.current_round !== 3 ||
      team.current_target !== targetWord ||
      JSON.stringify(team.state_payload) !== JSON.stringify(payload);

    if (needsUpdate) {
      setTeam({
        ...team,
        current_round: 3,
        current_target: targetWord,
        state_payload: payload,
      });
    }
  }, [targetWord, guesses, undos]);

  // Build constraints from all existing guesses
  const getConstraints = (history: Guess[]): Constraints => {
    const greens: { [i: number]: string } = {};
    const yellows: { [l: string]: number[] } = {};
    const grays = new Set<string>();

    history.forEach(g => {
      g.word.split('').forEach((letter, i) => {
        const stat = g.statuses[i];
        if (stat === 'correct') {
          greens[i] = letter;
        } else if (stat === 'present') {
          if (!yellows[letter]) yellows[letter] = [];
          yellows[letter].push(i);
        } else if (stat === 'absent') {
          // Add to grays only if not green/yellow elsewhere
          if (!history.some(prev => prev.word.includes(letter) && (prev.statuses[prev.word.indexOf(letter)] === 'correct' || prev.statuses[prev.word.indexOf(letter)] === 'present'))) {
            grays.add(letter);
          }
        }
      });
    });

    return { greens, yellows, grays };
  };

  const currentConstraints = getConstraints(guesses);

  // Validate a potential word against constraints
  const isValidUnderConstraints = (word: string, c: Constraints): string | true => {
    const chars = word.split('');
    
    // Check Greens
    for (let i = 0; i < 5; i++) {
        if (c.greens[i] && chars[i] !== c.greens[i]) {
            return `Must use '${c.greens[i].toUpperCase()}' at position ${i + 1}`;
        }
    }

    // Check Grays
    for (const char of chars) {
        if (c.grays.has(char)) {
            // Note: edge case where a word has 2 of a letter, one gray one green/yellow is tricky, 
            // but we simplified gray logic
            return `Cannot use '${char.toUpperCase()}'`;
        }
    }

    // Check Yellows
    for (const [yLetter, invalidIndices] of Object.entries(c.yellows)) {
        if (!word.includes(yLetter)) {
            return `Must contain '${yLetter.toUpperCase()}'`;
        }
        for (let i = 0; i < 5; i++) {
            if (chars[i] === yLetter && invalidIndices.includes(i)) {
                return `'${yLetter.toUpperCase()}' cannot be at position ${i + 1}`;
            }
        }
    }

    return true;
  };

  // Evaluate a guess against the target word
  const evaluateGuess = (word: string, target: string): LetterStatus[] => {
    const statuses: LetterStatus[] = Array(5).fill('absent');
    const targetChars = target.split('');
    const wordChars = word.split('');

    // Greens pass
    wordChars.forEach((ch, i) => {
      if (ch === targetChars[i]) {
        statuses[i] = 'correct';
        targetChars[i] = ''; // mark consumed
      }
    });

    // Yellows pass
    wordChars.forEach((ch, i) => {
      if (statuses[i] !== 'correct' && targetChars.includes(ch)) {
        statuses[i] = 'present';
        targetChars[targetChars.indexOf(ch)] = ''; // consume
      }
    });

    return statuses;
  };

  const handleKeyInput = (key: string) => {
    if (gameState !== 'playing') return;
    setErrorMessage('');

    if (key === 'Enter') {
      submitGuess();
    } else if (key === 'Backspace' || key === 'Delete') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[a-zA-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key.toLowerCase());
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    handleKeyInput(e.key);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, gameState]);

  const submitGuess = () => {
    if (currentGuess.length !== 5) {
      setErrorMessage('Not enough letters');
      return;
    }
    if (!VALID_WORDS.includes(currentGuess)) {
      setErrorMessage('Not in word list');
      return;
    }

    const validity = isValidUnderConstraints(currentGuess, currentConstraints);
    if (validity !== true) {
      setErrorMessage(validity);
      return;
    }

    const statuses = evaluateGuess(currentGuess, targetWord);
    const newGuesses = [...guesses, { word: currentGuess, statuses }];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess === targetWord) {
      setGameState('lost'); // They guessed the word, they lose!
    } else if (newGuesses.length >= REQUIRED_SURVIVALS) {
      setGameState('won'); // They survived
    }
  };

  const handleUndo = () => {
    if (undos > 0 && guesses.length > 0 && gameState === 'playing') {
      setGuesses(guesses.slice(0, -1));
      setUndos(u => u - 1);
      setErrorMessage('');
    }
  };

  const restartWithPenalty = () => {
    // Penalty + hint reset on retry
    const cipherWord = team?.cipher_word?.toUpperCase() ?? '';
    const pool = VALID_WORDS.filter(w => w.toUpperCase() !== cipherWord);
    const newWord = pool[Math.floor(Math.random() * pool.length)].toUpperCase();
    if (team) {
      setTeam({
        ...team,
        penalty_minutes: (team.penalty_minutes || 0) + 3,
        round_hints_used: 0,        // reset hints so they reflect the new word
        state_payload: { guesses: [], undos: 3, targetWord: newWord },
        current_target: newWord,
      });
    }
    setTargetWord(newWord);
    setGuesses([]);
    setCurrentGuess('');
    setGameState('playing');
    setUndos(3);
  };

  const finishRound = () => {
    if(team) setTeam({ ...team, keys_unlocked: Math.max(team.keys_unlocked, 3), round_hints_used: 0 });
    router.push('/round/3/success');
  };

  // Remaining valid words count
  const validWordsCount = VALID_WORDS.filter(w => isValidUnderConstraints(w, currentConstraints) === true).length;

  const roundHints = targetWord ? [
    `The lethal target word begins with the letter '${targetWord[0].toUpperCase()}'. Try to avoid words starting with this.`,
    `The lethal target word also contains the letter '${targetWord[Math.floor(targetWord.length / 2)].toUpperCase()}'.`,
    `DANGER OVERRIDE: The exact lethal target word is "${targetWord.toUpperCase()}". Do whatever it takes to not guess it!`
  ] : [];

  const renderGridRow = (g: Guess | null, isCurrent: boolean, rowKey?: string | number) => {
    const chars = isCurrent ? currentGuess.padEnd(5, ' ').split('') : g?.word.split('') || Array(5).fill(' ');
    
    return (
      <div key={rowKey} className="flex gap-2 mb-2 justify-center">
        {chars.map((char, i) => {
          let bgClass = "bg-black/50 border-white/20";
          if (g) {
            const stat = g.statuses[i];
            if (stat === 'correct') bgClass = "bg-green-600 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]";
            if (stat === 'present') bgClass = "bg-yellow-600 border-yellow-500 text-white";
            if (stat === 'absent') bgClass = "bg-gray-800 border-gray-700 text-gray-400";
          }
          return (
            <motion.div 
              key={i}
              initial={isCurrent ? { scale: 1 } : { rotateX: 90 }}
              animate={isCurrent ? { scale: char !== ' ' ? 1.05 : 1 } : { rotateX: 0 }}
              transition={{ delay: isCurrent ? 0 : i * 0.1 }}
              className={`w-12 h-14 sm:w-14 sm:h-16 flex items-center justify-center font-bold text-2xl uppercase border-2 rounded ${bgClass}`}
            >
              {char}
            </motion.div>
          );
        })}
      </div>
    );
  };

  if (!targetWord) return null;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto mt-8 relative">
       <div className="w-full flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-wider neon-text-cyan flex items-center gap-3">
             <ShieldCheck className="text-cyan-400" /> ROUND 3: ZERO-DAY EXPLOIT
          </h1>
          <p className="text-gray-400 uppercase tracking-widest text-sm mt-1">Survive {REQUIRED_SURVIVALS} turns without triggering the zero-day payload.</p>
        </div>
        <HintButton hints={roundHints} />
      </div>

      <div className="flex gap-6 w-full flex-col lg:flex-row">
        {/* Left: Info Panel */}
        <div className="lg:w-1/3 flex flex-col gap-4">
           <div className="glass p-6 rounded-2xl border-cyan-500/20 text-center flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-widest text-gray-400 mb-2">Valid Options Remaining</span>
              <span className={`text-5xl font-bold font-mono ${validWordsCount < 5 ? 'text-red-500 animate-pulse' : 'text-cyan-400'}`}>
                {validWordsCount}
              </span>
           </div>

           <div className="glass p-6 rounded-2xl border-cyan-500/20">
              <h3 className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4 border-b border-white/10 pb-2">Status</h3>
              <ul className="text-sm space-y-2 text-gray-300">
                <li className="flex justify-between">
                  <span>Survivals:</span>
                  <span className="font-mono text-green-400">{guesses.length} / {REQUIRED_SURVIVALS}</span>
                </li>
                <li className="flex justify-between">
                  <span>Undos Left:</span>
                  <span className="font-mono text-yellow-400">{undos}</span>
                </li>
              </ul>
              
              <button 
                onClick={handleUndo}
                disabled={undos === 0 || guesses.length === 0 || gameState !== 'playing'}
                className="mt-6 w-full py-2 bg-yellow-600/20 border border-yellow-500/50 text-yellow-400 font-bold rounded uppercase tracking-wider text-xs hover:bg-yellow-500/30 disabled:opacity-30 transition-colors"
               >
                 Undo Last Guess
              </button>

              {/* Word List Reveal */}
              {!wordListVisible ? (
                <button
                  onClick={() => {
                    if (gameState === 'playing' && team) {
                      setWordListVisible(true);
                      setTeam({ ...team, penalty_minutes: (team.penalty_minutes || 0) + 1 });
                    }
                  }}
                  disabled={gameState !== 'playing'}
                  className="mt-3 w-full py-2 bg-red-900/20 border border-red-500/30 text-red-400 font-bold rounded uppercase tracking-wider text-xs hover:bg-red-500/20 disabled:opacity-30 transition-colors flex items-center justify-center gap-2"
                >
                  <List size={12} /> Reveal Word List (+1 min)
                </button>
              ) : (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-red-400 font-bold uppercase tracking-widest">Word List (-1 min applied)</span>
                    <button onClick={() => setWordListVisible(false)} className="text-gray-500 text-xs hover:text-gray-300">✕ Close</button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search words..."
                    value={wordSearch}
                    onChange={e => setWordSearch(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded px-2 py-1 text-xs text-white font-mono mb-2 focus:outline-none focus:border-cyan-500/50"
                  />
                  <div className="h-48 overflow-y-auto bg-black/40 rounded border border-white/5 p-2">
                    <div className="flex flex-wrap gap-1">
                      {VALID_WORDS
                        .filter(w => !wordSearch || w.includes(wordSearch.toLowerCase()))
                        .slice(0, 500)
                        .map(w => (
                          <span
                            key={w}
                            onClick={() => setCurrentGuess(w)}
                            className="px-1.5 py-0.5 bg-white/5 hover:bg-cyan-900/30 hover:text-cyan-300 font-mono text-[10px] text-gray-400 rounded cursor-pointer transition-colors"
                          >
                            {w}
                          </span>
                        ))}
                      {VALID_WORDS.filter(w => !wordSearch || w.includes(wordSearch.toLowerCase())).length > 500 && (
                        <span className="text-gray-600 text-[10px] font-mono w-full text-center py-1">...and {VALID_WORDS.filter(w => !wordSearch || w.includes(wordSearch.toLowerCase())).length - 500} more. Use search to narrow down.</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
           </div>
        </div>

        {/* Right: Grid */}
        <div className="lg:w-2/3 glass rounded-2xl border-cyan-500/20 p-8 flex flex-col items-center min-h-[400px] relative">
          
          <div className="mb-4 h-6 text-center text-red-400 font-bold tracking-widest uppercase text-sm animate-pulse">
            {errorMessage}
          </div>

          <div className="flex flex-col">
            {guesses.map((g, i) => renderGridRow(g, false, `guess-${i}`))}
            
            {gameState === 'playing' && guesses.length < REQUIRED_SURVIVALS && (
               renderGridRow(null, true, 'current-guess')
            )}
            
            {/* Pad remaining rows */}
            {Array(Math.max(0, REQUIRED_SURVIVALS - guesses.length - (gameState === 'playing' ? 1 : 0))).fill(0).map((_, i) => (
              <div className="flex gap-2 mb-2 justify-center opacity-30" key={`empty-${i}`}>
                {Array(5).fill(0).map((_, j) => (
                  <div key={j} className="w-12 h-14 sm:w-14 sm:h-16 border-2 border-white/10 rounded bg-black/30" />
                ))}
              </div>
            ))}
          </div>

          {gameState !== 'playing' && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-8 rounded-2xl backdrop-blur-md ${gameState === 'won' ? 'bg-green-900/40' : 'bg-red-900/60'}`}
            >
               {gameState === 'won' ? (
                 <>
                   <ShieldCheck className="text-green-400 mb-4" size={64} />
                   <h2 className="text-3xl font-bold font-mono text-green-300 mb-2">SURVIVED</h2>
                   <p className="text-green-100 mb-6 text-center">You successfully avoided the target word.</p>
                   <button onClick={finishRound} className="bg-green-600 border border-green-400 text-white font-bold py-3 px-8 rounded uppercase tracking-widest">Proceed</button>
                 </>
               ) : (
                 <>
                   <Skull className="text-red-400 mb-4" size={64} />
                   <h2 className="text-3xl font-bold font-mono text-red-300 mb-2">TARGET BREACHED</h2>
                   <p className="text-red-100 mb-2 text-center text-xl tracking-widest font-mono">"{targetWord.toUpperCase()}"</p>
                   <p className="text-red-200 mb-6 text-center text-sm">You fell into the trap. (-3 min penalty)</p>
                   <button onClick={restartWithPenalty} className="bg-red-600 border border-red-400 text-white font-bold py-3 px-8 rounded uppercase tracking-widest">Retry Sequence</button>
                 </>
               )}
            </motion.div>
          )}

          {/* Virtual Keyboard */}
          <div className="mt-8 flex flex-col gap-2 w-full max-w-[400px] self-center">
             {['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map((row, rowIdx) => (
                <div key={rowIdx} className="flex justify-center gap-1 sm:gap-2">
                   {rowIdx === 2 && (
                     <button onClick={() => handleKeyInput('Enter')} className="px-2 sm:px-3 bg-cyan-900/30 hover:bg-cyan-600/50 border border-cyan-500/30 rounded font-bold text-[10px] sm:text-xs uppercase text-cyan-100 transition-colors">ENT</button>
                   )}
                   {row.split('').map(letter => {
                      let bg = "bg-white/5 hover:bg-white/10 border-white/10";
                      let tc = "text-gray-200";
                      
                      if (Object.values(currentConstraints.greens).includes(letter)) {
                        bg = "bg-green-600 hover:bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]";
                        tc = "text-white";
                      } else if (currentConstraints.yellows[letter]) {
                        bg = "bg-yellow-600 hover:bg-yellow-500 border-yellow-500";
                        tc = "text-white";
                      } else if (currentConstraints.grays.has(letter)) {
                        bg = "bg-black/60 hover:bg-black/40 border-black/80";
                        tc = "text-gray-600";
                      }
                      
                      return (
                        <button 
                          key={letter}
                          onClick={() => handleKeyInput(letter)}
                          className={`w-7 h-10 sm:w-10 sm:h-12 flex items-center justify-center rounded border font-bold uppercase transition-colors text-sm sm:text-base ${bg} ${tc}`}
                        >
                          {letter}
                        </button>
                      );
                   })}
                   {rowIdx === 2 && (
                     <button onClick={() => handleKeyInput('Backspace')} className="px-2 sm:px-3 bg-cyan-900/30 hover:bg-cyan-600/50 border border-cyan-500/30 rounded font-bold text-[10px] sm:text-xs uppercase text-cyan-100 transition-colors">DEL</button>
                   )}
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
