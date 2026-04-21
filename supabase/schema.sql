-- Schema for Project Helix

CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  access_code TEXT UNIQUE NOT NULL,
  current_round INTEGER DEFAULT 0 NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  keys_unlocked INTEGER DEFAULT 0 NOT NULL,
  hints_used INTEGER DEFAULT 0 NOT NULL,
  round_hints_used INTEGER DEFAULT 0 NOT NULL,
  penalty_minutes INTEGER DEFAULT 0 NOT NULL,
  current_target TEXT,
  cipher_word TEXT,       -- Fixed random word assigned at team creation; used as Round 4 cipher answer
  state_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Realtime for the Admin Dashboard
alter publication supabase_realtime add table teams;

-- REPLICA IDENTITY FULL ensures DELETE events sent via Realtime include the full old row,
-- so the admin dashboard can correctly remove the team from state without a re-fetch.
ALTER TABLE teams REPLICA IDENTITY FULL;

-- RLS Policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select of teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow update using access code" ON teams FOR UPDATE USING (true);
CREATE POLICY "Allow insert" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete" ON teams FOR DELETE USING (true); -- Admin-only in practice; secured by admin password in-app
