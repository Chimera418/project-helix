'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { subscribeToTeamUpdates } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import GlobalTimer from './Timer';
import { Key } from 'lucide-react';

export default function HUD() {
  const { team, setTeam, patchTeamLocally } = useGameStore();

  // On every mount, fetch fresh team data from Supabase and overwrite
  // the potentially stale localStorage snapshot. This ensures skip-round,
  // hint-reset, and penalty changes made by admin are reflected immediately
  // even if the client was offline or hadn't received the realtime event.
  useEffect(() => {
    if (!team?.id) return;
    supabase
      .from('teams')
      .select('*')
      .eq('id', team.id)
      .single()
      .then(({ data }) => {
        if (data) {
          patchTeamLocally({
            current_round: data.current_round,
            keys_unlocked: data.keys_unlocked,
            hints_used: data.hints_used,
            round_hints_used: data.round_hints_used,
            penalty_minutes: data.penalty_minutes,
            start_time: data.start_time,
            end_time: data.end_time,
            current_target: data.current_target,
            cipher_word: data.cipher_word,
            state_payload: data.state_payload,
          });
        }
      });
  }, [team?.id]);

  // Also subscribe for live admin changes going forward
  useEffect(() => {
    if (!team?.id) return;
    const unsub = subscribeToTeamUpdates(team.id);
    return unsub;
  }, [team?.id]);

  if (!team) return null; // Don't show HUD on login panel

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-7xl mx-auto flex justify-between items-start">
        {/* Left: Team Info */}
        <div className="glass px-6 py-3 rounded-2xl pointer-events-auto border-cyan-500/30 neon-border-cyan flex flex-col gap-1 min-w-[160px]">
          <div className="flex justify-between items-center">
             <div className="text-xs uppercase tracking-widest text-cyan-500/80">Team</div>
             <button onClick={() => setTeam(null)} className="text-[10px] text-red-500 hover:text-red-400 uppercase tracking-widest font-bold">Logout</button>
          </div>
          <div className="text-xl font-bold neon-text-cyan truncate">{team.name}</div>
        </div>

        {/* Center: Global Timer */}
        <div className="glass px-8 py-4 rounded-b-3xl -mt-4 pointer-events-auto flex flex-col items-center border-t-0 shadow-[0_10px_30px_rgba(0,255,255,0.1)]">
          <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-1">Time Remaining</div>
          <GlobalTimer />
        </div>

        {/* Right: Round & Keys */}
        <div className="glass px-6 py-3 rounded-2xl pointer-events-auto border-green-500/30 neon-text-green flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-green-500/80">Round</span>
            <span className="text-xl font-bold">{team.current_round}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
             <Key size={14} className="text-yellow-400" />
             <span className="text-gray-300">Keys: {team.keys_unlocked}/3</span>
          </div>
        </div>
      </div>
    </div>
  );
}
