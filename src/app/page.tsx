'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useGameStore } from '@/lib/store';
import { Shield } from 'lucide-react';
import { VALID_WORDS } from '@/data/words';

export default function LandingPage() {
  const router = useRouter();
  const { team, setTeam } = useGameStore();
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (team) {
      router.replace(`/round/${team.current_round > 0 ? team.current_round : 1}`);
    }
  }, [team, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (teamName.trim().length >= 3) {
        const canonicalName = teamName.trim();
        
        // 1. Fetch from Supabase
        const { data: existingTeam, error: fetchError } = await supabase
          .from('teams')
          .select('*')
          .ilike('name', canonicalName)
          .maybeSingle();

        if (existingTeam) {
          // Team exists, resume!
          setTeam(existingTeam);
          router.push(`/round/${existingTeam.current_round > 0 ? existingTeam.current_round : 1}`);
        } else {
          // 2. Insert new team with a fixed cipher word
          const cipherWord = VALID_WORDS[Math.floor(Math.random() * VALID_WORDS.length)].toUpperCase();
          const newTeam = {
            name: canonicalName,
            access_code: canonicalName.toUpperCase().replace(/\s+/g, '-'),
            current_round: 1,
            start_time: new Date().toISOString(),
            end_time: null,
            keys_unlocked: 0,
            hints_used: 0,
            round_hints_used: 0,
            penalty_minutes: 0,
            cipher_word: cipherWord,
          };

          const { data: inserted, error: insertError } = await supabase
            .from('teams')
            .insert(newTeam)
            .select()
            .single();

          if (insertError) {
            console.error(insertError);
            setError('Failed to initialize remote team protocol. ' + insertError.message);
          } else {
            setTeam(inserted);
            router.push('/round/1');
          }
        }
      } else {
        setError('Team name too short. Protocol requires 3+ characters.');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to secure database failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center p-4 rounded-full bg-cyan-900/20 border border-cyan-500/30 neon-border-cyan mb-6">
          <Shield size={48} className="text-cyan-400 neon-text-cyan" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 text-white">
          PROJECT <span className="neon-text-cyan text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">HELIX</span>
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto text-sm md:text-base uppercase tracking-widest leading-relaxed">
          Executive Override. Register the designated Team Name to initialize the terminal and begin the countdown.
        </p>
      </motion.div>

      <motion.form 
        onSubmit={handleLogin}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="glass p-8 rounded-2xl w-full max-w-md border-cyan-500/20"
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="teamName" className="text-xs uppercase tracking-widest text-cyan-500 font-bold">Team Name</label>
            <input 
              id="teamName"
              type="text" 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="bg-black/50 border border-cyan-500/30 rounded-lg p-4 text-center text-xl font-mono text-white focus:outline-none focus:border-cyan-400 transition-colors placeholder:text-gray-700 uppercase"
              placeholder="ENTER TEAM NAME"
              autoComplete="off"
            />
            {error && <span className="text-red-500 text-sm font-mono mt-2 animate-pulse">{error}</span>}
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-600/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 font-bold py-4 rounded-lg uppercase tracking-widest transition-all duration-300 neon-text-cyan disabled:opacity-50 flex justify-center items-center h-[58px]"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              'Initialize Protocol'
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
