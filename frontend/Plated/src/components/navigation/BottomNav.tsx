import { useNavigate, useLocation } from 'react-router-dom';
import { useMessageStore } from '../../stores/messageStore';
import { useGamificationStore } from '../../stores/gamificationStore';
import './BottomNav.css';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useMessageStore();
  const { activeChallenges } = useGamificationStore();

  const isActive = (path: string) => {
    if (path === '/feed') {
      return location.pathname === '/feed';
    }
    if (path === '/challenges') {
      return location.pathname === '/challenges';
    }
    if (path === '/messages') {
      return location.pathname.startsWith('/messages');
    }
    if (path === '/profile') {
      return location.pathname === '/profile';
    }
    return false;
  };

  return (
    <nav className="bottom-nav">
      <button
        className={`bottom-nav-btn ${isActive('/feed') ? 'active' : ''}`}
        onClick={() => navigate('/feed')}
        aria-label="Feed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
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
        className={`bottom-nav-btn ${isActive('/challenges') ? 'active' : ''}`}
        onClick={() => navigate('/challenges')}
        aria-label="Challenges"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
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
        {activeChallenges.length > 0 && (
          <span className="nav-badge">{activeChallenges.length}</span>
        )}
      </button>

      <button
        className={`bottom-nav-btn ${isActive('/messages') ? 'active' : ''}`}
        onClick={() => navigate('/messages')}
        aria-label="Messages"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
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
          <span className="nav-badge unread">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      <button
        className={`bottom-nav-btn ${isActive('/profile') ? 'active' : ''}`}
        onClick={() => navigate('/profile')}
        aria-label="Profile"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Profile</span>
      </button>
    </nav>
  );
}

export default BottomNav;


