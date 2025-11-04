import { useState } from 'react';
import { useFeedStore } from '../../stores/feedStore';
import './FeedFilters.css';

function FeedFilters() {
  const { filter, setFilter } = useFeedStore();
  const [showFilters, setShowFilters] = useState(false);

  const handleTypeChange = (type: 'for-you' | 'following' | 'trending') => {
    setFilter({ type });
  };

  const handleSortChange = (sort_by: 'recent' | 'popular' | 'trending') => {
    setFilter({ sort_by });
  };

  const handleDifficultyChange = (difficulty?: 'easy' | 'medium' | 'hard') => {
    setFilter({ difficulty });
  };

  const handleMaxTimeChange = (max_time?: number) => {
    setFilter({ max_time });
  };

  return (
    <div className="feed-filters">
      {/* Feed Type Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter.type === 'for-you' ? 'active' : ''}`}
          onClick={() => handleTypeChange('for-you')}
        >
          For You
        </button>
        <button
          className={`filter-tab ${filter.type === 'following' ? 'active' : ''}`}
          onClick={() => handleTypeChange('following')}
        >
          Following
        </button>
        <button
          className={`filter-tab ${filter.type === 'trending' ? 'active' : ''}`}
          onClick={() => handleTypeChange('trending')}
        >
          Trending
        </button>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="filter-controls">
        <button
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
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
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
            <line x1="1" y1="14" x2="7" y2="14"></line>
            <line x1="9" y1="8" x2="15" y2="8"></line>
            <line x1="17" y1="16" x2="23" y2="16"></line>
          </svg>
          Filters
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-row">
            <label>Sort By</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter.sort_by === 'recent' ? 'active' : ''}`}
                onClick={() => handleSortChange('recent')}
              >
                Recent
              </button>
              <button
                className={`filter-btn ${filter.sort_by === 'popular' ? 'active' : ''}`}
                onClick={() => handleSortChange('popular')}
              >
                Popular
              </button>
              <button
                className={`filter-btn ${filter.sort_by === 'trending' ? 'active' : ''}`}
                onClick={() => handleSortChange('trending')}
              >
                Trending
              </button>
            </div>
          </div>

          <div className="filter-row">
            <label>Difficulty</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${!filter.difficulty ? 'active' : ''}`}
                onClick={() => handleDifficultyChange(undefined)}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter.difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('easy')}
              >
                Easy
              </button>
              <button
                className={`filter-btn ${filter.difficulty === 'medium' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('medium')}
              >
                Medium
              </button>
              <button
                className={`filter-btn ${filter.difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('hard')}
              >
                Hard
              </button>
            </div>
          </div>

          <div className="filter-row">
            <label>Cooking Time</label>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${!filter.max_time ? 'active' : ''}`}
                onClick={() => handleMaxTimeChange(undefined)}
              >
                Any
              </button>
              <button
                className={`filter-btn ${filter.max_time === 15 ? 'active' : ''}`}
                onClick={() => handleMaxTimeChange(15)}
              >
                Under 15 min
              </button>
              <button
                className={`filter-btn ${filter.max_time === 30 ? 'active' : ''}`}
                onClick={() => handleMaxTimeChange(30)}
              >
                Under 30 min
              </button>
              <button
                className={`filter-btn ${filter.max_time === 60 ? 'active' : ''}`}
                onClick={() => handleMaxTimeChange(60)}
              >
                Under 1 hour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedFilters;
