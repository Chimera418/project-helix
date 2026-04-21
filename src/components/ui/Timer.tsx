import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { parseISO, differenceInSeconds } from 'date-fns';

export default function GlobalTimer() {
  const { team, timerDurationMinutes } = useGameStore();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!team || !team.start_time) {
      setTimeLeft(timerDurationMinutes * 60);
      return;
    }

    const interval = setInterval(() => {
      const now = team.end_time ? parseISO(team.end_time as string) : new Date();
      const start = parseISO(team.start_time as string);
      
      // Elapsed seconds since start
      const elapsed = differenceInSeconds(now, start);
      
      // Total allowed duration in seconds
      const totalAllocatedSeconds = timerDurationMinutes * 60;
      
      // Subtract penalty minutes
      const penaltySeconds = (team.penalty_minutes || 0) * 60;
      
      const remaining = totalAllocatedSeconds - elapsed - penaltySeconds;
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [team, timerDurationMinutes]);

  if (timeLeft === null) return <div className="text-xl font-mono animate-pulse">--:--</div>;

  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;

  const isLowTime = timeLeft <= 300; // < 5 mins

  return (
    <div className={`text-2xl md:text-4xl font-mono tracking-widest ${isLowTime ? 'neon-text-red text-red-500 animate-pulse' : 'neon-text-cyan'}`}>
      {m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
    </div>
  );
}
