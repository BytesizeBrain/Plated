import { useNavigate, useLocation } from 'react-router-dom';
import { useMessageStore } from '../../stores/messageStore';
import { useGamificationStore } from '../../stores/gamificationStore';
import './BottomNav.css';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useMessageStore();
  const { skillTracks } = useGamificationStore();
  const activeTrackCount = skillTracks.filter((track) => !track.completedAt).length;

  const isActive = (path: string) => {
    if (path === '/feed') {
      return location.pathname === '/feed';
    }
    if (path === '/tracks') {
      return location.pathname === '/tracks';
    }
    if (path === '/squad') {
      return location.pathname === '/squad';
    }
    if (path === '/messages') {
      return location.pathname.startsWith('/messages');
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
        className={`bottom-nav-btn ${isActive('/squad') ? 'active' : ''}`}
        onClick={() => navigate('/squad')}
        aria-label="Squad"
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
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <span>Squad</span>
      </button>

      <button
        className={`bottom-nav-btn ${isActive('/tracks') ? 'active' : ''}`}
        onClick={() => navigate('/tracks')}
        aria-label="Tracks"
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
          <path d="M4 19c2-3 4-5 8-5s6 2 8 5"></path>
          <circle cx="12" cy="7" r="3"></circle>
          <path d="M12 10v4"></path>
          <path d="M9 22h6"></path>
        </svg>
        <span>Tracks</span>
        {activeTrackCount > 0 && (
          <span className="nav-badge">{activeTrackCount}</span>
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
    </nav>
  );
}

export default BottomNav;


