import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedStore } from '../stores/feedStore';
import { mockFeedPosts } from '../data/mockData';
import PostCard from '../components/feed/PostCard';
import './SavedPostsPage.css';

function SavedPostsPage() {
  const navigate = useNavigate();
  const { posts } = useFeedStore();
  const [savedPosts, setSavedPosts] = useState(posts.filter(p => p.is_saved));
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'popular'>('recent');

  useEffect(() => {
    // In development, use mock data that's marked as saved
    const mockSavedPosts = mockFeedPosts.filter(p => p.is_saved);
    setSavedPosts(mockSavedPosts);
  }, []);

  const sortedPosts = [...savedPosts].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'popular':
        return b.likes_count - a.likes_count;
      default:
        return 0;
    }
  });

  return (
    <div className="saved-posts-page">
      {/* Header */}
      <header className="saved-header">
        <button
          className="back-btn"
          onClick={() => navigate('/feed')}
          aria-label="Back to feed"
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
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <h1 className="saved-title">Saved Recipes</h1>
        <div className="header-spacer"></div>
      </header>

      {/* Filters */}
      <div className="saved-filters">
        <div className="saved-count">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          <span>{savedPosts.length} {savedPosts.length === 1 ? 'recipe' : 'recipes'} saved</span>
        </div>

        <div className="sort-dropdown">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <main className="saved-content">
        {sortedPosts.length === 0 ? (
          <div className="saved-empty">
            <div className="empty-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h2>No Saved Recipes Yet</h2>
            <p>
              Start saving recipes you love by tapping the bookmark icon on any post
            </p>
            <button
              className="browse-btn"
              onClick={() => navigate('/feed')}
            >
              Browse Recipes
            </button>
          </div>
        ) : (
          <div className="saved-grid">
            {sortedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default SavedPostsPage;
