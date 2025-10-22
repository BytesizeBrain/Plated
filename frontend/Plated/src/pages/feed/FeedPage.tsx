import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFeedStore } from '../../stores/feedStore';
import { useMessageStore } from '../../stores/messageStore';
import { getFeedPosts, getUnreadCount } from '../../utils/api';
import { isAuthenticated } from '../../utils/auth';
import PostCard from '../../components/feed/PostCard';
import FeedFilters from '../../components/feed/FeedFilters';
import './FeedPage.css';

function FeedPage() {
  const navigate = useNavigate();
  const {
    posts,
    filter,
    isLoading,
    error,
    hasMore,
    currentPage,
    setPosts,
    addPosts,
    setLoading,
    setError,
    setHasMore,
    incrementPage,
    resetFeed,
  } = useFeedStore();

  const { unreadCount, setUnreadCount } = useMessageStore();
  const [initialLoad, setInitialLoad] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch unread count:', err);
      }
    };
    fetchUnreadCount();
  }, [setUnreadCount]);

  // Load posts
  const loadPosts = useCallback(async () => {
    if (isLoading) return;

    try {
      setLoading(true);
      setError(null);

      const { posts: newPosts, has_more } = await getFeedPosts(currentPage, filter);

      if (currentPage === 1) {
        setPosts(newPosts);
      } else {
        addPosts(newPosts);
      }

      setHasMore(has_more);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load feed');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [currentPage, filter, isLoading, setPosts, addPosts, setLoading, setError, setHasMore]);

  // Load initial posts
  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  // Reset feed when filter changes
  useEffect(() => {
    resetFeed();
  }, [filter.type, filter.cuisine, filter.difficulty, filter.max_time, filter.sort_by]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          incrementPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, incrementPage]);

  return (
    <div className="feed-page">
      {/* Header */}
      <header className="feed-header">
        <div className="feed-header-content">
          <h1 className="feed-logo">Plated</h1>
          <nav className="feed-nav">
            <button
              className="nav-icon-btn"
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
            </button>
            <button
              className="nav-icon-btn dm-icon"
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
              {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </button>
          </nav>
        </div>
      </header>

      {/* Filters */}
      <FeedFilters />

      {/* Feed Content */}
      <main className="feed-content">
        {error && (
          <div className="feed-error">
            <p>{error}</p>
            <button onClick={() => loadPosts()}>Try Again</button>
          </div>
        )}

        {initialLoad && isLoading ? (
          <div className="feed-loading">
            <div className="loading-spinner"></div>
            <p>Loading your feed...</p>
          </div>
        ) : posts.length === 0 && !isLoading ? (
          <div className="feed-empty">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <h2>No posts yet</h2>
            <p>Start following users to see their recipes in your feed</p>
          </div>
        ) : (
          <>
            <div className="feed-posts">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Infinite scroll trigger */}
            {hasMore && (
              <div ref={observerTarget} className="feed-observer">
                {isLoading && (
                  <div className="loading-more">
                    <div className="loading-spinner-small"></div>
                  </div>
                )}
              </div>
            )}

            {!hasMore && posts.length > 0 && (
              <div className="feed-end">
                <p>You've reached the end</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default FeedPage;
