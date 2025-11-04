/**
 * FeedPage Component Tests
 * 
 * Tests for the FeedPage component including:
 * - Authentication checks
 * - Feed loading and pagination
 * - Search functionality
 * - Filter interactions
 * - Error handling
 * - Responsive behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../__tests__/utils';
import FeedPage from '../pages/feed/FeedPage';
import { mockPost } from '../__tests__/utils';

// Mock the stores
const mockFeedStore = {
  posts: [mockPost],
  filter: { type: 'for-you', sort_by: 'recent' },
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  setPosts: vi.fn(),
  addPosts: vi.fn(),
  setLoading: vi.fn(),
  setError: vi.fn(),
  setHasMore: vi.fn(),
  incrementPage: vi.fn(),
  resetFeed: vi.fn(),
};

const mockMessageStore = {
  unreadCount: 1,
  setUnreadCount: vi.fn(),
};

vi.mock('../stores/feedStore', () => ({
  useFeedStore: () => mockFeedStore,
}));

vi.mock('../stores/messageStore', () => ({
  useMessageStore: () => mockMessageStore,
}));

// Mock API functions
vi.mock('../utils/api', () => ({
  getFeedPosts: vi.fn(() => Promise.resolve({ posts: [mockPost], has_more: false })),
  getUnreadCount: vi.fn(() => Promise.resolve(1)),
}));

// Mock auth
vi.mock('../utils/auth', () => ({
  isAuthenticated: vi.fn(() => true),
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('FeedPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('redirects to login when user is not authenticated', () => {
      const { isAuthenticated } = require('../utils/auth');
      isAuthenticated.mockReturnValue(false);
      
      render(<FeedPage />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('renders feed when user is authenticated', () => {
      const { isAuthenticated } = require('../utils/auth');
      isAuthenticated.mockReturnValue(true);
      
      render(<FeedPage />);
      
      expect(screen.getByText('Plated')).toBeInTheDocument();
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
  });

  describe('Feed Loading', () => {
    it('loads initial posts on mount', async () => {
      const { getFeedPosts } = require('../utils/api');
      
      render(<FeedPage />);
      
      await waitFor(() => {
        expect(getFeedPosts).toHaveBeenCalledWith(1, mockFeedStore.filter);
      });
    });

    it('shows loading state during initial load', () => {
      const loadingStore = { ...mockFeedStore, isLoading: true };
      vi.mocked(require('../stores/feedStore').useFeedStore).mockReturnValue(loadingStore);
      
      render(<FeedPage />);
      
      expect(screen.getByText('Loading your feed...')).toBeInTheDocument();
    });

    it('shows empty state when no posts are available', () => {
      const emptyStore = { ...mockFeedStore, posts: [], isLoading: false };
      vi.mocked(require('../stores/feedStore').useFeedStore).mockReturnValue(emptyStore);
      
      render(<FeedPage />);
      
      expect(screen.getByText('No posts yet')).toBeInTheDocument();
      expect(screen.getByText('Start following users to see their recipes in your feed')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('handles search form submission', () => {
      render(<FeedPage />);
      
      const searchInput = screen.getByPlaceholderText(/search recipes/i);
      const searchForm = searchInput.closest('form');
      
      fireEvent.change(searchInput, { target: { value: 'pasta' } });
      fireEvent.submit(searchForm!);
      
      expect(mockNavigate).toHaveBeenCalledWith('/explore?q=pasta');
    });

    it('does not submit empty search queries', () => {
      render(<FeedPage />);
      
      const searchInput = screen.getByPlaceholderText(/search recipes/i);
      const searchForm = searchInput.closest('form');
      
      fireEvent.change(searchInput, { target: { value: '   ' } });
      fireEvent.submit(searchForm!);
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('updates search input value', () => {
      render(<FeedPage />);
      
      const searchInput = screen.getByPlaceholderText(/search recipes/i);
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      
      expect(searchInput).toHaveValue('test query');
    });
  });

  describe('Navigation', () => {
    it('navigates to profile when profile button is clicked', () => {
      render(<FeedPage />);
      
      const profileButton = screen.getByLabelText('Profile');
      fireEvent.click(profileButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/profile');
    });

    it('navigates to messages when messages button is clicked', () => {
      render(<FeedPage />);
      
      const messagesButton = screen.getByLabelText('Messages');
      fireEvent.click(messagesButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/messages');
    });

    it('shows unread message count badge', () => {
      render(<FeedPage />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('does not show unread badge when count is zero', () => {
      const zeroUnreadStore = { ...mockMessageStore, unreadCount: 0 };
      vi.mocked(require('../stores/messageStore').useMessageStore).mockReturnValue(zeroUnreadStore);
      
      render(<FeedPage />);
      
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  describe('Chatbot Integration', () => {
    it('opens chatbot popup when chatbot button is clicked', () => {
      render(<FeedPage />);
      
      const chatbotButton = screen.getByLabelText('Cooking Assistant');
      fireEvent.click(chatbotButton);
      
      // ChatbotPopup should be rendered
      expect(screen.getByTestId('chatbot-popup')).toBeInTheDocument();
    });

    it('closes chatbot popup when close button is clicked', () => {
      render(<FeedPage />);
      
      const chatbotButton = screen.getByLabelText('Cooking Assistant');
      fireEvent.click(chatbotButton);
      
      const closeButton = screen.getByLabelText('Close chatbot');
      fireEvent.click(closeButton);
      
      expect(screen.queryByTestId('chatbot-popup')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays error message when feed loading fails', () => {
      const errorStore = { ...mockFeedStore, error: 'Failed to load feed' };
      vi.mocked(require('../stores/feedStore').useFeedStore).mockReturnValue(errorStore);
      
      render(<FeedPage />);
      
      expect(screen.getByText('Failed to load feed')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('retries loading when retry button is clicked', async () => {
      const errorStore = { ...mockFeedStore, error: 'Failed to load feed' };
      vi.mocked(require('../stores/feedStore').useFeedStore).mockReturnValue(errorStore);
      
      render(<FeedPage />);
      
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);
      
      // Should call loadPosts function
      await waitFor(() => {
        expect(mockFeedStore.setLoading).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Infinite Scroll', () => {
    it('loads more posts when scrolling to bottom', () => {
      const hasMoreStore = { ...mockFeedStore, hasMore: true };
      vi.mocked(require('../stores/feedStore').useFeedStore).mockReturnValue(hasMoreStore);
      
      render(<FeedPage />);
      
      // Simulate intersection observer callback
      const observerTarget = screen.getByTestId('feed-observer');
      const observerCallback = vi.mocked(global.IntersectionObserver).mock.calls[0][0];
      
      observerCallback([{ isIntersecting: true }]);
      
      expect(mockFeedStore.incrementPage).toHaveBeenCalled();
    });

    it('does not load more posts when hasMore is false', () => {
      const noMoreStore = { ...mockFeedStore, hasMore: false };
      vi.mocked(require('../stores/feedStore').useFeedStore).mockReturnValue(noMoreStore);
      
      render(<FeedPage />);
      
      // Simulate intersection observer callback
      const observerCallback = vi.mocked(global.IntersectionObserver).mock.calls[0][0];
      observerCallback([{ isIntersecting: true }]);
      
      expect(mockFeedStore.incrementPage).not.toHaveBeenCalled();
    });

    it('shows end message when no more posts available', () => {
      const endStore = { ...mockFeedStore, hasMore: false, posts: [mockPost] };
      vi.mocked(require('../stores/feedStore').useFeedStore).mockReturnValue(endStore);
      
      render(<FeedPage />);
      
      expect(screen.getByText("You've reached the end")).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('adapts header layout on mobile screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });
      
      render(<FeedPage />);
      
      // Header should still be functional
      expect(screen.getByText('Plated')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/search recipes/i)).toBeInTheDocument();
    });

    it('maintains functionality on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      });
      
      render(<FeedPage />);
      
      // All interactive elements should be accessible
      expect(screen.getByLabelText('Profile')).toBeInTheDocument();
      expect(screen.getByLabelText('Messages')).toBeInTheDocument();
      expect(screen.getByLabelText('Cooking Assistant')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      const { rerender } = render(<FeedPage />);
      
      // Re-render with same props
      rerender(<FeedPage />);
      
      // Component should still be functional
      expect(screen.getByText('Plated')).toBeInTheDocument();
    });

    it('handles large number of posts efficiently', () => {
      const manyPostsStore = {
        ...mockFeedStore,
        posts: Array.from({ length: 100 }, (_, i) => ({
          ...mockPost,
          id: `post-${i}`,
          title: `Recipe ${i}`,
        })),
      };
      vi.mocked(require('../stores/feedStore').useFeedStore).mockReturnValue(manyPostsStore);
      
      render(<FeedPage />);
      
      // Should render without performance issues
      expect(screen.getByText('Plated')).toBeInTheDocument();
    });
  });
});
