import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Team, supabase } from './supabase'

interface GameState {
  // Current Team Info
  team: Team | null;
  setTeam: (team: Team | null) => void;
  
  // Game Timers
  timerDurationMinutes: number;
  
  // App-wide state
  isHydrated: boolean;
  setHydrated: (state: boolean) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      team: null,
  setTeam: (team) => {
    set({ team });
    if (team && team.id) {
      // Fire and forget sync to Supabase
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
      }).eq('id', team.id).then(({error}) => { if(error) console.error("Sync error:", error) });
    }
  },
  
  // Global configured timer duration
  timerDurationMinutes: 60,
  
  isHydrated: false,
  setHydrated: (state) => set({ isHydrated: state }),
    }),
    {
      name: 'helix-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated(true);
      },
      partialize: (state) => ({ team: state.team }), // Only persist the team object
    }
  )
);
