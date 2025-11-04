import { useState } from 'react';
import type { Badge } from '../../types';
import './BadgeGrid.css';

interface BadgeGridProps {
  badges: Badge[];
  maxDisplay?: number;
}

function BadgeGrid({ badges, maxDisplay }: BadgeGridProps) {
  const [filter, setFilter] = useState<'all' | Badge['kind']>('all');

  const filteredBadges = filter === 'all'
    ? badges
    : badges.filter(b => b.kind === filter);

  const displayBadges = maxDisplay
    ? filteredBadges.slice(0, maxDisplay)
    : filteredBadges;

  const renderBadgeCard = (badge: Badge) => {
    const isEarned = !!badge.earnedAt;
    const hasProgress = badge.progress !== undefined && badge.total !== undefined;

    return (
      <div
        key={badge.id}
        className={`badge-card ${isEarned ? 'earned' : 'locked'}`}
        title={badge.description}
      >
        <div className="badge-icon">
          {badge.iconUrl}
        </div>
        <div className="badge-info">
          <div className="badge-name">{badge.name}</div>
          {hasProgress && !isEarned && (
            <div className="badge-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(badge.progress! / badge.total!) * 100}%` }}
                />
              </div>
              <div className="progress-text">
                {badge.progress}/{badge.total}
              </div>
            </div>
          )}
          {isEarned && badge.earnedAt && (
            <div className="badge-earned">
              {new Date(badge.earnedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="badge-grid-container">
      <div className="badge-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${filter === 'technique' ? 'active' : ''}`}
          onClick={() => setFilter('technique')}
        >
          Techniques
        </button>
        <button
          className={`filter-btn ${filter === 'cuisine' ? 'active' : ''}`}
          onClick={() => setFilter('cuisine')}
        >
          Cuisines
        </button>
        <button
          className={`filter-btn ${filter === 'event' ? 'active' : ''}`}
          onClick={() => setFilter('event')}
        >
          Events
        </button>
        <button
          className={`filter-btn ${filter === 'streak' ? 'active' : ''}`}
          onClick={() => setFilter('streak')}
        >
          Streaks
        </button>
        <button
          className={`filter-btn ${filter === 'mastery' ? 'active' : ''}`}
          onClick={() => setFilter('mastery')}
        >
          Mastery
        </button>
      </div>

      <div className="badge-grid">
        {displayBadges.length > 0 ? (
          displayBadges.map(renderBadgeCard)
        ) : (
          <div className="badge-empty">
            <p>No badges in this category yet</p>
            <p className="badge-empty-hint">Complete challenges to earn badges!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default BadgeGrid;
