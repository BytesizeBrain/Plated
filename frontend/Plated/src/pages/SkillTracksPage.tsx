import React, { useEffect } from 'react';
import { useGamificationStore } from '../stores/gamificationStore';
import BottomNav from '../components/navigation/BottomNav';
import './SkillTracksPage.css';

// Skill track category icons mapping
const TRACK_ICONS: Record<string, string> = {
  'breakfast': '🍳',
  'lunch': '🥗',
  'dinner': '🍝',
  'dessert': '🍰',
  'baking': '🥐',
  'grilling': '🔥',
  'vegetarian': '🥬',
  'seafood': '🦐',
  'asian': '🍜',
  'italian': '🍕',
  'mexican': '🌮',
  'healthy': '💪',
  'quick': '⚡',
  'comfort': '🏠',
  'default': '👨‍🍳',
};

const getTrackIcon = (slug: string, icon?: string): string => {
  if (icon) return icon;
  const lowerSlug = slug?.toLowerCase() || '';
  for (const [key, value] of Object.entries(TRACK_ICONS)) {
    if (lowerSlug.includes(key)) return value;
  }
  return TRACK_ICONS.default;
};

export const SkillTracksPage: React.FC = () => {
  const { skillTracks, fetchSkillTracks, isLoading } = useGamificationStore();

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    fetchSkillTracks(storedUserId || undefined);
  }, [fetchSkillTracks]);

  // Calculate overall stats
  const totalTracks = skillTracks.length;
  const completedTracks = skillTracks.filter(t => t.completedAt).length;
  const totalRecipes = skillTracks.reduce((sum, t) => sum + t.totalRecipes, 0);
  const completedRecipes = skillTracks.reduce((sum, t) => sum + t.completedRecipes, 0);

  if (isLoading && skillTracks.length === 0) {
    return (
      <div className="skill-tracks-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your cooking journey...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="skill-tracks-page">
      {/* Hero Section */}
      <div className="tracks-hero">
        <div className="hero-content">
          <div className="hero-badge">🏆 Skill Tracks</div>
          <h1 className="hero-title">Master Your Culinary Skills</h1>
          <p className="hero-subtitle">
            Complete recipe collections, unlock achievements, and become a kitchen master
          </p>
        </div>
        <div className="hero-illustration">
          <div className="floating-icons">
            <span className="float-icon icon-1">🍳</span>
            <span className="float-icon icon-2">🥘</span>
            <span className="float-icon icon-3">🍰</span>
            <span className="float-icon icon-4">🥗</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <span className="stat-value">{totalTracks}</span>
            <span className="stat-label">Total Tracks</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-value">{completedTracks}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🍽️</div>
          <div className="stat-content">
            <span className="stat-value">{completedRecipes}/{totalRecipes}</span>
            <span className="stat-label">Recipes Done</span>
          </div>
        </div>
        <div className="stat-card accent">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <span className="stat-value">{Math.round((completedRecipes / Math.max(totalRecipes, 1)) * 100)}%</span>
            <span className="stat-label">Overall Progress</span>
          </div>
        </div>
      </div>

      {/* Tracks Section */}
      <div className="tracks-section">
        <div className="section-header">
          <h2 className="section-title">Your Cooking Journey</h2>
          <p className="section-subtitle">Choose a track and start cooking!</p>
        </div>

        {skillTracks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-illustration">
              <div className="empty-circle">
                <span className="empty-icon">🍳</span>
              </div>
              <div className="empty-sparkles">
                <span>✨</span>
                <span>✨</span>
                <span>✨</span>
              </div>
            </div>
            <h3 className="empty-title">No Skill Tracks Available Yet</h3>
            <p className="empty-description">
              We're cooking up some exciting challenges for you! Check back soon for new skill tracks to master.
            </p>
            <button className="empty-cta" onClick={() => window.location.href = '/feed'}>
              Explore Recipes
            </button>
          </div>
        ) : (
          <div className="tracks-grid">
            {skillTracks.map((track, index) => {
              const progress =
                track.totalRecipes === 0
                  ? 0
                  : Math.round((track.completedRecipes / track.totalRecipes) * 100);
              const isComplete = track.completedAt !== null && track.completedAt !== undefined;
              const isStarted = track.completedRecipes > 0;

              return (
                <div
                  key={track.id}
                  className={`track-card ${isComplete ? 'completed' : ''} ${isStarted && !isComplete ? 'in-progress' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Card Glow Effect */}
                  <div className="card-glow"></div>
                  
                  {/* Status Badge */}
                  {isComplete && (
                    <div className="status-badge completed">
                      <span>✓ Mastered</span>
                    </div>
                  )}
                  {isStarted && !isComplete && (
                    <div className="status-badge in-progress">
                      <span>🔥 In Progress</span>
                    </div>
                  )}

                  {/* Track Icon */}
                  <div className="track-icon-wrapper">
                    <div className="track-icon-bg"></div>
                    <span className="track-icon">{getTrackIcon(track.slug, track.icon)}</span>
                  </div>

                  {/* Track Info */}
                  <div className="track-info">
                    <h3 className="track-name">{track.name}</h3>
                    {track.description && (
                      <p className="track-description">{track.description}</p>
                    )}
                  </div>

                  {/* Progress Section */}
                  <div className="track-progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Progress</span>
                      <span className="progress-value">{progress}%</span>
                    </div>
                    <div className="progress-bar-container">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progress}%` }}
                      >
                        <div className="progress-shine"></div>
                      </div>
                    </div>
                    <div className="progress-details">
                      <span className="recipes-count">
                        <span className="count-current">{track.completedRecipes}</span>
                        <span className="count-separator">/</span>
                        <span className="count-total">{track.totalRecipes}</span>
                        <span className="count-label">recipes</span>
                      </span>
                      {isComplete && track.completedAt && (
                        <span className="completion-date">
                          Completed {new Date(track.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Track Footer */}
                  <div className="track-footer">
                    <div className="track-rewards">
                      <span className="reward-badge">
                        <span className="reward-icon">🪙</span>
                        <span>50 coins</span>
                      </span>
                      <span className="reward-badge">
                        <span className="reward-icon">🏅</span>
                        <span>Badge</span>
                      </span>
                    </div>
                    <button className="track-action-btn" disabled={isComplete}>
                      {isComplete ? 'Completed' : isStarted ? 'Continue' : 'Start Track'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rewards Info Section */}
      <div className="rewards-section">
        <div className="rewards-header">
          <h2 className="rewards-title">🎁 Earn Rewards</h2>
          <p className="rewards-subtitle">Complete recipes and tracks to unlock amazing rewards</p>
        </div>
        <div className="rewards-grid">
          <div className="reward-card">
            <div className="reward-card-icon">🪙</div>
            <div className="reward-card-content">
              <span className="reward-card-value">+10</span>
              <span className="reward-card-label">Coins per recipe</span>
            </div>
          </div>
          <div className="reward-card">
            <div className="reward-card-icon">⭐</div>
            <div className="reward-card-content">
              <span className="reward-card-value">+15</span>
              <span className="reward-card-label">XP per recipe</span>
            </div>
          </div>
          <div className="reward-card featured">
            <div className="reward-card-icon">🎉</div>
            <div className="reward-card-content">
              <span className="reward-card-value">+50</span>
              <span className="reward-card-label">Bonus for track completion!</span>
            </div>
            <div className="reward-card-glow"></div>
          </div>
          <div className="reward-card">
            <div className="reward-card-icon">🏆</div>
            <div className="reward-card-content">
              <span className="reward-card-value">Exclusive</span>
              <span className="reward-card-label">Badges & achievements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
