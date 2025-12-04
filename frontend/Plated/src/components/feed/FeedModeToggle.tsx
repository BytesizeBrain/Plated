import './FeedModeToggle.css';

export type FeedMode = 'feed' | 'challenges' | 'messages';

interface FeedModeToggleProps {
  currentMode: FeedMode;
  onModeChange: (mode: FeedMode) => void;
  unreadCount?: number;
  activeChallengesCount?: number;
}

function FeedModeToggle({
  currentMode,
  onModeChange,
  unreadCount = 0,
  activeChallengesCount = 0
}: FeedModeToggleProps) {
  return (
    <div className="feed-mode-toggle">
      <button
        className={`mode-toggle-btn ${currentMode === 'feed' ? 'active' : ''}`}
        onClick={() => onModeChange('feed')}
        aria-label="Feed view"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span>Feed</span>
      </button>

      <button
        className={`mode-toggle-btn ${currentMode === 'challenges' ? 'active' : ''}`}
        onClick={() => onModeChange('challenges')}
        aria-label="Challenges view"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
          <path d="M4 22h16"></path>
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
        </svg>
        <span>Challenges</span>
        {activeChallengesCount > 0 && (
          <span className="mode-badge">{activeChallengesCount}</span>
        )}
      </button>

      <button
        className={`mode-toggle-btn ${currentMode === 'messages' ? 'active' : ''}`}
        onClick={() => onModeChange('messages')}
        aria-label="Messages view"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Messages</span>
        {unreadCount > 0 && (
          <span className="mode-badge unread">{unreadCount}</span>
        )}
      </button>
    </div>
  );
}

export default FeedModeToggle;
