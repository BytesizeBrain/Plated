import axios from 'axios';
import { getToken, removeToken } from './auth';
import { mockFeedPosts, mockConversations, mockCurrentUser } from '../data/mockData';
import { mockChallenges, mockRewardsSummary } from '../data/mockGamificationData';
import type {
  RegisterData,
  UpdateUserData,
  CheckUsernameResponse,
  UserProfile,
  FeedPost,
  Comment,
  Conversation,
  Message,
  SendMessageData,
  FeedFilter,
  Challenge,
  RewardSummary
} from '../types';

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401, remove the token and redirect to login
    // But only if we're not already on the login page
    if (error.response?.status === 401) {
      removeToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Register a new user after OAuth
 */
export const registerUser = async (data: RegisterData): Promise<void> => {
  await api.post('/api/user/register', data);
};

/**
 * Get current user's profile
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  // Use mock data in development
  if (import.meta.env.DEV) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockCurrentUser), 500);
    });
  }
  
  const response = await api.get<UserProfile>('/api/user/profile');
  return response.data;
};

/**
 * Update user profile
 */
export const updateUser = async (data: UpdateUserData): Promise<void> => {
  await api.put('/api/user/update', data);
};

/**
 * Check if a username is available
 */
export const checkUsername = async (username: string): Promise<boolean> => {
  const response = await api.get<CheckUsernameResponse>('/api/user/check_username', {
    params: { username },
  });
  return !response.data.exists; // Return true if username is available
};

// ===== FEED API =====

/**
 * Get feed posts with pagination
 */
export const getFeedPosts = async (page: number = 1, filter?: FeedFilter): Promise<{ posts: FeedPost[], has_more: boolean }> => {
  // Use mock data in development
  if (import.meta.env.DEV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const startIndex = (page - 1) * 10;
        const endIndex = startIndex + 10;
        const posts = mockFeedPosts.slice(startIndex, endIndex);
        const hasMore = endIndex < mockFeedPosts.length;
        resolve({ posts, has_more: hasMore });
      }, 800);
    });
  }
  
  const response = await api.get('/api/feed', {
    params: {
      page,
      limit: 10,
      type: filter?.type,
      cuisine: filter?.cuisine,
      difficulty: filter?.difficulty,
      max_time: filter?.max_time,
      sort_by: filter?.sort_by,
    },
  });
  return response.data;
};

/**
 * Like a post
 */
export const likePost = async (postId: string): Promise<void> => {
  await api.post(`/api/posts/${postId}/like`);
};

/**
 * Unlike a post
 */
export const unlikePost = async (postId: string): Promise<void> => {
  await api.post(`/api/posts/${postId}/unlike`);
};

/**
 * Save a post
 */
export const savePost = async (postId: string): Promise<void> => {
  await api.post(`/api/posts/${postId}/save`);
};

/**
 * Unsave a post
 */
export const unsavePost = async (postId: string): Promise<void> => {
  await api.post(`/api/posts/${postId}/unsave`);
};

/**
 * Get comments for a post
 */
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  const response = await api.get<Comment[]>(`/api/posts/${postId}/comments`);
  return response.data;
};

/**
 * Add a comment to a post
 */
export const addComment = async (postId: string, content: string): Promise<Comment> => {
  const response = await api.post<Comment>(`/api/posts/${postId}/comments`, { content });
  return response.data;
};

/**
 * Share a post
 */
export const sharePost = async (postId: string): Promise<void> => {
  await api.post(`/api/posts/${postId}/share`);
};

// ===== MESSAGES API =====

/**
 * Get all conversations for the current user
 */
export const getConversations = async (): Promise<Conversation[]> => {
  // Use mock data in development
  if (import.meta.env.DEV) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockConversations), 600);
    });
  }
  
  const response = await api.get<Conversation[]>('/api/messages/conversations');
  return response.data;
};

/**
 * Get messages for a specific conversation
 */
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  const response = await api.get<Message[]>(`/api/messages/conversations/${conversationId}`);
  return response.data;
};

/**
 * Send a message
 */
export const sendMessage = async (data: SendMessageData): Promise<Message> => {
  const response = await api.post<Message>('/api/messages/send', data);
  return response.data;
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (conversationId: string): Promise<void> => {
  await api.patch(`/api/messages/conversations/${conversationId}/read`);
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (): Promise<number> => {
  // Use mock data in development
  if (import.meta.env.DEV) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const totalUnread = mockConversations.reduce((sum, conv) => sum + conv.unread_count, 0);
        resolve(totalUnread);
      }, 300);
    });
  }
  
  const response = await api.get<{ count: number }>('/api/messages/unread');
  return response.data.count;
};

/**
 * Create or get a conversation with a user
 */
export const getOrCreateConversation = async (userId: string): Promise<Conversation> => {
  const response = await api.post<Conversation>('/api/messages/conversations', { user_id: userId });
  return response.data;
};

// ===== HELPER: Smart Fallback Utility =====

/**
 * Attempts to call the API, but falls back to mock data if the API fails.
 * This allows the app to work without a backend, but automatically use real data when available.
 * 
 * @param apiCall - Function that returns a promise from the API
 * @param mockData - Mock data to use as fallback
 * @param featureName - Name of the feature (for logging)
 * @returns Promise that resolves to either API data or mock data
 */
async function withFallback<T>(
  apiCall: () => Promise<T>,
  mockData: T,
  featureName: string
): Promise<T> {
  try {
    const result = await apiCall();
    // If API call succeeds and returns data, use it
    if (result !== null && result !== undefined) {
      console.log(`✅ ${featureName}: Using real API data`);
      return result;
    }
    // If API returns null/undefined, fall back to mock
    console.warn(`⚠️ ${featureName}: API returned empty data, using mock fallback`);
    return mockData;
  } catch (error) {
    // Check if it's a network error or backend not available
    const isNetworkError = 
      !(error as any).response || // No response (network error)
      (error as any).response?.status === 404 || // Endpoint not found
      (error as any).response?.status >= 500; // Server error
    
    if (isNetworkError) {
      console.warn(`⚠️ ${featureName}: Backend unavailable, using mock data fallback`);
      return mockData;
    }
    
    // For other errors (like 401, 403), re-throw to let caller handle
    console.error(`❌ ${featureName}: API error`, error);
    throw error;
  }
}

// ===== CHALLENGES & GAMIFICATION API =====

/**
 * Get all available challenges
 * Falls back to mock data if backend is unavailable
 */
export const getChallenges = async (): Promise<Challenge[]> => {
  return withFallback(
    async () => {
      const response = await api.get<Challenge[]>('/api/challenges');
      return response.data;
    },
    mockChallenges,
    'Challenges'
  );
};

/**
 * Get a specific challenge by ID
 * Falls back to mock data if backend is unavailable
 * Re-throws authentication errors (401, 403) to allow interceptor to handle them
 */
export const getChallenge = async (challengeId: string): Promise<Challenge | null> => {
  try {
    const response = await api.get<Challenge>(`/api/challenges/${challengeId}`);
    console.log(`✅ Challenge ${challengeId}: Using real API data`);
    return response.data;
  } catch (error) {
    // Check if it's an authentication error that should be re-thrown
    const status = (error as any).response?.status;
    const isAuthError = status === 401 || status === 403;
    
    if (isAuthError) {
      // Re-throw authentication errors to let the axios interceptor handle them
      // This allows proper redirect to login page
      console.error(`❌ Challenge ${challengeId}: Authentication error (${status}), re-throwing for interceptor`);
      throw error;
    }
    
    // Check if it's a network error or backend not available
    const isNetworkError = 
      !(error as any).response || // No response (network error)
      status === 404 || // Endpoint not found
      (status && status >= 500); // Server error
    
    if (isNetworkError) {
      // Try to find in mock data as fallback
      const mockChallenge = mockChallenges.find(c => c.id === challengeId);
      if (mockChallenge) {
        console.warn(`⚠️ Challenge ${challengeId}: Backend unavailable, using mock data fallback`);
        return mockChallenge;
      }
      // If not found in mock either, return null
      console.error(`❌ Challenge ${challengeId}: Not found in API or mock data`);
      return null;
    }
    
    // For other errors (like 400 Bad Request), re-throw to let caller handle
    console.error(`❌ Challenge ${challengeId}: API error`, error);
    throw error;
  }
};

/**
 * Get user's rewards summary (XP, coins, badges, streak)
 * Falls back to mock data if backend is unavailable
 */
export const getRewardsSummary = async (): Promise<RewardSummary> => {
  return withFallback(
    async () => {
      const response = await api.get<RewardSummary>('/api/rewards/summary');
      return response.data;
    },
    mockRewardsSummary,
    'Rewards Summary'
  );
};

/**
 * Start a challenge
 * If backend is unavailable, this will fail (no mock fallback for write operations)
 */
export const startChallenge = async (challengeId: string): Promise<void> => {
  await api.post(`/api/challenges/${challengeId}/start`);
};

/**
 * Save cook session progress
 * If backend is unavailable, this will fail (no mock fallback for write operations)
 */
export const saveCookSession = async (sessionData: any): Promise<void> => {
  await api.post('/api/sessions', sessionData);
};

/**
 * Submit completed cook session
 * If backend is unavailable, this will fail (no mock fallback for write operations)
 */
export const submitCookSession = async (sessionId: string, proofData: any): Promise<void> => {
  await api.post(`/api/sessions/${sessionId}/submit`, proofData);
};

export default api;
