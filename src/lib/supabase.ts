import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// We create a generic client. If env variables are missing, we throw a clear error or return a mock in dev.
export const supabase = createClient(supabaseUrl || 'https://mock.supabase.co', supabaseKey || 'mock-key', {
  auth: {
    persistSession: false // For this app, we rely on Team codes, not full user auth
  }
})

// Typings for our DB
export type Team = {
  id: string;
  name: string;
  access_code: string;
  current_round: number;
  start_time: string | null;
  end_time: string | null;
  keys_unlocked: number;
  hints_used: number;
  round_hints_used: number;
  penalty_minutes: number;
  current_target?: string;
  cipher_word?: string;
  state_payload?: any;
}
