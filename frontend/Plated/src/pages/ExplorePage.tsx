import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import { mockFeedPosts } from '../data/mockData';
import PostCard from '../components/feed/PostCard';
import './ExplorePage.css';

function ExplorePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(mockFeedPosts);
  const [isLoading, setIsLoading] = useState(false);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Get search query from URL
  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
    if (query) {
      performSearch(query);
    } else {
      setFilteredPosts(mockFeedPosts);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const filtered = mockFeedPosts.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.description?.toLowerCase().includes(query.toLowerCase()) ||
        post.recipe_data?.ingredients?.some(ingredient => 
          ingredient.toLowerCase().includes(query.toLowerCase())
        ) ||
        post.user.display_name.toLowerCase().includes(query.toLowerCase()) ||
        post.user.username.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPosts(filtered);
      setIsLoading(false);
    }, 500);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="explore-page">
      {/* Header */}
      <header className="explore-header">
        <div className="explore-header-content">
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
          
          <h1>Explore</h1>
          
          <div className="header-spacer"></div>
        </div>
      </header>

      {/* Search Section */}
      <div className="explore-search-section">
        <div className="explore-search-container">
          <form className="explore-search-form" onSubmit={handleSearch}>
            <div className="search-input-container">
              <svg
                className="search-icon"
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
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                placeholder="Search recipes, cuisines, ingredients..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className="search-input"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <main className="explore-content">
        {searchQuery && (
          <div className="search-results-header">
            <h2>
              {isLoading ? 'Searching...' : `${filteredPosts.length} results for "${searchQuery}"`}
            </h2>
          </div>
        )}

        {isLoading ? (
          <div className="explore-loading">
            <div className="loading-spinner"></div>
            <p>Searching recipes...</p>
          </div>
        ) : filteredPosts.length === 0 && searchQuery ? (
          <div className="explore-empty">
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
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <h2>No recipes found</h2>
            <p>Try searching for different ingredients or cuisines</p>
          </div>
        ) : (
          <div className="explore-posts">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {!searchQuery && (
          <div className="explore-suggestions">
            <h2>Popular Searches</h2>
            <div className="suggestion-tags">
              {['pasta', 'chicken', 'dessert', 'italian', 'quick meals', 'healthy', 'vegetarian', 'breakfast'].map((tag) => (
                <button
                  key={tag}
                  className="suggestion-tag"
                  onClick={() => {
                    setSearchQuery(tag);
                    navigate(`/explore?q=${encodeURIComponent(tag)}`);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default ExplorePage;
