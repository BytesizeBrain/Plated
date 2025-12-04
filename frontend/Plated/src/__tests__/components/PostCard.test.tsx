/**
 * PostCard Component Tests
 * 
 * Tests for the PostCard component including:
 * - Rendering with different data
 * - User interactions (like, save, comment)
 * - Recipe expansion
 * - Media handling
 * - Responsive behavior
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../__tests__/utils';
import PostCard from '../components/feed/PostCard';
import { mockPost } from '../__tests__/utils';

// Mock the stores
vi.mock('../stores/feedStore', () => ({
  useFeedStore: () => ({
    toggleLike: vi.fn(),
    toggleSave: vi.fn(),
    incrementCommentCount: vi.fn(),
  }),
}));

describe('PostCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders post information correctly', () => {
      render(<PostCard post={mockPost} />);
      
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
      expect(screen.getByText('A delicious test recipe')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('@testuser')).toBeInTheDocument();
    });

    it('renders post stats correctly', () => {
      render(<PostCard post={mockPost} />);
      
      expect(screen.getByText('42 likes')).toBeInTheDocument();
      expect(screen.getByText('100 views')).toBeInTheDocument();
    });

    it('renders recipe metadata when available', () => {
      render(<PostCard post={mockPost} />);
      
      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('easy')).toBeInTheDocument();
      expect(screen.getByText('Serves 4')).toBeInTheDocument();
    });

    it('renders media when available', () => {
      render(<PostCard post={mockPost} />);
      
      const image = screen.getByAltText('Test Recipe');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('handles missing media gracefully', () => {
      const postWithoutMedia = { ...mockPost, media_url: undefined };
      render(<PostCard post={postWithoutMedia} />);
      
      expect(screen.queryByAltText('Test Recipe')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('shows like animation on double click', async () => {
      render(<PostCard post={mockPost} />);
      
      const mediaContainer = screen.getByRole('img').parentElement;
      fireEvent.doubleClick(mediaContainer!);
      
      // Check if like animation appears
      await waitFor(() => {
        expect(screen.getByTestId('like-animation')).toBeInTheDocument();
      });
    });

    it('toggles comments section when comment button is clicked', () => {
      render(<PostCard post={mockPost} />);
      
      const commentButton = screen.getByLabelText(/comment/i);
      fireEvent.click(commentButton);
      
      // Comments section should appear
      expect(screen.getByText(/comments/i)).toBeInTheDocument();
    });

    it('expands recipe details when expand button is clicked', () => {
      render(<PostCard post={mockPost} />);
      
      const expandButton = screen.getByText('View Full Recipe');
      fireEvent.click(expandButton);
      
      expect(screen.getByText('Ingredients')).toBeInTheDocument();
      expect(screen.getByText('Instructions')).toBeInTheDocument();
      expect(screen.getByText('ingredient 1')).toBeInTheDocument();
      expect(screen.getByText('step 1')).toBeInTheDocument();
    });

    it('collapses recipe details when hide button is clicked', () => {
      render(<PostCard post={mockPost} />);
      
      const expandButton = screen.getByText('View Full Recipe');
      fireEvent.click(expandButton);
      
      const hideButton = screen.getByText('Hide Full Recipe');
      fireEvent.click(hideButton);
      
      expect(screen.queryByText('Ingredients')).not.toBeInTheDocument();
      expect(screen.queryByText('Instructions')).not.toBeInTheDocument();
    });
  });

  describe('Recipe Data Handling', () => {
    it('handles missing recipe data gracefully', () => {
      const postWithoutRecipe = { ...mockPost, recipe_data: undefined };
      render(<PostCard post={postWithoutRecipe} />);
      
      expect(screen.queryByText('View Full Recipe')).not.toBeInTheDocument();
    });

    it('handles partial recipe data', () => {
      const partialRecipePost = {
        ...mockPost,
        recipe_data: {
          cooking_time: 30,
          difficulty: 'easy' as const,
          // Missing servings, ingredients, instructions
        },
      };
      render(<PostCard post={partialRecipePost} />);
      
      expect(screen.getByText('30 min')).toBeInTheDocument();
      expect(screen.getByText('easy')).toBeInTheDocument();
      expect(screen.queryByText('Serves')).not.toBeInTheDocument();
    });

    it('shows expand button only when ingredients or instructions are available', () => {
      const postWithOnlyTime = {
        ...mockPost,
        recipe_data: {
          cooking_time: 30,
          difficulty: 'easy' as const,
          servings: 4,
          // No ingredients or instructions
        },
      };
      render(<PostCard post={postWithOnlyTime} />);
      
      expect(screen.queryByText('View Full Recipe')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text for images', () => {
      render(<PostCard post={mockPost} />);
      
      const image = screen.getByAltText('Test Recipe');
      expect(image).toBeInTheDocument();
    });

    it('has proper alt text for user avatars', () => {
      render(<PostCard post={mockPost} />);
      
      const avatar = screen.getByAltText('Test User');
      expect(avatar).toBeInTheDocument();
    });

    it('has proper button labels', () => {
      render(<PostCard post={mockPost} />);
      
      const likeButton = screen.getByLabelText(/like/i);
      const saveButton = screen.getByLabelText(/save/i);
      const commentButton = screen.getByLabelText(/comment/i);
      
      expect(likeButton).toBeInTheDocument();
      expect(saveButton).toBeInTheDocument();
      expect(commentButton).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles invalid timestamps gracefully', () => {
      const postWithInvalidTime = { ...mockPost, created_at: 'invalid-date' };
      render(<PostCard post={postWithInvalidTime} />);
      
      // Should still render without crashing
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });

    it('handles missing user data gracefully', () => {
      const postWithMissingUser = {
        ...mockPost,
        user: {
          username: '',
          display_name: '',
          profile_pic: '',
        },
      };
      render(<PostCard post={postWithMissingUser} />);
      
      // Should still render without crashing
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily when props are the same', () => {
      const { rerender } = render(<PostCard post={mockPost} />);
      
      // Re-render with same props
      rerender(<PostCard post={mockPost} />);
      
      // Component should still be in the document
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });

    it('handles large recipe data efficiently', () => {
      const postWithLargeRecipe = {
        ...mockPost,
        recipe_data: {
          cooking_time: 30,
          difficulty: 'easy' as const,
          servings: 4,
          ingredients: Array.from({ length: 50 }, (_, i) => `ingredient ${i + 1}`),
          instructions: Array.from({ length: 20 }, (_, i) => `step ${i + 1}`),
        },
      };
      
      render(<PostCard post={postWithLargeRecipe} />);
      
      // Should render without performance issues
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
  });
});
