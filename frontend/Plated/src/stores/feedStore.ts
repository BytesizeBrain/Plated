import { create } from 'zustand';
import type { FeedPost, FeedFilter } from '../types';

interface FeedState {
  posts: FeedPost[];
  filter: FeedFilter;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;

  setPosts: (posts: FeedPost[]) => void;
  addPosts: (posts: FeedPost[]) => void;
  updatePost: (postId: string, updates: Partial<FeedPost>) => void;
  setFilter: (filter: Partial<FeedFilter>) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  incrementPage: () => void;
  resetFeed: () => void;

  // Optimistic updates
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  incrementCommentCount: (postId: string) => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  filter: {
    type: 'for-you',
    sort_by: 'recent',
  },
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,

  setPosts: (posts) => set({ posts }),

  addPosts: (newPosts) => set((state) => ({
    posts: [...state.posts, ...newPosts],
  })),

  updatePost: (postId, updates) => set((state) => ({
    posts: state.posts.map((post) =>
      post.id === postId ? { ...post, ...updates } : post
    ),
  })),

  setFilter: (filter) => set((state) => ({
    filter: { ...state.filter, ...filter },
  })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setHasMore: (hasMore) => set({ hasMore }),

  incrementPage: () => set((state) => ({
    currentPage: state.currentPage + 1,
  })),

  resetFeed: () => set({
    posts: [],
    currentPage: 1,
    hasMore: true,
    error: null,
  }),

  toggleLike: (postId) => set((state) => ({
    posts: state.posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            is_liked: !post.is_liked,
            likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1,
          }
        : post
    ),
  })),

  toggleSave: (postId) => set((state) => ({
    posts: state.posts.map((post) =>
      post.id === postId ? { ...post, is_saved: !post.is_saved } : post
    ),
  })),

  incrementCommentCount: (postId) => set((state) => ({
    posts: state.posts.map((post) =>
      post.id === postId ? { ...post, comments_count: post.comments_count + 1 } : post
    ),
  })),
}));
