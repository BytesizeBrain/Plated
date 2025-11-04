/**
 * Test Utilities
 * 
 * Common utilities and helpers for testing React components.
 */

import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { vi } from 'vitest';

// Mock data for testing
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  display_name: 'Test User',
  profile_pic: 'https://example.com/avatar.jpg',
};

export const mockPost = {
  id: 'post-1',
  user_id: 'user-1',
  user: {
    username: 'testuser',
    display_name: 'Test User',
    profile_pic: 'https://example.com/avatar.jpg',
  },
  title: 'Test Recipe',
  description: 'A delicious test recipe',
  media_url: 'https://example.com/image.jpg',
  media_type: 'image' as const,
  recipe_data: {
    cooking_time: 30,
    difficulty: 'easy' as const,
    servings: 4,
    ingredients: ['ingredient 1', 'ingredient 2'],
    instructions: ['step 1', 'step 2'],
  },
  likes_count: 42,
  comments_count: 5,
  views_count: 100,
  is_liked: false,
  is_saved: false,
  created_at: '2023-12-25T10:00:00Z',
};

export const mockComment = {
  id: 'comment-1',
  post_id: 'post-1',
  user_id: 'user-1',
  user: {
    username: 'testuser',
    display_name: 'Test User',
    profile_pic: 'https://example.com/avatar.jpg',
  },
  content: 'Great recipe!',
  created_at: '2023-12-25T10:30:00Z',
};

export const mockConversation = {
  id: 'conv-1',
  participant_ids: ['user-1', 'user-2'],
  participants: [
    {
      id: 'user-1',
      username: 'testuser',
      display_name: 'Test User',
      profile_pic: 'https://example.com/avatar.jpg',
    },
    {
      id: 'user-2',
      username: 'otheruser',
      display_name: 'Other User',
      profile_pic: 'https://example.com/avatar2.jpg',
    },
  ],
  last_message: {
    id: 'msg-1',
    conversation_id: 'conv-1',
    sender_id: 'user-2',
    sender: {
      username: 'otheruser',
      display_name: 'Other User',
      profile_pic: 'https://example.com/avatar2.jpg',
    },
    content: 'Hello!',
    created_at: '2023-12-25T10:00:00Z',
    is_read: false,
    status: 'delivered' as const,
  },
  unread_count: 1,
  updated_at: '2023-12-25T10:00:00Z',
};

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock API functions
export const mockApiFunctions = {
  getFeedPosts: vi.fn(() => Promise.resolve({ posts: [mockPost], has_more: false })),
  likePost: vi.fn(() => Promise.resolve()),
  unlikePost: vi.fn(() => Promise.resolve()),
  savePost: vi.fn(() => Promise.resolve()),
  unsavePost: vi.fn(() => Promise.resolve()),
  getPostComments: vi.fn(() => Promise.resolve([mockComment])),
  addComment: vi.fn(() => Promise.resolve(mockComment)),
  getConversations: vi.fn(() => Promise.resolve([mockConversation])),
  getConversationMessages: vi.fn(() => Promise.resolve([])),
  sendMessage: vi.fn(() => Promise.resolve()),
  getUserProfile: vi.fn(() => Promise.resolve(mockUser)),
  updateUser: vi.fn(() => Promise.resolve()),
  checkUsername: vi.fn(() => Promise.resolve(true)),
  getUnreadCount: vi.fn(() => Promise.resolve(1)),
};

// Mock auth functions
export const mockAuthFunctions = {
  isAuthenticated: vi.fn(() => true),
  getToken: vi.fn(() => 'mock-token'),
  setToken: vi.fn(),
  removeToken: vi.fn(),
  getUserFromToken: vi.fn(() => mockUser),
};

// Helper to create mock store state
export const createMockFeedState = (overrides = {}) => ({
  posts: [mockPost],
  filter: { type: 'for-you', sort_by: 'recent' },
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  ...overrides,
});

export const createMockMessageState = (overrides = {}) => ({
  conversations: [mockConversation],
  currentConversation: null,
  messages: {},
  unreadCount: 1,
  typingIndicators: {},
  isLoading: false,
  error: null,
  ...overrides,
});
