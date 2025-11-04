import { useEffect, useState } from 'react';
import './StreakFlame.css';

interface StreakFlameProps {
  currentDays: number;
  freezeTokens?: number;
  nextCutoff?: string;
  onUseFreeze?: () => void;
}

function StreakFlame({
  currentDays,
  freezeTokens = 0,
  nextCutoff,
  onUseFreeze
}: StreakFlameProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    if (!nextCutoff) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const cutoff = new Date(nextCutoff).getTime();
      const diff = cutoff - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextCutoff]);

  return (
    <div className="streak-flame-container">
      <div className="streak-flame">
        <div className="flame-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2c-1.1 4.4-3.9 7.5-7 9 1.5 1.2 3 2.5 4 4.5.5-1 1.5-2 3-2.5 0 2.5-1 5-2 6.5 2.5 0 5-1 7-3 1-1 2-2.5 2-4.5 0-3.5-2.5-6.5-7-10z" />
          </svg>
        </div>
        <div className="streak-info">
          <div className="streak-count">{currentDays}</div>
          <div className="streak-label">Day Streak</div>
        </div>
      </div>

      {nextCutoff && (
        <div className="streak-timer">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>{timeRemaining} left</span>
        </div>
      )}

      {freezeTokens > 0 && (
        <div className="freeze-tokens">
          <div className="freeze-icon">❄️</div>
          <span>{freezeTokens} Freeze{freezeTokens !== 1 ? 's' : ''}</span>
          {onUseFreeze && (
            <button
              className="use-freeze-btn"
              onClick={onUseFreeze}
              aria-label="Use streak freeze"
            >
              Use
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default StreakFlame;
