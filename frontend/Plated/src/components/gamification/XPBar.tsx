import './XPBar.css';

interface XPBarProps {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  showDetails?: boolean;
}

function XPBar({ level, currentXp, nextLevelXp, showDetails = true }: XPBarProps) {
  const levelStartXp = (level - 1) * (level - 1) * 100;
  const xpInCurrentLevel = currentXp - levelStartXp;
  const xpNeededForLevel = nextLevelXp - levelStartXp;
  const progress = (xpInCurrentLevel / xpNeededForLevel) * 100;

  return (
    <div className="xp-bar-container">
      <div className="xp-bar-header">
        <div className="level-badge">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>Level {level}</span>
        </div>
        {showDetails && (
          <div className="xp-details">
            <span className="xp-current">{xpInCurrentLevel}</span>
            <span className="xp-separator">/</span>
            <span className="xp-total">{xpNeededForLevel} XP</span>
          </div>
        )}
      </div>
      <div className="xp-bar">
        <div
          className="xp-bar-fill"
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          <div className="xp-bar-shine"></div>
        </div>
      </div>
      {progress >= 100 && (
        <div className="level-up-badge">
          <span>🎉 Ready to level up!</span>
        </div>
      )}
    </div>
  );
}

export default XPBar;
