'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Timer, ArrowLeft, Trash2, UserMinus, Medal,
  RefreshCw, Crown, Zap, Users, ShieldAlert
} from 'lucide-react';
import Link from 'next/link';
import { parseISO, differenceInSeconds } from 'date-fns';
import { supabase, Team } from '@/lib/supabase';
import { useGameStore } from '@/lib/store';

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

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export default function LeaderboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const { timerDurationMinutes } = useGameStore();

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

  // Sort: finished teams by time, then unfinished by round desc
  const escaped = teams
    .filter(t => t.end_time && calcFinalSeconds(t) !== null)
    .sort((a, b) => (calcFinalSeconds(a) ?? 9999) - (calcFinalSeconds(b) ?? 9999));

  const active = teams
    .filter(t => !t.end_time)
    .sort((a, b) => b.current_round - a.current_round);

  const removeFromBoard = async (id: string) => {
    if (!confirm('Remove this team from the leaderboard?')) return;
    setRemoving(id);
    // We soft-clear their end_time to remove from escaped, or just delete
    await supabase.from('teams').delete().eq('id', id);
    setRemoving(null);
  };

  const clearAllEscaped = async () => {
    if (!confirm('Clear ALL finished teams from the leaderboard? This permanently deletes their records.')) return;
    for (const t of escaped) {
      await supabase.from('teams').delete().eq('id', t.id);
    }
  };

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
          {escaped.length > 0 && (
            <button onClick={clearAllEscaped} className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono transition-colors">
              <Trash2 size={12} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Escaped section */}
      <div className="glass rounded-2xl border-yellow-500/20 overflow-hidden">
        <div className="px-5 py-3 bg-yellow-500/5 border-b border-yellow-500/15 flex items-center gap-2">
          <Crown size={14} className="text-yellow-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">Finished Teams — Ranked</span>
          <span className="ml-auto text-xs font-mono text-gray-600">{escaped.length} teams</span>
        </div>

        {escaped.length === 0 ? (
          <div className="py-16 text-center text-gray-600 font-mono text-sm">
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
                    {/* Rank */}
                    <div className="text-2xl w-8 text-center shrink-0">{MEDALS[idx] ?? `#${idx + 1}`}</div>

                    {/* Team name */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold font-mono uppercase tracking-widest truncate ${isTop3 ? 'text-yellow-300' : 'text-white'}`}>
                        {t.name}
                      </div>
                      <div className="text-xs font-mono text-gray-500 mt-0.5">
                        Code: {t.access_code} · {t.penalty_minutes ? `+${t.penalty_minutes}m penalty` : 'No penalty'}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="shrink-0 text-right">
                      <div className={`font-mono font-bold text-lg ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-gray-400'}`}>
                        {formatTime(secs)}
                      </div>
                      <div className="text-[10px] text-gray-600 font-mono">{t.penalty_minutes ? `${Math.floor(t.penalty_minutes)}m added` : 'clean run'}</div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromBoard(t.id)}
                      disabled={removing === t.id}
                      className="shrink-0 p-2 rounded-lg text-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
                      title="Remove from leaderboard"
                    >
                      <UserMinus size={14} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Active teams */}
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
                  <span className="text-xs font-mono text-gray-500">Round {t.current_round} of 5</span>
                </div>
                <div className="text-xs font-mono text-gray-500 shrink-0">{t.penalty_minutes ? `+${t.penalty_minutes}m` : '—'}</div>
                <button
                  onClick={() => removeFromBoard(t.id)}
                  disabled={removing === t.id}
                  className="shrink-0 p-2 rounded-lg text-red-500/40 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
                  title="Remove team"
                >
                  <UserMinus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats footer */}
      {teams.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <Users size={16} className="text-cyan-400" />, label: 'Total Teams', val: teams.length },
            { icon: <Trophy size={16} className="text-yellow-400" />, label: 'Escaped', val: escaped.length },
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
