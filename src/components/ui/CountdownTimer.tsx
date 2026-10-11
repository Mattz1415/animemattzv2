import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  releaseDay?: string;
  className?: string;
}

const DAY_MAP: Record<string, number> = {
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  sabtu: 6,
  minggu: 0,
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  releaseDay,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!releaseDay) return;

    const targetDayIndex = DAY_MAP[releaseDay.toLowerCase()];
    if (targetDayIndex === undefined) return;

    const updateTimer = () => {
      const now = new Date();
      const currentDay = now.getDay();
      let daysUntil = targetDayIndex - currentDay;
      if (daysUntil < 0) daysUntil += 7;
      if (daysUntil === 0 && now.getHours() >= 20) daysUntil = 7; // after 8 PM broadcast

      const target = new Date(now);
      target.setDate(now.getDate() + daysUntil);
      target.setHours(18, 0, 0, 0); // approx 18:00 WIB release

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft('Broadcasting Today');
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${d > 0 ? `${d}d ` : ''}${h}h ${m}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [releaseDay]);

  if (!timeLeft) return null;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900/90 text-cyan-400 border border-cyan-800/60 shadow-sm ${className}`}
      title={`Next broadcast in ${timeLeft}`}
    >
      <Clock className="w-3 h-3 text-cyan-400 animate-pulse" />
      <span>{timeLeft}</span>
    </div>
  );
};
