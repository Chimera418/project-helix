'use client';

import { useState, useEffect, use } from 'react';
import { supabase, Team } from '@/lib/supabase';
import {
  ShieldCheck, ShieldAlert, Key, Timer, ArrowLeft, BrainCircuit,
  Eye, SkipForward, Minus, Plus, RotateCcw, Zap, User,
  Radio, Search, Skull, Lock, Rocket, CheckCircle2, XCircle, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { parseISO, differenceInSeconds } from 'date-fns';
import { VALID_WORDS } from '@/data/words';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';

/* ───── Types ───── */
type LetterStatus = 'correct' | 'present' | 'absent';
interface WordleGuess { word: string; statuses: LetterStatus[]; }
interface Constraints {
  greens: { [i: number]: string };
  yellows: { [l: string]: number[] };
  grays: Set<string>;
}

const getConstraints = (history: WordleGuess[]): Constraints => {
  const greens: { [i: number]: string } = {};
  const yellows: { [l: string]: number[] } = {};
  const grays = new Set<string>();
  history.forEach(g => {
    g.word.split('').forEach((letter, i) => {
      const stat = g.statuses[i];
      if (stat === 'correct') greens[i] = letter;
      else if (stat === 'present') {
        if (!yellows[letter]) yellows[letter] = [];
        if (!yellows[letter].includes(i)) yellows[letter].push(i);
      } else if (stat === 'absent') {
        // Standard Wordle fix: Only add to grays if it's never green or yellow elsewhere
        const everGreenOrYellow = history.some(past => 
          past.word.split('').some((ch, idx) => 
            ch === letter && (past.statuses[idx] === 'correct' || past.statuses[idx] === 'present')
          )
        );
        if (!everGreenOrYellow) grays.add(letter);
      }
    });
  });
  return { greens, yellows, grays };
};
const isValidWord = (w: string, c: Constraints) => {
  const ch = w.split('');
  // Check greens
  for (let i = 0; i < 5; i++) if (c.greens[i] && ch[i] !== c.greens[i]) return false;
  // Check grays (relaxed for duplicates)
  for (const char of ch) {
    if (c.grays.has(char)) {
      const isActuallyNeeded = Object.values(c.greens).includes(char) || Object.keys(c.yellows).includes(char);
      if (!isActuallyNeeded) return false;
    }
  }
  // Check yellows
  for (const [yl, inv] of Object.entries(c.yellows)) {
    if (!w.includes(yl)) return false;
    for (let i = 0; i < 5; i++) if (ch[i] === yl && inv.includes(i)) return false;
  }
  return true;
};

const ROUND_META: Record<number, { label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  1: { label: 'Kernel Panic',         icon: Radio,     color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  2: { label: 'Threat Intelligence',  icon: Search,    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  3: { label: 'Zero-Day Exploit',     icon: Skull,     color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' },
  4: { label: 'Crypto Bypass',        icon: Lock,      color: 'text-orange-400 border-orange-500/30 bg-orange-500/10' },
  5: { label: 'Mainframe Override',   icon: Rocket,    color: 'text-red-400 border-red-500/30 bg-red-500/10' },
};

/* ───── Live Timer ───── */
function LiveTimerDisplay({ team, timerDuration }: { team: Team; timerDuration: number }) {
  const [display, setDisplay] = useState('');
  const [urgent, setUrgent] = useState(false);
  useEffect(() => {
    const update = () => {
      if (!team.start_time) { setDisplay('Not started'); return; }
      if (team.end_time) {
        const total = differenceInSeconds(parseISO(team.end_time), parseISO(team.start_time));
        const grand = total + (team.penalty_minutes || 0) * 60;
        setDisplay(`${Math.floor(grand / 60)}m ${grand % 60 < 10 ? '0' : ''}${grand % 60}s — DONE`);
        return;
      }
      const elapsed = differenceInSeconds(new Date(), parseISO(team.start_time));
      const remaining = timerDuration * 60 - elapsed - (team.penalty_minutes || 0) * 60;
      if (remaining <= 0) { setDisplay('EXPIRED'); setUrgent(true); return; }
      const m = Math.floor(remaining / 60); const s = remaining % 60;
      setUrgent(remaining < 300);
      setDisplay(`${m}m ${s < 10 ? '0' : ''}${s}s left`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [team, timerDuration]);
  return <span className={`font-mono text-lg font-bold ${urgent ? 'text-red-400 animate-pulse' : team.end_time ? 'text-green-400' : 'text-yellow-400'}`}>{display}</span>;
}

/* ───── Round 1 Spy ───── */
function R1SpyView({ team }: { team: Team }) {
  const p = team.state_payload as { score?: number; currentIndex?: number; total?: number; hasAnswered?: boolean; category?: string } | null;
  if (!p) return <SpyPlaceholder msg="Awaiting team — no data yet" />;
  return (
    <div className="space-y-4">
      <div className="glass rounded-xl border-blue-500/20 p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Progress</p>
        <div className="flex gap-6 flex-wrap">
          <Stat label="Current Q" val={`${(p.currentIndex ?? 0) + 1} / ${p.total ?? 5}`} />
          <Stat label="Score" val={`${p.score ?? 0} correct`} />
          <Stat label="Category" val={p.category ?? '—'} />
          <Stat label="Answered" val={p.hasAnswered ? '✅ Yes' : '⏳ Thinking...'} />
        </div>
      </div>
      <div className="glass rounded-xl border-blue-500/20 p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Correct Answer (Myth)</p>
        <div className="font-mono text-sm text-white bg-black/40 border border-white/10 rounded-lg px-4 py-3 leading-relaxed">
          {team.current_target || '—'}
        </div>
      </div>
    </div>
  );
}

/* ───── Round 2 Spy ───── */
function R2SpyView({ team }: { team: Team }) {
  const p = team.state_payload as {
    domain?: string; hintsRevealed?: number; totalHints?: number;
    history?: { guess: string; correct: boolean }[]; gameState?: string; attemptsUsed?: number;
  } | null;
  if (!p) return <SpyPlaceholder msg="Team hasn't picked a domain yet" />;
  return (
    <div className="space-y-4">
      <div className="glass rounded-xl border-purple-500/20 p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Status</p>
        <div className="flex gap-6 flex-wrap">
          <Stat label="Domain" val={p.domain ?? '—'} />
          <Stat label="Hints Shown" val={`${p.hintsRevealed ?? 0} / ${p.totalHints ?? '?'}`} />
          <Stat label="Attempts" val={`${p.attemptsUsed ?? 0} / 10`} />
          <Stat label="State" val={p.gameState === 'won' ? '🏆 Won' : p.gameState === 'lost' ? '💀 Lost' : '🔍 Active'} />
        </div>
      </div>

      <div className="glass rounded-xl border-purple-500/20 p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
          <ShieldAlert size={11} className="text-red-400" /> Answer (Target Character)
        </p>
        <div className="font-mono text-xl font-bold text-white tracking-widest">{team.current_target || '—'}</div>
      </div>

      {p.history && p.history.length > 0 && (
        <div className="glass rounded-xl border-purple-500/20 p-5">
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Guess History ({p.history.length})</p>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {p.history.map((h, i) => (
              <div key={i} className={`flex items-center justify-between px-3 py-1.5 rounded border text-sm font-mono ${h.correct ? 'bg-green-900/20 border-green-500/30 text-green-300' : 'bg-red-900/10 border-red-500/15 text-red-400/70'}`}>
                <span className="uppercase">{h.guess}</span>
                {h.correct ? <CheckCircle2 size={12} className="text-green-400" /> : <XCircle size={12} className="text-red-400/60" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───── Round 3 Spy ───── */
function R3SpyView({ team }: { team: Team }) {
  const p = team.state_payload as { guesses?: WordleGuess[]; undos?: number; targetWord?: string } | null;
  const guesses = p?.guesses || [];
  const undos = p?.undos ?? 0;
  // Use the explicit targetWord from payload — more reliable than current_target which gets overwritten on round change
  const bannedWord = p?.targetWord ?? team.current_target ?? '';
  const constraints = getConstraints(guesses);
  const recommended = VALID_WORDS.filter(w => isValidWord(w, constraints) && w.toUpperCase() !== bannedWord.toUpperCase()).slice(0, 60);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Wordle grid */}
      <div className="glass rounded-xl border-cyan-500/20 p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Live Wordle Board</p>
        <div className="flex justify-between text-xs font-mono text-gray-500 mb-4">
          <span>Survivals: <span className="text-white">{guesses.length}/6</span></span>
          <span>Undos: <span className="text-yellow-400">{undos}</span></span>
        </div>
        <div className="flex flex-col gap-2">
          {!guesses.length && <div className="text-gray-600 text-sm font-mono text-center py-8 opacity-60">Waiting for first guess...</div>}
          {guesses.map((g, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-1.5 justify-center">
              {g.word.split('').map((char, j) => {
                const s = g.statuses[j];
                let bg = 'bg-gray-800 border-gray-700 text-gray-400';
                if (s === 'correct') bg = 'bg-green-600 border-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.4)]';
                if (s === 'present') bg = 'bg-yellow-600 border-yellow-500 text-white';
                return <div key={j} className={`w-10 h-11 flex items-center justify-center font-bold text-base uppercase border-2 rounded ${bg}`}>{char}</div>;
              })}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Solver */}
      <div className="glass rounded-xl border-green-500/20 p-5 flex flex-col">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1.5">
          <BrainCircuit size={11} /> AI Solver
        </p>
        <p className="text-[11px] text-gray-600 font-mono mb-4">Safe words to shout at the team — none of these are the lethal target.</p>
        <div className="bg-black/40 rounded-lg border border-green-500/10 p-3 flex-grow overflow-y-auto min-h-[180px]">
          {recommended.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-600 text-xs font-mono">Processing constraints...</div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {recommended.map((w, i) => (
                <motion.span key={w} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.008 }}
                  className="px-2 py-0.5 bg-green-900/20 border border-green-500/25 text-green-300 font-mono uppercase rounded text-xs hover:bg-green-600/30 transition-colors">
                  {w}
                </motion.span>
              ))}
            </div>
          )}
        </div>
        <div className="mt-2 text-[10px] text-gray-600 font-mono flex justify-between">
          <span>{recommended.length} safe options</span>
          <span className="text-green-600 animate-pulse">● live</span>
        </div>
      </div>
    </div>
  );
}

/* ───── Round 4 Spy ───── */
const MORSE_SPY: { [k: string]: string } = {
  A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.',
  H:'....', I:'..', J:'.---', K:'-.-', L:'.-..', M:'--', N:'-.',
  O:'---', P:'.--.', Q:'--.-', R:'.-.', S:'...', T:'-', U:'..-',
  V:'...-', W:'.--', X:'-..-', Y:'-.--', Z:'--..',
};
function buildSpyFragments(word: string) {
  const w = word.toUpperCase();
  if (w.length < 5) return null;
  const morse = [w[0], w[1]].map(c => MORSE_SPY[c] ?? '?').join(' ');
  const ascii = [w[2], w[3]].map(c => c.charCodeAt(0)).join(' ');
  const caesar = String.fromCharCode(((w.charCodeAt(4) - 65 + 3) % 26) + 65);
  return { morse, ascii, caesar };
}
function R4SpyView({ team }: { team: Team }) {
  const answer = team.current_target || '';
  const frags = answer ? buildSpyFragments(answer) : null;
  return (
    <div className="space-y-4">
      <div className="glass rounded-xl border-orange-500/20 p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Round Overview</p>
        <p className="text-sm text-gray-400 font-mono leading-relaxed">
          Team is decoding three cipher fragments using the Decoder Toolbox (Morse, ASCII, Caesar +3).
          They must concatenate the decoded parts to get the master password.
        </p>
      </div>

      <div className="glass rounded-xl border-orange-500/20 p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
          <ShieldAlert size={11} className="text-red-400" /> Answer (Master Password)
        </p>
        <div className="font-mono text-3xl font-bold text-orange-300 tracking-[0.4em] py-2 text-center border border-orange-500/20 rounded-xl bg-orange-900/10">
          {answer || '—'}
        </div>
      </div>

      {frags && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass rounded-xl border-green-500/20 p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-green-500 mb-2">Fragment 1 · Morse</p>
            <p className="font-mono text-lg text-white tracking-widest break-all">{frags.morse}</p>
            <p className="text-[10px] text-gray-600 mt-1 font-mono">→ {answer[0]}{answer[1]}</p>
          </div>
          <div className="glass rounded-xl border-purple-500/20 p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-purple-500 mb-2">Fragment 2 · ASCII</p>
            <p className="font-mono text-lg text-white tracking-widest">{frags.ascii}</p>
            <p className="text-[10px] text-gray-600 mt-1 font-mono">→ {answer[2]}{answer[3]}</p>
          </div>
          <div className="glass rounded-xl border-yellow-500/20 p-4 text-center">
            <p className="text-[10px] uppercase tracking-widest text-yellow-500 mb-2">Fragment 3 · Caesar +3</p>
            <p className="font-mono text-lg text-white tracking-widest">{frags.caesar}</p>
            <p className="text-[10px] text-gray-600 mt-1 font-mono">→ {answer[4]}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───── Round 5 Spy ───── */
function R5SpyView({ team }: { team: Team }) {
  return (
    <div className="space-y-4">
      <div className="glass rounded-xl border-red-500/20 p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Final Round — Mainframe Override</p>
        <p className="text-sm text-gray-400 font-mono leading-relaxed">
          Team must enter the randomly generated escape code to stop the timer. The code was picked when they entered this round.
        </p>
      </div>
      <div className="glass rounded-xl border-red-500/20 p-5">
        <p className="text-xs uppercase tracking-widest text-gray-500 mb-2 flex items-center gap-2">
          <Rocket size={11} className="text-red-400" /> Escape Code (give this to the team!)
        </p>
        <div className="font-mono text-3xl font-bold text-red-300 tracking-[0.4em] py-2 border border-red-500/30 rounded-xl text-center bg-red-900/10">
          {team.current_target || '—'}
        </div>
        <p className="text-[10px] text-gray-500 mt-3 font-mono text-center">
          This was randomly selected from the Don't Wordle wordlist when the team entered Round 5.
        </p>
      </div>
      {team.end_time && (
        <div className="glass rounded-xl border-green-500/30 p-5 text-center">
          <p className="text-green-400 font-bold font-mono text-lg">🏆 ESCAPED</p>
        </div>
      )}
    </div>
  );
}

/* ───── Shared helpers ───── */
function Stat({ label, val }: { label: string; val: string | number }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-0.5">{label}</p>
      <p className="font-mono text-sm text-white">{val}</p>
    </div>
  );
}
function SpyPlaceholder({ msg }: { msg: string }) {
  return <div className="text-center py-12 text-gray-600 font-mono text-sm opacity-60">{msg}</div>;
}

/* ───── Main Page ───── */
export default function AdminSpyMode({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [team, setTeam] = useState<Team | null>(null);
  const { timerDurationMinutes } = useGameStore();

  useEffect(() => {
    const fetchTeam = async () => {
      const { data } = await supabase.from('teams').select('*').eq('id', resolvedParams.id).single();
      if (data) setTeam(data);
    };
    fetchTeam();
    const ch = supabase
      .channel('spy-' + resolvedParams.id)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams', filter: `id=eq.${resolvedParams.id}` }, p => setTeam(p.new as Team))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [resolvedParams.id]);

  if (!team) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-cyan-400 font-mono gap-4">
        <Zap size={32} className="animate-pulse" />
        <p className="text-sm uppercase tracking-widest animate-pulse">Establishing secure link...</p>
      </div>
    );
  }

  const adjustPenalty = async (delta: number) => {
    await supabase.from('teams').update({ penalty_minutes: Math.max(0, (team.penalty_minutes || 0) + delta) }).eq('id', team.id);
  };
  const resetHints = async () => {
    await supabase.from('teams').update({ hints_used: 0, round_hints_used: 0 }).eq('id', team.id);
  };
  const resetUndos = async () => {
    const payload = { ...(team.state_payload || {}), undos: 3 };
    await supabase.from('teams').update({ state_payload: payload }).eq('id', team.id);
  };
  const resetWordle = async () => {
    const cipherWord = team.cipher_word?.toUpperCase() ?? '';
    const pool = VALID_WORDS.filter(w => w.toUpperCase() !== cipherWord);
    const newWord = pool[Math.floor(Math.random() * pool.length)].toUpperCase();
    const payload = { guesses: [], undos: 3, targetWord: newWord };
    await supabase.from('teams').update({
      state_payload: payload,
      current_target: newWord,
      round_hints_used: 0
    }).eq('id', team.id);
  };
  const skipRound = async () => {
    if (team.current_round >= 5) return;
    await supabase.from('teams').update({ current_round: team.current_round + 1, keys_unlocked: Math.max(team.keys_unlocked, team.current_round) }).eq('id', team.id);
  };

  const meta = ROUND_META[team.current_round] ?? ROUND_META[1];
  const RoundIcon = meta.icon;

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto mt-6 pb-16 px-4 relative z-50 gap-6">
      {/* Back */}
      <Link href="/admin" className="flex items-center gap-2 text-cyan-500 hover:text-cyan-300 font-mono text-xs uppercase tracking-widest transition-colors w-fit bg-cyan-900/20 px-4 py-2 rounded-full border border-cyan-500/30">
        <ArrowLeft size={13} /> Back to Command Center
      </Link>

      {/* Team header */}
      <div className="glass rounded-2xl border-white/10 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${meta.color}`}>
              <RoundIcon size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-mono tracking-widest text-white uppercase">{team.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono text-gray-400">
                <span className="flex items-center gap-1"><ShieldAlert size={11} className="text-cyan-400" /> Code: <span className="text-gray-300 ml-1">{team.access_code}</span></span>
                <span className="border-l border-gray-700 pl-3 flex items-center gap-1"><Key size={11} className="text-yellow-400" /> Keys: {team.keys_unlocked}/5</span>
                <span className="border-l border-gray-700 pl-3 flex items-center gap-1"><Eye size={11} className="text-gray-500" /> Hints: {team.hints_used ?? 0}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 justify-center">
            {team.end_time
              ? <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-500/20 text-green-400 border border-green-500/40 w-fit">🏆 Escaped!</span>
              : <span className={`px-3 py-1 rounded-full text-sm font-bold border w-fit ${meta.color}`}>Round {team.current_round} · {meta.label}</span>
            }
            <div className="mt-1">
              <LiveTimerDisplay team={team} timerDuration={timerDurationMinutes} />
              {(team.penalty_minutes || 0) > 0 && <p className="text-xs text-red-400 font-mono mt-0.5">+{team.penalty_minutes}m penalty</p>}
            </div>
          </div>
        </div>

        {/* Answer Bar: Show both Master and Round targets */}
        <div className="bg-black/40 border-t border-white/10 divide-y divide-white/5">
          {/* Master */}
          <div className="px-6 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={13} className="text-cyan-400" />
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Master Answer</span>
            </div>
            <span className="font-mono text-sm text-cyan-200/80 bg-cyan-900/20 border border-cyan-500/20 px-3 py-0.5 rounded-lg tracking-widest">
              {team.cipher_word || '—'}
            </span>
          </div>

          {/* Round-specific (prefer state_payload for R3 Wordle) */}
          {team.current_target && (
            <div className="px-6 py-2.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={13} className="text-red-400" />
                <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                  {team.current_round === 3 ? 'R3: Lethal Word' : 
                   team.current_round === 2 ? 'R2: Target Char' :
                   team.current_round === 4 ? 'R4: Password' :
                   team.current_round === 5 ? 'R5: Escape Code' : 'Round Target'}
                </span>
              </div>
              <span className="font-mono text-sm text-red-200/80 bg-red-900/20 border border-red-500/20 px-3 py-0.5 rounded-lg tracking-widest">
                {team.current_round === 3 ? (team.state_payload?.targetWord || team.current_target) : team.current_target}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick controls */}
      <div className="glass rounded-2xl border-white/10 p-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2"><Zap size={12} className="text-yellow-400" /> Quick Controls</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => adjustPenalty(-1)} className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-sm font-bold transition-colors"><Minus size={13} /> -1m Penalty</button>
          <button onClick={() => adjustPenalty(3)} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold transition-colors"><Plus size={13} /> +3m Penalty</button>
          <button onClick={resetHints} className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 rounded-xl text-sm font-bold transition-colors"><RotateCcw size={13} /> Reset Hints</button>
          {team.current_round === 3 && (
            <>
              <button onClick={resetUndos} className="flex items-center gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-sm font-bold transition-colors"><RefreshCw size={13} /> Reset Undos</button>
              <button onClick={() => { if(confirm('Reset Wordle?')) resetWordle(); }} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold transition-colors"><RotateCcw size={13} /> Reset Word</button>
            </>
          )}
          {!team.end_time && team.current_round < 5 && (
            <button onClick={skipRound} className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-400 rounded-xl text-sm font-bold transition-colors"><SkipForward size={13} /> Skip → Round {team.current_round + 1}</button>
          )}
        </div>
      </div>

      {/* Round-specific spy panel */}
      <div className="glass rounded-2xl border-white/10 p-6">
        <h2 className="text-sm font-bold font-mono tracking-widest mb-5 flex items-center gap-2" style={{ color: 'inherit' }}>
          <RoundIcon size={15} className={meta.color.split(' ')[0]} />
          <span className={meta.color.split(' ')[0]}>Round {team.current_round}: {meta.label} — Spy Feed</span>
        </h2>
        {team.current_round === 1 && <R1SpyView team={team} />}
        {team.current_round === 2 && <R2SpyView team={team} />}
        {team.current_round === 3 && <R3SpyView team={team} />}
        {team.current_round === 4 && <R4SpyView team={team} />}
        {team.current_round === 5 && <R5SpyView team={team} />}
      </div>
    </div>
  );
}
