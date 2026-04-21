'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Timer, ArrowLeft, Trash2,
  RefreshCw, Crown, Zap, Users, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { parseISO, differenceInSeconds } from 'date-fns';
import { supabase, Team } from '@/lib/supabase';

const TIMER_MINUTES = 120; // keep in sync with store default

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

function calcFinalSeconds(t: Team): number | null {
  if (!t.start_time || !t.end_time) return null;
  const raw = differenceInSeconds(parseISO(t.end_time), parseISO(t.start_time));
  return raw + (t.penalty_minutes || 0) * 60;
}

function isExpired(t: Team): boolean {
  if (!t.start_time || t.end_time) return false;
  const elapsed = differenceInSeconds(new Date(), parseISO(t.start_time));
  const penaltySecs = (t.penalty_minutes || 0) * 60;
  return elapsed + penaltySecs >= TIMER_MINUTES * 60;
}

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export default function LeaderboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchTeams = async () => {
    setLoading(true);
    const { data } = await supabase.from('teams').select('*');
    if (data) setTeams(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeams();
    const ch = supabase
      .channel('lb-teams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => fetchTeams())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const escaped = teams
    .filter(t => t.end_time && calcFinalSeconds(t) !== null)
    .sort((a, b) => (calcFinalSeconds(a) ?? 9999) - (calcFinalSeconds(b) ?? 9999));

  const dnf = teams
    .filter(t => isExpired(t))
    .sort((a, b) => b.current_round - a.current_round || b.keys_unlocked - a.keys_unlocked);

  const active = teams
    .filter(t => !t.end_time && !isExpired(t))
    .sort((a, b) => b.current_round - a.current_round);

  const deleteTeam = async (id: string) => {
    setRemoving(id);
    setConfirmDelete(null);
    await supabase.from('teams').delete().eq('id', id);
    setRemoving(null);
  };

  const clearSection = async (list: Team[]) => {
    if (!confirm(`Permanently delete ${list.length} team record(s)?`)) return;
    for (const t of list) {
      await supabase.from('teams').delete().eq('id', t.id);
    }
  };

  // Two-step delete: click trash → confirmation appears inline
  const DeleteBtn = ({ id, label = 'Remove team' }: { id: string; label?: string }) =>
    confirmDelete === id ? (
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => deleteTeam(id)}
          disabled={removing === id}
          className="px-2 py-1 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded text-red-400 text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-40"
        >
          {removing === id ? '…' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirmDelete(null)}
          className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <XCircle size={14} />
        </button>
      </div>
    ) : (
      <button
        onClick={() => setConfirmDelete(id)}
        className="shrink-0 p-2 rounded-lg text-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        title={label}
      >
        <Trash2 size={14} />
      </button>
    );

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto mt-6 pb-16 px-4 relative z-50 gap-6">
      {/* Back */}
      <Link href="/admin" className="flex items-center gap-2 text-cyan-500 hover:text-cyan-300 font-mono text-xs uppercase tracking-widest transition-colors w-fit bg-cyan-900/20 px-4 py-2 rounded-full border border-cyan-500/30">
        <ArrowLeft size={13} /> Back to Command Center
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-widest neon-text-cyan flex items-center gap-3">
            <Trophy className="text-yellow-400" size={22} /> Escape Leaderboard
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">Ranked by total time including penalties</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTeams} className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 text-xs font-mono transition-colors">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          {(escaped.length > 0 || dnf.length > 0) && (
            <button
              onClick={() => clearSection([...escaped, ...dnf])}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono transition-colors"
            >
              <Trash2 size={12} /> Clear Finished
            </button>
          )}
        </div>
      </div>

      {/* ── Escaped / Finished ── */}
      <div className="glass rounded-2xl border-yellow-500/20 overflow-hidden">
        <div className="px-5 py-3 bg-yellow-500/5 border-b border-yellow-500/15 flex items-center gap-2">
          <Crown size={14} className="text-yellow-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">Escaped — Ranked</span>
          <span className="ml-auto text-xs font-mono text-gray-600">{escaped.length} teams</span>
        </div>

        {escaped.length === 0 ? (
          <div className="py-14 text-center text-gray-600 font-mono text-sm">
            <Trophy size={32} className="mx-auto mb-3 opacity-20" />
            No teams have escaped yet.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {escaped.map((t, idx) => {
                const secs = calcFinalSeconds(t)!;
                const isTop3 = idx < 3;
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors ${isTop3 ? 'bg-yellow-500/5' : ''}`}
                  >
                    <div className="text-2xl w-8 text-center shrink-0">{MEDALS[idx] ?? `#${idx + 1}`}</div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold font-mono uppercase tracking-widest truncate ${isTop3 ? 'text-yellow-300' : 'text-white'}`}>{t.name}</div>
                      <div className="text-xs font-mono text-gray-500 mt-0.5">
                        {t.penalty_minutes ? `+${t.penalty_minutes}m penalty` : 'No penalty'}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={`font-mono font-bold text-lg ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-gray-400'}`}>
                        {formatTime(secs)}
                      </div>
                      <div className="text-[10px] text-gray-600 font-mono">{t.penalty_minutes ? `${t.penalty_minutes}m added` : 'clean run'}</div>
                    </div>
                    <DeleteBtn id={t.id} label="Delete team record" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── DNF Section ── */}
      {dnf.length > 0 && (
        <div className="glass rounded-2xl border-red-500/20 overflow-hidden">
          <div className="px-5 py-3 bg-red-500/5 border-b border-red-500/15 flex items-center gap-2">
            <XCircle size={14} className="text-red-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-red-400">Did Not Finish (DNF)</span>
            <span className="ml-auto text-xs font-mono text-gray-600">{dnf.length} teams</span>
            <button
              onClick={() => clearSection(dnf)}
              className="ml-2 flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-red-500/70 text-[10px] font-mono transition-colors"
            >
              <Trash2 size={10} /> Clear DNF
            </button>
          </div>
          <div className="divide-y divide-white/5">
            <AnimatePresence>
              {dnf.map((t, idx) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: idx * 0.04 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
                >
                  <div className="text-xl shrink-0">💀</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold font-mono uppercase tracking-widest truncate text-red-200/70">{t.name}</div>
                    <div className="text-xs font-mono text-gray-500 mt-0.5">
                      Round {t.current_round}/5 · {t.keys_unlocked} keys
                      {t.penalty_minutes ? ` · +${t.penalty_minutes}m penalty` : ''}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono font-bold text-sm text-red-500 uppercase tracking-widest">DNF</div>
                    <div className="text-[10px] text-gray-600 font-mono">Timer expired</div>
                  </div>
                  <DeleteBtn id={t.id} label="Delete team record" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ── Still Running ── */}
      {active.length > 0 && (
        <div className="glass rounded-2xl border-cyan-500/15 overflow-hidden">
          <div className="px-5 py-3 bg-cyan-500/5 border-b border-cyan-500/10 flex items-center gap-2">
            <Zap size={14} className="text-cyan-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Still Running</span>
            <span className="ml-auto text-xs font-mono text-gray-600">{active.length} teams</span>
          </div>
          <div className="divide-y divide-white/5">
            {active.map((t) => (
              <div key={t.id} className="flex items-center gap-4 px-5 py-3 hover:bg-white/5 transition-colors">
                <div className="text-lg shrink-0">⏱</div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold font-mono uppercase text-sm tracking-widest text-white truncate block">{t.name}</span>
                  <span className="text-xs font-mono text-gray-500">Round {t.current_round} of 5 · {t.keys_unlocked} keys</span>
                </div>
                <div className="text-xs font-mono text-gray-500 shrink-0">{t.penalty_minutes ? `+${t.penalty_minutes}m` : '—'}</div>
                <DeleteBtn id={t.id} label="Delete team" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats footer */}
      {teams.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Users size={16} className="text-cyan-400" />, label: 'Total Teams', val: teams.length },
            { icon: <Trophy size={16} className="text-yellow-400" />, label: 'Escaped', val: escaped.length },
            { icon: <XCircle size={16} className="text-red-400" />, label: 'DNF', val: dnf.length },
            { icon: <Timer size={16} className="text-green-400" />, label: 'Best Time', val: escaped[0] ? formatTime(calcFinalSeconds(escaped[0])!) : '—' },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl border-white/5 p-4 flex items-center gap-3">
              {s.icon}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-gray-600">{s.label}</div>
                <div className="text-lg font-bold text-white font-mono">{s.val}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
