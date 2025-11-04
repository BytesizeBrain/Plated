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
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  incrementPage: () => void;
  resetFeed: () => void;
}

export const useFeedStore = create<FeedState>((set) => ({
  posts: [],
  filter: {},
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,

  setPosts: (posts) => set({ posts }),
  addPosts: (posts) => set((state) => ({ posts: [...state.posts, ...posts] })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setHasMore: (hasMore) => set({ hasMore }),
  incrementPage: () => set((state) => ({ currentPage: state.currentPage + 1 })),
  resetFeed: () => set({ posts: [], currentPage: 1, hasMore: true }),
}));


