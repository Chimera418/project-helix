'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Users, Trophy, Timer, Key, SkipForward,
  Minus, Plus, RotateCcw, Eye, LogOut, RefreshCw,
  Zap, AlertTriangle, CheckCircle2, Clock, X, Trash2
} from 'lucide-react';
import { useGameStore } from '@/lib/store';
import Link from 'next/link';
import { parseISO, differenceInSeconds } from 'date-fns';
import { Team, supabase } from '@/lib/supabase';
import { VALID_WORDS } from '@/data/words';

const ROUND_NAMES: Record<number, { label: string; emoji: string; color: string }> = {
  1: { label: 'Signal Breach',     emoji: '📡', color: 'from-blue-500/20 to-blue-900/10 border-blue-500/30 text-blue-400' },
  2: { label: 'Threat Intel',      emoji: '🕵️', color: 'from-purple-500/20 to-purple-900/10 border-purple-500/30 text-purple-400' },
  3: { label: 'Zero-Day Exploit',  emoji: '☠️', color: 'from-cyan-500/20 to-cyan-900/10 border-cyan-500/30 text-cyan-400' },
  4: { label: 'Crypto Bypass',     emoji: '🔐', color: 'from-orange-500/20 to-orange-900/10 border-orange-500/30 text-orange-400' },
  5: { label: 'Mainframe Override',emoji: '🚀', color: 'from-red-500/20 to-red-900/10 border-red-500/30 text-red-400' },
};

function LiveTimer({ team, timerDuration }: { team: Team; timerDuration: number }) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    const update = () => {
      if (!team.start_time) { setDisplay('Not started'); return; }
      if (team.end_time) {
        const total = differenceInSeconds(parseISO(team.end_time), parseISO(team.start_time));
        const penalty = (team.penalty_minutes || 0) * 60;
        const grand = total + penalty;
        const m = Math.floor(grand / 60);
        const s = grand % 60;
        setDisplay(`✅ ${m}m ${s < 10 ? '0' + s : s}s`);
        return;
      }
      const elapsed = differenceInSeconds(new Date(), parseISO(team.start_time));
      const remaining = timerDuration * 60 - elapsed - (team.penalty_minutes || 0) * 60;
      if (remaining <= 0) { setDisplay('🔴 EXPIRED'); return; }
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      const urgent = remaining < 300;
      setDisplay(`${urgent ? '⚠️' : '⏱'} ${m}m ${s < 10 ? '0' + s : s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [team, timerDuration]);

  return <span className="font-mono text-sm">{display}</span>;
}

// ─── Edit Timing Modal ───────────────────────────────────────────────────────
function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  // datetime-local needs 'YYYY-MM-DDTHH:mm'
  return iso.slice(0, 16);
}
function fromLocalInput(val: string): string {
  // Convert local datetime-local value back to ISO string (treat as local time)
  return val ? new Date(val).toISOString() : '';
}

function EditTimingModal({ team, onClose }: { team: Team; onClose: () => void }) {
  const [startVal, setStartVal] = useState(toLocalInput(team.start_time));
  const [endVal, setEndVal] = useState(toLocalInput(team.end_time));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const patch: Partial<Team> = {
      start_time: startVal ? fromLocalInput(startVal) : null,
      end_time: endVal ? fromLocalInput(endVal) : null,
    };
    await supabase.from('teams').update(patch).eq('id', team.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const handleClearEnd = async () => {
    setSaving(true);
    await supabase.from('teams').update({ end_time: null }).eq('id', team.id);
    setSaving(false);
    setEndVal('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={e => e.stopPropagation()}
        className="relative glass rounded-2xl border border-orange-500/30 w-full max-w-md p-6 shadow-[0_0_60px_rgba(251,146,60,0.15)]"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-orange-400" />
            <h3 className="font-mono font-bold text-orange-400 uppercase tracking-widest text-sm">Adjust Timing</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={16} /></button>
        </div>
        <p className="text-xs font-mono text-gray-500 mb-5 uppercase tracking-widest">{team.name}</p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-1">Start Time</label>
            <input
              type="datetime-local"
              value={startVal}
              onChange={e => setStartVal(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-1">End Time (leave blank if still active)</label>
            <input
              type="datetime-local"
              value={endVal}
              onChange={e => setEndVal(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/40 text-orange-400 font-bold py-2 rounded-lg text-sm uppercase tracking-widest transition-colors disabled:opacity-50"
          >
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save'}
          </button>
          {team.end_time && (
            <button
              onClick={handleClearEnd}
              disabled={saving}
              className="px-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-2 rounded-lg text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
              title="Mark team as still active (removes end_time)"
            >
              Reopen
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

function TeamCard({
  t,
  timerDuration,
  onAdjustPenalty,
  onResetHints,
  onSkip,
  onDelete,
}: {
  t: Team;
  timerDuration: number;
  onAdjustPenalty: (id: string, cur: number, delta: number) => void;
  onResetHints: (id: string) => void;
  onSkip: (t: Team) => void;
  onDelete: (id: string) => void;
  onResetUndos: (id: string, current: Team) => void;
  onResetWordle: (id: string, current: Team) => void;
}) {
  const [custom, setCustom] = useState('');
  const [showTimingModal, setShowTimingModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEscaped = !!t.end_time;
  const roundInfo = ROUND_NAMES[t.current_round] ?? ROUND_NAMES[1];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl border bg-gradient-to-br overflow-hidden ${
        isEscaped
          ? 'from-green-500/10 to-green-900/5 border-green-500/30'
          : roundInfo.color
      }`}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{isEscaped ? '🏆' : roundInfo.emoji}</span>
            <h2 className="text-lg font-bold font-mono tracking-widest text-white truncate uppercase">
              {t.name}
            </h2>
          </div>
          <p className="text-xs font-mono text-gray-500 tracking-widest">Code: {t.access_code}</p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <div className="flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded-lg border border-red-500/30">
                <button
                  onClick={() => onDelete(t.id)}
                  className="text-[10px] font-bold text-red-400 uppercase tracking-widest hover:text-red-300"
                >
                  Confirm
                </button>
                <button onClick={() => setConfirmDelete(false)} className="text-gray-500 hover:text-gray-300">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Delete Team"
              >
                <Trash2 size={14} />
              </button>
            )}
            
            {isEscaped ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/40 flex items-center gap-1">
                <CheckCircle2 size={10} /> Escaped
              </span>
            ) : (
              <span className={`px-3 py-1 rounded-full text-xs font-bold border bg-black/30 ${roundInfo.color} flex items-center gap-1`}>
                Round {t.current_round}
              </span>
            )}
          </div>
          <span className={`text-xs font-mono mt-1 ${t.penalty_minutes > 0 ? 'text-red-400' : t.penalty_minutes < 0 ? 'text-green-400' : 'text-gray-600'}`}>
            {t.penalty_minutes > 0 ? `+${t.penalty_minutes}m penalty` : t.penalty_minutes < 0 ? `${t.penalty_minutes}m bonus` : 'No penalty/bonus'}
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-5 py-3 bg-black/20 flex flex-wrap items-center gap-3 text-xs font-mono text-gray-400 border-y border-white/5">
        {/* Timer */}
        <div className="flex items-center gap-1.5">
          <Timer size={12} className="text-yellow-400" />
          <LiveTimer team={t} timerDuration={timerDuration} />
        </div>
        {/* Keys */}
        <div className="flex items-center gap-1 ml-2">
          {Array(5).fill(0).map((_, i) => (
            <Key key={i} size={11} className={i < t.keys_unlocked ? 'text-yellow-400' : 'text-gray-700'} />
          ))}
          <span className="ml-1 text-gray-500">{t.keys_unlocked}/5</span>
        </div>
        {/* Hints */}
        <span className="ml-auto text-gray-600">
          {t.hints_used ?? 0} hints used
        </span>
      </div>

      {/* Answers Display */}
      <div className="bg-black/30 border-b border-white/5 divide-y divide-white/5">
        {/* Master Answer (Always visible) */}
        <div className="px-5 py-2 flex items-center justify-between gap-3">
          <span className="text-[9px] uppercase tracking-widest text-cyan-500/60 font-bold">Master Answer</span>
          <span className="font-mono text-xs text-cyan-200/80 bg-cyan-900/10 px-2.5 py-0.5 rounded border border-cyan-500/10 truncate max-w-[60%]" title="This is the final cipher word for the team">
            {t.cipher_word || '—'}
          </span>
        </div>

        {/* Current Round Target */}
        {t.current_target && (
          <div className="px-5 py-2 flex items-center justify-between gap-3 bg-red-500/5">
            <span className="text-[9px] uppercase tracking-widest text-red-400/60 font-bold">
              {t.current_round === 3 ? 'R3: Lethal Word' : 
               t.current_round === 2 ? 'R2: Target Char' : 
               t.current_round === 4 ? 'R4: Password' : 
               t.current_round === 5 ? 'R5: Escape Code' : 'Round Target'}
            </span>
            <span className="font-mono text-xs text-red-200/80 bg-red-900/10 px-2.5 py-0.5 rounded border border-red-500/10 truncate max-w-[60%]" title="The specific goal for the current round">
              {t.current_target}
            </span>
          </div>
        )}
      </div>

      {/* Round description */}
      {!isEscaped && (
        <div className="px-5 py-2 bg-black/10">
          <p className="text-[11px] text-gray-500 font-mono">
            {roundInfo.emoji} <span className="text-gray-400">{roundInfo.label}</span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-4 flex flex-col gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Time Adjustments (Add/Remove from clock)</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onAdjustPenalty(t.id, t.penalty_minutes, -5)}
              className="px-2 py-1.5 bg-green-500/10 hover:bg-green-500/25 border border-green-500/30 text-green-400 rounded-lg text-[10px] font-bold transition-colors"
              title="Add 5 mins to clock"
            >
              +5m
            </button>
            <button
              onClick={() => onAdjustPenalty(t.id, t.penalty_minutes, -1)}
              className="px-2 py-1.5 bg-green-500/10 hover:bg-green-500/25 border border-green-500/30 text-green-400 rounded-lg text-[10px] font-bold transition-colors"
              title="Add 1 min to clock"
            >
              +1m
            </button>
            <button
              onClick={() => onAdjustPenalty(t.id, t.penalty_minutes, 1)}
              className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 rounded-lg text-[10px] font-bold transition-colors"
              title="Penalty: -1 min from clock"
            >
              -1m
            </button>
            <button
              onClick={() => onAdjustPenalty(t.id, t.penalty_minutes, 5)}
              className="px-2 py-1.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 rounded-lg text-[10px] font-bold transition-colors"
              title="Penalty: -5 mins from clock"
            >
              -5m
            </button>
            <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1 h-[32px]">
              <input
                type="number"
                placeholder="±min"
                value={custom}
                onChange={e => setCustom(e.target.value)}
                className="w-12 bg-transparent text-xs text-white text-center focus:outline-none font-mono"
              />
              <button
                onClick={() => {
                  const val = parseInt(custom, 10);
                  if (!isNaN(val) && val !== 0) {
                    // Logic: User wants to "Add Time", so we subtract from penalty
                    // But usually in admin inputs, + means penalty and - means subtract.
                    // Let's stick to Delta: positive = penalty, negative = bonus
                    onAdjustPenalty(t.id, t.penalty_minutes, val);
                    setCustom('');
                  }
                }}
                className="px-2 py-0.5 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 rounded text-[10px] font-bold transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Admin actions */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-white/5">
          <Link
            href={`/admin/${t.id}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 rounded-lg text-xs font-bold transition-colors"
          >
            <Eye size={11} /> Spy View
          </Link>
          <button
            onClick={() => onResetHints(t.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/25 border border-yellow-500/30 text-yellow-400 rounded-lg text-xs font-bold transition-colors"
            title="Reset hint usage for this team"
          >
            <RotateCcw size={11} /> Reset Hints
          </button>
          
          {/* Reset Undos (Only relevant for Round 3) */}
          {t.current_round === 3 && (
            <>
              <button
                onClick={() => onResetUndos(t.id, t)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/25 border border-green-500/30 text-green-400 rounded-lg text-xs font-bold transition-colors"
                title="Give team 3 undos back"
              >
                <RefreshCw size={11} /> Reset Undos
              </button>
              <button
                onClick={() => {
                  if (confirm('Reset Wordle? This clears ALL guesses and picks a new word.')) {
                    onResetWordle(t.id, t);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold transition-colors"
                title="Pick a new word and clear board"
              >
                <RotateCcw size={11} /> Reset Word
              </button>
            </>
          )}
          {!isEscaped && t.current_round < 5 && (
            <button
              onClick={() => onSkip(t)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-bold transition-colors"
              title="Force-advance this team to the next round"
            >
              <SkipForward size={11} /> Skip Round
            </button>
          )}
          {/* ── Timing Adjustment (always visible) ── */}
          <button
            onClick={() => setShowTimingModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 rounded-lg text-xs font-bold transition-colors"
            title="Adjust start/end times"
          >
            <Clock size={11} /> Adjust Time
          </button>
        </div>
      </div>

      {/* Timing Modal */}
      <AnimatePresence>
        {showTimingModal && (
          <EditTimingModal team={t} onClose={() => setShowTimingModal(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { timerDurationMinutes } = useGameStore();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchTeams = async () => {
      const { data } = await supabase.from('teams').select('*').order('start_time', { ascending: false });
      if (data) setTeams(data);
    };
    fetchTeams();
    const channel = supabase
      .channel('admin-teams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, (payload) => {
        if (payload.eventType === 'INSERT') setTeams(p => [payload.new as Team, ...p]);
        else if (payload.eventType === 'UPDATE') setTeams(p => p.map(t => t.id === payload.new.id ? payload.new as Team : t));
        else if (payload.eventType === 'DELETE') setTeams(p => p.filter(t => t.id !== (payload.old as Team)?.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated]);

  const manualRefresh = async () => {
    setRefreshing(true);
    const { data } = await supabase.from('teams').select('*').order('start_time', { ascending: false });
    if (data) setTeams(data);
    setTimeout(() => setRefreshing(false), 800);
  };

  const adjustPenalty = async (id: string, cur: number, delta: number) => {
    // Delta strategy: positive adds penalty (removes time), negative adds bonus (adds time)
    // We remove the Math.max(0) to allow total bonus time beyond duration
    await supabase.from('teams').update({ penalty_minutes: cur + delta }).eq('id', id);
  };
  const deleteTeam = async (id: string) => {
    await supabase.from('teams').delete().eq('id', id);
  };
  const resetHints = async (id: string) => {
    await supabase.from('teams').update({ hints_used: 0, round_hints_used: 0 }).eq('id', id);
  };
  const resetUndos = async (id: string, t: Team) => {
    const payload = { ...(t.state_payload || {}), undos: 3 };
    await supabase.from('teams').update({ state_payload: payload }).eq('id', id);
  };
  const resetWordle = async (id: string, t: Team) => {
    const cipherWord = t.cipher_word?.toUpperCase() ?? '';
    const pool = VALID_WORDS.filter(w => w.toUpperCase() !== cipherWord);
    const newWord = pool[Math.floor(Math.random() * pool.length)].toUpperCase();
    const payload = { guesses: [], undos: 3, targetWord: newWord };
    await supabase.from('teams').update({
      state_payload: payload,
      current_target: newWord,
      round_hints_used: 0
    }).eq('id', id);
  };
  const skipRound = async (t: Team) => {
    if (t.current_round >= 5) return;
    await supabase.from('teams').update({ current_round: t.current_round + 1, keys_unlocked: Math.max(t.keys_unlocked, t.current_round) }).eq('id', t.id);
  };

  const logout = () => {
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') localStorage.removeItem('adminAuth');
  };

  /* ── Login Screen ── */
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-sm mx-auto px-4">
        <form
          onSubmit={e => {
            e.preventDefault();
            if (password === 'admin123') {
              setIsAuthenticated(true);
              localStorage.setItem('adminAuth', 'true');
            } else {
              setAuthError('Invalid credentials.');
            }
          }}
          className="glass p-8 rounded-2xl w-full border-red-500/20 shadow-[0_0_60px_rgba(255,0,0,0.08)] flex flex-col gap-4"
        >
          <div className="flex justify-center text-red-500 mb-2">
            <ShieldAlert size={48} />
          </div>
          <h1 className="text-center text-xl font-bold font-mono tracking-widest text-red-400 uppercase">Admin Override</h1>
          <input
            autoFocus
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setAuthError(''); }}
            className="w-full bg-black/50 border border-red-500/30 rounded-lg p-3 text-center text-white focus:outline-none focus:border-red-400 transition-colors font-mono"
            placeholder="PASSWORD"
          />
          <AnimatePresence>
            {authError && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-xs font-mono text-center flex items-center justify-center gap-2">
                <AlertTriangle size={12} /> {authError}
              </motion.div>
            )}
          </AnimatePresence>
          <button type="submit" className="w-full bg-red-600/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 font-bold py-3 rounded-lg uppercase tracking-widest transition-colors font-mono hover:text-red-300">
            Authenticate
          </button>
        </form>
      </div>
    );
  }

  /* ── Dashboard ── */
  const active = teams.filter(t => !t.end_time);
  const escaped = teams.filter(t => t.end_time);

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto mt-6 pb-16 px-4 relative z-50">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-widest neon-text-cyan flex items-center gap-3">
            <Zap className="text-cyan-400" size={24} /> PROJECT HELIX — COMMAND CENTER
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Live operator view · All teams</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/leaderboard"
            className="flex items-center gap-2 px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-lg text-yellow-400 text-xs font-mono transition-colors"
          >
            <Trophy size={13} /> Leaderboard
          </Link>
          <button
            onClick={manualRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 text-xs font-mono transition-colors"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono transition-colors"
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: <Users size={20} className="text-cyan-400" />, label: 'Total Teams',    val: teams.length,    color: 'border-cyan-500/20' },
          { icon: <Timer size={20} className="text-yellow-400" />, label: 'Active',       val: active.length,   color: 'border-yellow-500/20' },
          { icon: <Trophy size={20} className="text-green-400" />, label: 'Escaped',      val: escaped.length,  color: 'border-green-500/20' },
          {
            icon: <AlertTriangle size={20} className="text-red-400" />,
            label: 'Avg Penalty',
            val: teams.length ? Math.round(teams.reduce((s, t) => s + (t.penalty_minutes || 0), 0) / teams.length) + 'm' : '0m',
            color: 'border-red-500/20',
          },
        ].map(s => (
          <div key={s.label} className={`glass rounded-xl border ${s.color} p-4 flex items-center gap-3`}>
            {s.icon}
            <div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500">{s.label}</div>
              <div className="text-xl font-bold text-white font-mono">{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Active teams */}
      {active.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-4 flex items-center gap-2">
            <Timer size={12} /> Active Teams ({active.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {active.map(t => (
              <TeamCard
                key={t.id}
                t={t}
                timerDuration={timerDurationMinutes}
                onAdjustPenalty={adjustPenalty}
                onResetHints={resetHints}
                onSkip={skipRound}
                onDelete={deleteTeam}
                onResetUndos={resetUndos}
                onResetWordle={resetWordle}
              />
            ))}
          </div>
        </section>
      )}

      {/* Escaped teams */}
      {escaped.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-green-400 mb-4 flex items-center gap-2">
            <Trophy size={12} /> Escaped Teams ({escaped.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {escaped.map(t => (
              <TeamCard
                key={t.id}
                t={t}
                timerDuration={timerDurationMinutes}
                onAdjustPenalty={adjustPenalty}
                onResetHints={resetHints}
                onSkip={skipRound}
                onDelete={deleteTeam}
                onResetUndos={resetUndos}
                onResetWordle={resetWordle}
              />
            ))}
          </div>
        </section>
      )}

      {teams.length === 0 && (
        <div className="glass rounded-2xl border-white/5 p-20 text-center text-gray-500 font-mono">
          <Users size={48} className="mx-auto mb-4 opacity-20" />
          <p className="uppercase tracking-widest text-sm">No teams registered yet.</p>
          <p className="text-xs mt-2">Teams appear here as soon as they log in.</p>
        </div>
      )}

      {/* Mini leaderboard widget */}
      {(() => {
        const calcSecs = (t: Team) => {
          if (!t.start_time || !t.end_time) return null;
          return differenceInSeconds(parseISO(t.end_time), parseISO(t.start_time)) + (t.penalty_minutes || 0) * 60;
        };
        const top5 = [...teams]
          .filter(t => t.end_time)
          .sort((a, b) => (calcSecs(a) ?? 9999) - (calcSecs(b) ?? 9999))
          .slice(0, 5);
        if (top5.length === 0) return null;
        const fmt = (s: number) => `${Math.floor(s / 60)}m ${s % 60 < 10 ? '0' : ''}${s % 60}s`;
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        return (
          <section className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-yellow-400 flex items-center gap-2">
                <Trophy size={12} /> Top Escapees
              </h2>
              <Link href="/admin/leaderboard" className="text-[10px] font-mono text-gray-500 hover:text-cyan-400 uppercase tracking-widest transition-colors">
                View Full Leaderboard →
              </Link>
            </div>
            <div className="glass rounded-2xl border-yellow-500/20 overflow-hidden">
              <div className="divide-y divide-white/5">
                {top5.map((t, i) => {
                  const secs = calcSecs(t);
                  return (
                    <div key={t.id} className={`flex items-center gap-4 px-5 py-3 ${i === 0 ? 'bg-yellow-500/5' : ''}`}>
                      <span className="text-xl w-7 text-center shrink-0">{medals[i]}</span>
                      <span className="flex-1 font-mono font-bold uppercase text-sm tracking-widest text-white truncate">{t.name}</span>
                      <span className={`font-mono text-sm font-bold shrink-0 ${i === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>{secs != null ? fmt(secs) : '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}
    </div>
  );
}
