import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import BottomNav from '../../components/navigation/BottomNav';
import { 
  getSquadsLeaderboard, 
  getMySquad, 
  createSquad, 
  joinSquad, 
  leaveSquad 
} from '../../utils/squadApi';
import './SquadPage.css';

interface SquadMember {
  user_id: string;
  username: string;
  display_name: string;
  profile_pic: string;
  role: 'leader' | 'member';
  weekly_contribution: number;
  joined_at: string;
}

interface Squad {
  id: string;
  name: string;
  code?: string;
  description?: string;
  weekly_points: number;
  total_points: number;
  member_count: number;
  rank?: number;
  created_at?: string;
}

type TabType = 'my-squad' | 'leaderboard';

function SquadPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('my-squad');
  const [mySquad, setMySquad] = useState<Squad | null>(null);
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [leaderboard, setLeaderboard] = useState<Squad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Form states
  const [newSquadName, setNewSquadName] = useState('');
  const [newSquadDescription, setNewSquadDescription] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (activeTab === 'my-squad') {
          const data = await getMySquad();
          setMySquad(data.squad);
          setMembers(data.members);
        } else {
          const data = await getSquadsLeaderboard();
          setLeaderboard(data.squads);
        }
      } catch (err) {
        console.error('Failed to fetch squad data:', err);
        setError('Failed to load squad data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab]);

  const handleCreateSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSquadName.trim()) {
      setFormError('Squad name is required');
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const result = await createSquad(newSquadName.trim(), newSquadDescription.trim());
      setMySquad(result.squad);
      setMembers([{
        user_id: 'current-user',
        username: 'you',
        display_name: 'You',
        profile_pic: '',
        role: 'leader',
        weekly_contribution: 0,
        joined_at: new Date().toISOString()
      }]);
      setShowCreateModal(false);
      setNewSquadName('');
      setNewSquadDescription('');
      setSuccessMessage(`Squad "${result.squad.name}" created! Share code: ${result.invite_code}`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create squad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinSquad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setFormError('Invite code is required');
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const result = await joinSquad(joinCode.trim());
      setMySquad(result.squad);
      setShowJoinModal(false);
      setJoinCode('');
      setSuccessMessage(result.message);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      // Refresh squad data
      const data = await getMySquad();
      setMySquad(data.squad);
      setMembers(data.members);
    } catch (err: any) {
      setFormError(err.message || 'Failed to join squad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveSquad = async () => {
    if (!confirm('Are you sure you want to leave this squad?')) return;
    
    setIsSubmitting(true);
    
    try {
      await leaveSquad();
      setMySquad(null);
      setMembers([]);
      setSuccessMessage('You have left the squad');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to leave squad');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyInviteCode = () => {
    if (mySquad?.code) {
      navigator.clipboard.writeText(mySquad.code);
      setSuccessMessage('Invite code copied!');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="squad-page">
      {/* Header */}
      <header className="squad-header">
        <div className="squad-header-content">
          <button className="back-btn" onClick={() => navigate('/feed')} aria-label="Go back to feed">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="squad-title">
            <span className="squad-icon">👥</span>
            Squad Pot
          </h1>
          <div className="header-spacer"></div>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="success-toast">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {successMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="squad-tabs">
        <button 
          className={`squad-tab ${activeTab === 'my-squad' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-squad')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          My Squad
        </button>
        <button 
          className={`squad-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 21h8M12 17v4M6 13h4l2 4 2-4h4"/>
            <path d="M6 9h12l-1-4H7L6 9z"/>
            <path d="M5 9v4h14V9"/>
          </svg>
          Leaderboard
        </button>
      </div>

      {/* Content */}
      <main className="squad-content">
        {error && (
          <div className="squad-error">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        )}

        {isLoading ? (
          <div className="squad-loading">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : activeTab === 'my-squad' ? (
          // My Squad Tab
          mySquad ? (
            <div className="my-squad-view">
              {/* Squad Card */}
              <div className="squad-card">
                <div className="squad-card-header">
                  <div className="squad-avatar">
                    {mySquad.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="squad-info">
                    <h2>{mySquad.name}</h2>
                    {mySquad.description && <p className="squad-description">{mySquad.description}</p>}
                  </div>
                </div>
                
                <div className="squad-stats">
                  <div className="stat-item">
                    <span className="stat-value">{mySquad.weekly_points.toLocaleString()}</span>
                    <span className="stat-label">Points This Week</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <span className="stat-value">{mySquad.member_count}</span>
                    <span className="stat-label">Members</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <span className="stat-value">{mySquad.total_points.toLocaleString()}</span>
                    <span className="stat-label">Total Points</span>
                  </div>
                </div>

                <div className="squad-actions">
                  <button className="invite-btn" onClick={() => setShowInviteModal(true)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/>
                      <line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                    Invite Friends
                  </button>
                  <button className="leave-btn" onClick={handleLeaveSquad} disabled={isSubmitting}>
                    Leave Squad
                  </button>
                </div>
              </div>

              {/* Members List */}
              <div className="members-section">
                <h3>Members ({members.length})</h3>
                <div className="members-list">
                  {members.map((member, index) => (
                    <div key={member.user_id} className="member-card">
                      <span className="member-rank">{index + 1}</span>
                      <img 
                        src={member.profile_pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} 
                        alt={member.display_name}
                        className="member-avatar"
                      />
                      <div className="member-info">
                        <span className="member-name">
                          {member.display_name}
                          {member.role === 'leader' && <span className="leader-badge">👑</span>}
                        </span>
                        <span className="member-username">@{member.username}</span>
                      </div>
                      <div className="member-contribution">
                        <span className="contribution-value">+{member.weekly_contribution}</span>
                        <span className="contribution-label">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // No Squad - Join or Create
            <div className="no-squad-view">
              <div className="no-squad-illustration">
                <span className="big-emoji">🍳</span>
                <h2>Join a Squad!</h2>
                <p>Team up with friends and compete together. Each member's recipe completions add coins to your shared Squad Pot!</p>
              </div>
              
              <div className="squad-cta-buttons">
                <button className="create-squad-btn" onClick={() => setShowCreateModal(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  Create a Squad
                </button>
                <button className="join-squad-btn" onClick={() => setShowJoinModal(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                    <polyline points="10 17 15 12 10 7"/>
                    <line x1="15" y1="12" x2="3" y2="12"/>
                  </svg>
                  Join with Code
                </button>
              </div>

              <div className="squad-benefits">
                <h3>Why Join a Squad?</h3>
                <ul>
                  <li>
                    <span className="benefit-icon">🏆</span>
                    <span>Compete on the weekly leaderboard</span>
                  </li>
                  <li>
                    <span className="benefit-icon">👥</span>
                    <span>Cook together with friends</span>
                  </li>
                  <li>
                    <span className="benefit-icon">💰</span>
                    <span>Pool your coins for bigger rewards</span>
                  </li>
                  <li>
                    <span className="benefit-icon">🔥</span>
                    <span>Stay motivated with friendly competition</span>
                  </li>
                </ul>
              </div>
            </div>
          )
        ) : (
          // Leaderboard Tab
          <div className="leaderboard-view">
            <div className="leaderboard-header">
              <h2>🏆 Top Squads This Week</h2>
              <p>Compete with other squads for the top spot!</p>
            </div>
            
            <div className="leaderboard-list">
              {leaderboard.map((squad) => (
                <div 
                  key={squad.id} 
                  className={`leaderboard-card ${squad.rank && squad.rank <= 3 ? 'top-three' : ''} ${mySquad?.id === squad.id ? 'my-squad' : ''}`}
                >
                  <div className="rank-badge">
                    {getRankBadge(squad.rank || 0)}
                  </div>
                  <div className="squad-avatar small">
                    {squad.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="leaderboard-info">
                    <span className="squad-name">
                      {squad.name}
                      {mySquad?.id === squad.id && <span className="your-squad-badge">Your Squad</span>}
                    </span>
                    <span className="squad-members">{squad.member_count} members</span>
                  </div>
                  <div className="squad-points">
                    <span className="points-value">{squad.weekly_points.toLocaleString()}</span>
                    <span className="points-label">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Create Squad Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create a Squad</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)} aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleCreateSquad}>
              {formError && <div className="form-error">{formError}</div>}
              
              <div className="form-group">
                <label htmlFor="squadName">Squad Name *</label>
                <input
                  id="squadName"
                  type="text"
                  value={newSquadName}
                  onChange={e => setNewSquadName(e.target.value)}
                  placeholder="e.g., Dorm 4B, CS Majors, Anime Club"
                  maxLength={30}
                  autoFocus
                />
                <span className="char-count">{newSquadName.length}/30</span>
              </div>
              
              <div className="form-group">
                <label htmlFor="squadDescription">Description (optional)</label>
                <textarea
                  id="squadDescription"
                  value={newSquadDescription}
                  onChange={e => setNewSquadDescription(e.target.value)}
                  placeholder="What's your squad about?"
                  maxLength={100}
                  rows={3}
                />
              </div>
              
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Squad'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Join Squad Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Join a Squad</h2>
              <button className="close-btn" onClick={() => setShowJoinModal(false)} aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleJoinSquad}>
              {formError && <div className="form-error">{formError}</div>}
              
              <div className="form-group">
                <label htmlFor="joinCode">Invite Code</label>
                <input
                  id="joinCode"
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character code"
                  maxLength={6}
                  autoFocus
                  className="code-input"
                />
                <p className="form-hint">Ask your friend for their squad's invite code</p>
              </div>
              
              <button type="submit" className="submit-btn" disabled={isSubmitting || joinCode.length < 6}>
                {isSubmitting ? 'Joining...' : 'Join Squad'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && mySquad && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content invite-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invite Friends</h2>
              <button className="close-btn" onClick={() => setShowInviteModal(false)} aria-label="Close modal">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="invite-content">
              <p>Share this code with friends to invite them to <strong>{mySquad.name}</strong></p>
              
              <div className="invite-code-display">
                <span className="invite-code">{mySquad.code}</span>
                <button className="copy-btn" onClick={copyInviteCode}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>
              
              <p className="invite-hint">They can join by going to Squad Pot → Join with Code</p>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}

export default SquadPage;
