'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import HintButton from '@/components/ui/HintButton';
import { LockKeyhole, SearchCode, ChevronDown, ChevronUp, BookOpen, Binary, Shuffle } from 'lucide-react';
import { VALID_WORDS } from '@/data/words';

// ─── Morse Reference ──────────────────────────────────────────────────────────
const MORSE_TABLE: { [k: string]: string } = {
  A:'.-', B:'-...', C:'-.-.', D:'-..', E:'.', F:'..-.', G:'--.',
  H:'....', I:'..', J:'.---', K:'-.-', L:'.-..', M:'--', N:'-.',
  O:'---', P:'.--.', Q:'--.-', R:'.-.', S:'...', T:'-', U:'..-',
  V:'...-', W:'.--', X:'-..-', Y:'-.--', Z:'--..',
};

const ASCII_TABLE: { code: number; char: string }[] = [
  ...Array.from({ length: 26 }, (_, i) => ({ code: 65 + i, char: String.fromCharCode(65 + i) })),
  ...Array.from({ length: 10 }, (_, i) => ({ code: 48 + i, char: String.fromCharCode(48 + i) })),
  { code: 32, char: 'SPACE' }, { code: 33, char: '!' }, { code: 63, char: '?' }, { code: 64, char: '@' },
];

// ─── Cipher generation from a 5-letter word ───────────────────────────────────
// Fragment 1: first 2 letters → Morse
// Fragment 2: next 2 letters → ASCII decimal
// Fragment 3: last letter → Caesar +3 (encode: shift forward by 3)
function buildFragments(word: string) {
  const w = word.toUpperCase();
  const morse = [w[0], w[1]].map(c => MORSE_TABLE[c] ?? '?').join(' ');
  const ascii = [w[2], w[3]].map(c => c.charCodeAt(0)).join(' ');
  const caesar = String.fromCharCode(((w.charCodeAt(4) - 65 + 3) % 26) + 65);
  return { morse, ascii, caesar, word: w };
}

// ─── Collapsible Panel ────────────────────────────────────────────────────────
function RefPanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl border-white/10 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-bold font-mono uppercase tracking-widest text-cyan-300 hover:bg-white/5 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="flex items-center gap-2">{icon} {title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Round4() {
  const router = useRouter();
  const { team, setTeam } = useGameStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [caesarShift, setCaesarShift] = useState(3);
  const [fragments, setFragments] = useState<{ morse: string; ascii: string; caesar: string; word: string } | null>(null);

  useEffect(() => {
    if (!team) { router.replace('/'); return; }

    // cipher_word is fixed per team — assigned at login, stored in Supabase
    const word = team.cipher_word?.toUpperCase();
    if (!word || word.length < 5) {
      // Fallback: teams created before this feature had no cipher_word — assign one now
      const pool = VALID_WORDS.filter(w => w.length === 5 && /^[A-Z]+$/i.test(w));
      const picked = pool[Math.floor(Math.random() * pool.length)].toUpperCase();
      setFragments(buildFragments(picked));
      setTeam({ ...team, current_round: 4, current_target: picked, cipher_word: picked });
      return;
    }

    setFragments(buildFragments(word));
    setTeam({ ...team, current_round: 4, current_target: word });
  }, []);

  if (!team || !fragments) return null;

  const { morse, ascii, caesar, word: answerWord } = fragments;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.trim().toUpperCase() === answerWord) {
      setTeam({ ...team, current_round: 5 });
      router.push('/round/5');
    } else {
      setError('INVALID PASSWORD. DECRYPTION FAILED. (+1 min penalty)');
      setTeam({ ...team, penalty_minutes: (team.penalty_minutes || 0) + 1 });
    }
  };

  // Dynamic hints based on generated fragments
  const roundHints = [
    `Fragment 1 (Morse): "${morse}" — Each cluster separated by a space is one letter. Use the Morse Decoder below.`,
    `Fragment 2 (ASCII): "${ascii}" — Each number is an ASCII decimal code. Look them up in the ASCII table below.`,
    `Fragment 3 (Caesar +3): "${caesar}" — The letter was shifted forward by 3. Shift it BACK by 3 to get the original. Combine all three fragments in order.`,
  ];

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const shiftedAlphabet = alphabet.split('').map(c =>
    alphabet[(alphabet.indexOf(c) - caesarShift + 26) % 26]
  ).join('');

  return (
    <div className="flex flex-col items-center w-full max-w-6xl mx-auto mt-8 relative pb-12">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-mono tracking-wider neon-text-cyan flex items-center gap-3">
            <SearchCode className="text-cyan-400" /> ROUND 4: CRYPTOGRAPHIC BYPASS
          </h1>
          <p className="text-gray-400 uppercase tracking-widest text-sm mt-1">Decode 3 fragments and combine them into the master password</p>
        </div>
        <HintButton hints={roundHints} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mb-8">
        {/* Left: Fragments */}
        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-bold uppercase tracking-widest text-cyan-500 border-b border-cyan-500/30 pb-2">Acquired Fragments</h2>

          {/* Fragment 1 – Morse */}
          <div className="glass p-6 rounded-2xl border-green-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-green-500/20 text-green-400 text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">Fragment 1 · Morse</div>
            <div className="text-3xl font-mono text-white tracking-[0.4em] mt-4 text-center break-all">{morse}</div>
            <p className="text-xs text-green-400/60 text-center mt-3 font-mono">Each group = one letter · Dots = short · Dashes = long</p>
          </div>

          {/* Fragment 2 – ASCII */}
          <div className="glass p-6 rounded-2xl border-purple-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500/20 text-purple-400 text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">Fragment 2 · ASCII</div>
            <div className="text-3xl font-mono text-white tracking-[0.3em] mt-4 text-center">{ascii}</div>
            <p className="text-xs text-purple-400/60 text-center mt-3 font-mono">Each number is an ASCII decimal code for one letter</p>
          </div>

          {/* Fragment 3 – Caesar */}
          <div className="glass p-6 rounded-2xl border-yellow-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-400 text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">Fragment 3 · Caesar</div>
            <div className="text-4xl font-mono text-white tracking-widest mt-4 text-center">
              {caesar} <span className="text-yellow-500/60 text-xl">(Shift +3)</span>
            </div>
            <p className="text-xs text-yellow-400/60 text-center mt-3 font-mono">The letter was shifted forward by 3 — shift it back to reveal the original</p>
          </div>
        </div>

        {/* Right: Terminal + Input */}
        <div className="flex flex-col gap-5">
          <div className="glass rounded-2xl border-cyan-500/20 p-8 flex flex-col pt-12 relative overflow-hidden flex-grow">
            <div className="absolute top-0 left-0 right-0 h-8 bg-black/60 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-[10px] font-mono text-gray-400 ml-4">tty_decrypter.exe</span>
            </div>
            <p className="font-mono text-sm text-gray-400 mb-6 leading-7">
              &gt; Analyzing fragments... 3 signatures detected.<br/>
              &gt; Signature 1: Telegraph Audio <span className="text-green-400">(Morse Code)</span><br/>
              &gt; Signature 2: ASCII Decimal Encoding <span className="text-purple-400">(Decimal → Character)</span><br/>
              &gt; Signature 3: Substitution Cipher <span className="text-yellow-400">(Caesar)</span><br/>
              &gt; Decode each fragment. Concatenate in order.<br/>
              &gt; <span className="text-cyan-400 animate-pulse">Awaiting master password input_</span>
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-auto">
              <label className="text-cyan-400 text-xs tracking-widest uppercase font-bold">Input Decrypted Master Password</label>
              <input
                type="text"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-black/80 border border-cyan-500/50 rounded-lg p-4 font-mono text-2xl text-white focus:outline-none focus:border-cyan-300 transition-colors uppercase tracking-widest text-center"
                placeholder="_____"
                maxLength={10}
              />
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-xs font-mono uppercase text-center animate-pulse">
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                type="submit"
                disabled={!password.trim()}
                className="w-full mt-2 bg-cyan-600/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 font-bold py-4 rounded-lg uppercase tracking-widest transition-all neon-text-cyan disabled:opacity-50 flex justify-center items-center gap-2"
              >
                <LockKeyhole size={20} /> Bypass Security
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ── Decoder Toolbox ─────────────────────────────────────────────────── */}
      <div className="w-full">
        <h2 className="text-base font-bold uppercase tracking-widest text-gray-400 border-b border-white/10 pb-2 mb-4 flex items-center gap-2">
          <BookOpen size={16} /> Decoder Toolbox — expand to use
        </h2>
        <div className="flex flex-col gap-3">

          {/* Morse */}
          <RefPanel title="Morse Code Reference" icon={<span className="text-green-400">·−</span>}>
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-9 gap-2">
              {Object.entries(MORSE_TABLE).map(([letter, code]) => (
                <div key={letter} className="bg-black/40 rounded-lg p-2 text-center border border-green-500/20">
                  <div className="text-white font-bold font-mono text-lg">{letter}</div>
                  <div className="text-green-400 font-mono text-xs tracking-widest">{code}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-900/20 border border-green-500/20 rounded-lg text-xs font-mono text-green-300 leading-6">
              <strong>HOW TO USE:</strong> Match each cluster (separated by spaces) to a letter above.<br/>
              Fragment 1 is: <span className="text-white">{morse}</span> — has {morse.split(' ').length} clusters (= {morse.split(' ').length} letters)
            </div>
          </RefPanel>

          {/* ASCII */}
          <RefPanel title="ASCII Decimal Code Table" icon={<Binary size={14} className="text-purple-400" />}>
            <p className="text-xs text-gray-400 font-mono mb-4 leading-6">Every character has a unique number. Find the number → read the letter:</p>
            <div className="grid grid-cols-5 sm:grid-cols-9 lg:grid-cols-13 gap-1.5">
              {ASCII_TABLE.map(({ code, char }) => (
                <div key={code} className="bg-black/40 rounded-lg p-2 text-center border border-purple-500/20">
                  <div className="text-purple-300 font-mono text-xs">{code}</div>
                  <div className="text-white font-bold font-mono text-base">{char}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-purple-900/20 border border-purple-500/20 rounded-lg text-xs font-mono text-purple-300 leading-6">
              <strong>HOW TO USE:</strong> Fragment 2 is <span className="text-white">{ascii}</span>.<br/>
              Find each number in the table above — each number maps to one letter.
            </div>
          </RefPanel>

          {/* Caesar */}
          <RefPanel title="Caesar Cipher Wheel" icon={<Shuffle size={14} className="text-yellow-400" />}>
            <div className="flex items-center gap-4 mb-4">
              <label className="text-xs font-mono text-gray-400 uppercase">Shift Amount:</label>
              <input
                type="range" min={1} max={25} value={caesarShift}
                onChange={e => setCaesarShift(Number(e.target.value))}
                className="flex-1 accent-yellow-400"
              />
              <span className="text-yellow-400 font-bold font-mono w-6 text-center">{caesarShift}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center font-mono text-xs border-collapse">
                <thead>
                  <tr>
                    <td className="text-gray-500 py-1 px-1 text-[10px] uppercase w-24">Encoded →</td>
                    {alphabet.split('').map(c => (
                      <td key={c} className="text-purple-300 font-bold py-1 px-1 border border-white/5">{c}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="text-gray-500 py-1 px-1 text-[10px] uppercase">Original ↓</td>
                    {shiftedAlphabet.split('').map((c, i) => (
                      <td key={i} className="text-yellow-300 font-bold py-1 px-1 border border-white/5">{c}</td>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
            <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/20 rounded-lg text-xs font-mono text-yellow-300 leading-6">
              <strong>HOW TO USE:</strong> Fragment 3 is <span className="text-white">{caesar}</span> with Shift +3.<br/>
              Find <span className="text-white">{caesar}</span> in the top row → the letter directly below is the decoded original.
            </div>
          </RefPanel>

        </div>
      </div>
    </div>
  );
}
