import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Team, supabase } from './supabase'

interface GameState {
  // Current Team Info
  team: Team | null;
  setTeam: (team: Team | null) => void;
  // Silently update local team state without triggering a Supabase write
  patchTeamLocally: (partial: Partial<Team>) => void;
  
  // Game Timers
  timerDurationMinutes: number;
  
  // App-wide state
  isHydrated: boolean;
  setHydrated: (state: boolean) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      team: null,

      setTeam: (team) => {
        set({ team });
        if (team && team.id) {
          supabase.from('teams').update({
            current_round: team.current_round,
            keys_unlocked: team.keys_unlocked,
            hints_used: team.hints_used,
            round_hints_used: team.round_hints_used,
            penalty_minutes: team.penalty_minutes,
            end_time: team.end_time,
            current_target: team.current_target,
            cipher_word: team.cipher_word,
            state_payload: team.state_payload
          }).eq('id', team.id).then(({ error }) => { if (error) console.error('Sync error:', error); });
        }
      },

      // Used by realtime listener — updates local store only, no Supabase write
      patchTeamLocally: (partial) => {
        const current = get().team;
        if (!current) return;
        set({ team: { ...current, ...partial } });
      },

      // Timer: 2 hours
      timerDurationMinutes: 120,

      isHydrated: false,
      setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: 'helix-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true);
      },
      partialize: (state) => ({ team: state.team }),
    }
  )
);

// ─── Realtime sync: call once when the team page mounts ──────────────────────
// Returns an unsubscribe function.  When admin updates penalty_minutes,
// start_time, or end_time the client's timer reacts immediately.
export function subscribeToTeamUpdates(teamId: string): () => void {
  const channel = supabase
    .channel(`team-${teamId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'teams', filter: `id=eq.${teamId}` },
      (payload) => {
        const updated = payload.new as Team;
        useGameStore.getState().patchTeamLocally({
          penalty_minutes: updated.penalty_minutes,
          start_time: updated.start_time,
          end_time: updated.end_time,
          current_round: updated.current_round,
          keys_unlocked: updated.keys_unlocked,
          hints_used: updated.hints_used,
          round_hints_used: updated.round_hints_used,
        });
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

