'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import HintButton from '@/components/ui/HintButton';
import { myths, MythQuestion } from '@/data/myths';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

// For the demo, they need to answer 3 questions correctly to pass.
const REQUIRED_SCORE = 3;

export default function Round1() {
  const router = useRouter();
  const { team, setTeam } = useGameStore();
  const [questions, setQuestions] = useState<MythQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  // State for current question interaction
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    if (!team) {
      router.replace('/');
      return;
    }
    // Shuffle questions and also shuffle the statements WITHIN each question
    const shuffled = [...myths].sort(() => 0.5 - Math.random()).slice(0, 5)
      .map(q => {
        const items = q.statements.map((stmt, i) => ({ stmt, exp: q.explanations[i] }));
        const shuffledItems = [...items].sort(() => 0.5 - Math.random());
        return {
          ...q,
          statements: shuffledItems.map(it => it.stmt) as [string, string, string],
          explanations: shuffledItems.map(it => it.exp) as [string, string, string],
          correctIndex: shuffledItems.findIndex(it => it.stmt === q.statements[q.correctIndex])
        };
      });
    setQuestions(shuffled);
    
    setTeam({ ...team, current_round: 1 });
  }, []);

  // Broadcast live state to admin spy
  useEffect(() => {
    if (!team || questions.length === 0) return;
    const q = questions[currentIndex];
    const answer = `Q${currentIndex + 1}: ${q.statements[q.correctIndex]}`;
    const payload = { score, currentIndex, total: questions.length, hasAnswered, selectedIdx, category: q.category };
    const needsUpdate = team.current_target !== answer || JSON.stringify(team.state_payload) !== JSON.stringify(payload);
    if (needsUpdate) setTeam({ ...team, current_round: 1, current_target: answer, state_payload: payload });
  }, [currentIndex, score, hasAnswered, selectedIdx, questions]);




  if (questions.length === 0) return null;

  const q = questions[currentIndex];
  // 1 is the default value if correctIndex isn't found, but it will be
  const isCorrect = selectedIdx === q.correctIndex;

  const handleSelect = (idx: number) => {
    if (hasAnswered) return;
    setSelectedIdx(idx);
    setHasAnswered(true);
    if (idx === q.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedIdx(null);
      setHasAnswered(false);
    } else {
      // End of round
      if (score >= REQUIRED_SCORE || (score + (isCorrect ? 1 : 0) >= REQUIRED_SCORE)) {
        // They pass
        const currentScore = score + (isCorrect && !hasAnswered ? 1 : 0);
        if(currentScore >= REQUIRED_SCORE) {
          finishRound();
        } else {
          // You failed, reload
          window.location.reload();
        }
      } else {
        // Failed
        window.location.reload();
      }
    }
  };

  const finishRound = () => {
    // Add Key Fragment reward
    if(team) {
      setTeam({
        ...team,
        keys_unlocked: Math.max(team.keys_unlocked, 1),
        round_hints_used: 0
      });
    }
    router.push('/round/1/success');
  }

  // Hints for Round 1
  const roundHints = q ? [
    `Think carefully about the ${q.category} mechanics. Watch out for absolute terms.`,
    `Here is a free FACT: "${q.statements[(q.correctIndex + 1) % 3]}" is completely true.`,
    `Here is another FACT: "${q.statements[(q.correctIndex + 2) % 3]}" is completely true. That means the remaining statement is the myth!`
  ] : [];

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto mt-8">
      {/* Round Header */}
      <div className="w-full flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-wider neon-text-cyan">ROUND 1: KERNEL PANIC</h1>
          <p className="text-gray-400 uppercase tracking-widest text-sm mt-1">Identify the false diagnostic statement</p>
        </div>
        <HintButton hints={roundHints} />
      </div>

      {/* Progress & Score */}
      <div className="w-full flex justify-between text-xs font-mono text-cyan-500 mb-4 px-2">
        <span>Question {currentIndex + 1} of {questions.length}</span>
        <span>Score: {score} / {REQUIRED_SCORE} needed</span>
      </div>

      {/* Question Card */}
      <motion.div 
        key={q.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full glass p-8 rounded-2xl border-cyan-500/20 flex flex-col gap-6"
      >
        <div className="flex justify-between items-start">
          <span className="bg-cyan-900/40 text-cyan-400 px-3 py-1 rounded border border-cyan-500/30 text-xs uppercase tracking-widest">
            {q.category} • {q.difficulty}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {q.statements.map((stmt, idx) => {
            const isSelected = selectedIdx === idx;
            const isMyth = idx === q.correctIndex;
            
            let btnClass = "text-left p-5 rounded-xl border transition-all duration-300 relative overflow-hidden ";
            
            if (!hasAnswered) {
              btnClass += "bg-white/5 border-white/10 hover:bg-cyan-900/20 hover:border-cyan-500/50 cursor-pointer";
            } else {
              if (isMyth) {
                // This was the correct answer (the myth)
                btnClass += "bg-green-900/20 border-green-500/50 neon-border-green";
              } else if (isSelected && !isMyth) {
                // They picked this, but it's not the myth (incorrect)
                btnClass += "bg-red-900/20 border-red-500/50";
              } else {
                // Not picked, not the myth
                btnClass += "bg-black/40 border-white/5 opacity-50";
              }
            }

            return (
              <button 
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={hasAnswered}
                className={btnClass}
              >
                <div className="flex items-start gap-3 relative z-10">
                  <div className={`mt-1 w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center
                    ${hasAnswered ? 
                        (isMyth ? 'border-green-500 text-green-500' : 
                          (isSelected ? 'border-red-500 text-red-500' : 'border-gray-600')) 
                        : 'border-gray-500'}`}
                  >
                    {hasAnswered && isMyth && <CheckCircle2 size={14} />}
                    {hasAnswered && isSelected && !isMyth && <XCircle size={14} />}
                  </div>
                  <span className={`text-base md:text-lg ${hasAnswered && isMyth ? 'text-green-100 font-medium' : 'text-gray-200'}`}>
                    {stmt}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <AnimatePresence>
          {hasAnswered && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 flex flex-col gap-4 overflow-hidden"
            >
              <div className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-900/20 border-green-500/30 text-green-200' : 'bg-red-900/20 border-red-500/30 text-red-200'}`}>
                <h3 className="font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                  {isCorrect ? 'System Bypassed' : 'Intrusion Detected'}
                </h3>
                <div className="text-sm opacity-80 mb-4">{isCorrect ? 'You successfully identified the false statement.' : 'You failed to identify the myth.'}</div>
                
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-current/20">
                  {q.explanations.map((exp, i) => (
                    <div key={i} className={`text-xs md:text-sm p-2 rounded ${i === q.correctIndex ? 'bg-black/40' : ''}`}>
                      {exp}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleNext}
                className="self-end inline-flex items-center gap-2 bg-cyan-600/20 hover:bg-cyan-500/30 border border-cyan-500 text-cyan-400 font-bold py-3 px-6 rounded-lg uppercase tracking-widest transition-colors neon-text-cyan"
              >
                {currentIndex < questions.length - 1 ? 'Next Sequence' : 'Finalize Run'} <ArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
