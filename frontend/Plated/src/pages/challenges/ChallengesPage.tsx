import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGamificationStore } from '../../stores/gamificationStore';
import { mockChallenges, mockRewardsSummary } from '../../data/mockGamificationData';
import type { Challenge } from '../../types';
import XPBar from '../../components/gamification/XPBar';
import CoinWallet from '../../components/gamification/CoinWallet';
import StreakFlame from '../../components/gamification/StreakFlame';
import BottomNav from '../../components/navigation/BottomNav';
import './ChallengesPage.css';

function ChallengesPage() {
  const navigate = useNavigate();
  const {
    challenges,
    activeChallenges,
    rewards,
    setChallenges,
    setRewards,
    startChallenge,
  } = useGamificationStore();

  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | Challenge['difficulty']>('all');
  const [selectedType, setSelectedType] = useState<'all' | Challenge['type']>('all');

  // Load mock data on mount
  useEffect(() => {
    setChallenges(mockChallenges);
    setRewards(mockRewardsSummary);
  }, [setChallenges, setRewards]);

  const filteredChallenges = challenges.filter((challenge) => {
    if (selectedDifficulty !== 'all' && challenge.difficulty !== selectedDifficulty) {
      return false;
    }
    if (selectedType !== 'all' && challenge.type !== selectedType) {
      return false;
    }
    return true;
  });

  const getDifficultyColor = (difficulty: Challenge['difficulty']) => {
    const colors = {
      easy: '#10b981',
      medium: '#f59e0b',
      hard: '#ef4444',
      expert: '#8b5cf6',
    };
    return colors[difficulty];
  };

  const getTypeLabel = (type: Challenge['type']) => {
    const labels = {
      daily: '📅 Daily',
      weekly: '📆 Weekly',
      seasonal: '🎄 Seasonal',
      special: '⭐ Special',
    };
    return labels[type];
  };

  const handleStartChallenge = (challengeId: string) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    if (challenge.status === 'locked') {
      alert('This challenge is locked. Complete the required prerequisites first!');
      return;
    }

    startChallenge(challengeId);
    navigate(`/cook/${challengeId}`);
  };

  const renderChallengeCard = (challenge: Challenge) => {
    const isLocked = challenge.status === 'locked';
    const isActive = challenge.status === 'in_progress';
    const isCompleted = challenge.status === 'completed';

    return (
      <div
        key={challenge.id}
        className={`challenge-card ${isLocked ? 'locked' : ''} ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
      >
        {challenge.coverUrl && (
          <div
            className="challenge-cover"
            style={{ backgroundImage: `url(${challenge.coverUrl})` }}
          >
            <div className="challenge-type-badge">
              {getTypeLabel(challenge.type)}
            </div>
            {isLocked && (
              <div className="locked-overlay">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
            )}
            {isCompleted && (
              <div className="completed-overlay">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
            )}
          </div>
        )}

        <div className="challenge-content">
          <div className="challenge-header">
            <h3 className="challenge-title">{challenge.title}</h3>
            <div
              className="challenge-difficulty"
              style={{ background: getDifficultyColor(challenge.difficulty) }}
            >
              {challenge.difficulty}
            </div>
          </div>

          <p className="challenge-description">{challenge.description}</p>

          {challenge.recipe && (
            <div className="challenge-meta">
              <div className="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{challenge.recipe.cooking_time} min</span>
              </div>
              <div className="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span>{challenge.participants?.toLocaleString()} joined</span>
              </div>
            </div>
          )}

          {challenge.progress !== undefined && (
            <div className="challenge-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${challenge.progress * 100}%` }}
                />
              </div>
              <span className="progress-label">{Math.round(challenge.progress * 100)}% complete</span>
            </div>
          )}

          <div className="challenge-rewards">
            <div className="reward-item">
              <span className="reward-icon">⭐</span>
              <span>{challenge.rewards.xp} XP</span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">💰</span>
              <span>{challenge.rewards.coins} Coins</span>
            </div>
            {challenge.rewards.badges && challenge.rewards.badges.length > 0 && (
              <div className="reward-item">
                <span className="reward-icon">🏆</span>
                <span>{challenge.rewards.badges.length} Badge{challenge.rewards.badges.length > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {challenge.deadline && (
            <div className="challenge-deadline">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <span>Ends {new Date(challenge.deadline).toLocaleDateString()}</span>
            </div>
          )}

          <button
            className={`challenge-cta ${isActive ? 'continue' : ''}`}
            onClick={() => handleStartChallenge(challenge.id)}
            disabled={isLocked || isCompleted}
          >
            {isLocked && 'Locked'}
            {isCompleted && 'Completed'}
            {isActive && 'Continue'}
            {!isLocked && !isCompleted && !isActive && 'Start Challenge'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="challenges-page">
      {/* Header with rewards summary */}
      <div className="challenges-header">
        <h1 className="challenges-title">Cooking Challenges</h1>
        {rewards && (
          <div className="rewards-summary">
            <XPBar
              level={rewards.level}
              currentXp={rewards.xp}
              nextLevelXp={rewards.nextLevelXp}
              showDetails={false}
            />
            <div className="rewards-row">
              <CoinWallet coins={rewards.coins} onClick={() => navigate('/market')} />
              <StreakFlame
                currentDays={rewards.streak.currentDays}
                freezeTokens={rewards.streak.freezeTokens}
                nextCutoff={rewards.streak.nextCutoff}
              />
            </div>
          </div>
        )}
      </div>

      {/* Active Challenges Section */}
      {activeChallenges.length > 0 && (
        <div className="active-challenges-section">
          <h2 className="section-title">🔥 Your Active Challenges</h2>
          <div className="challenges-grid">
            {activeChallenges.map(renderChallengeCard)}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="challenges-filters">
        <div className="filter-group">
          <label>Type:</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
          >
            <option value="all">All Types</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="seasonal">Seasonal</option>
            <option value="special">Special</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Difficulty:</label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value as typeof selectedDifficulty)}
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>
      </div>

      {/* All Challenges Grid */}
      <div className="challenges-section">
        <h2 className="section-title">All Challenges</h2>
        <div className="challenges-grid">
          {filteredChallenges.length > 0 ? (
            filteredChallenges.map(renderChallengeCard)
          ) : (
            <div className="no-challenges">
              <p>No challenges match your filters</p>
              <button onClick={() => { setSelectedType('all'); setSelectedDifficulty('all'); }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default ChallengesPage;
