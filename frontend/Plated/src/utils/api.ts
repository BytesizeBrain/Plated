import axios from 'axios';
import { getToken, removeToken } from './auth';
import { mockFeedPosts, mockConversations, mockCurrentUser, mockComments, mockMessages } from '../data/mockData';
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

// Determine the base URL for the backend API with environment fallbacks
const resolveApiBaseUrl = (): string => {
  // First check: If we're on localhost, always use localhost:5000
  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      console.log('🔧 API: Using localhost:5000 for local development');
      return 'http://localhost:5000';
    }
  }

  // Check for explicit environment variable
  const rawEnvUrl = import.meta.env.VITE_API_BASE_URL?.toString().trim();
  if (rawEnvUrl) {
    console.log(`🔧 API: Using env VITE_API_BASE_URL: ${rawEnvUrl}`);
    return rawEnvUrl.replace(/\/+$/, '');
  }

  // Fallback for production based on window location
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    const fallbackPort = import.meta.env.VITE_API_FALLBACK_PORT?.toString().trim();

    let portToUse = fallbackPort || port || '';
    const portSegment = portToUse ? `:${portToUse}` : '';
    const url = `${protocol}//${hostname}${portSegment}`;
    console.log(`🔧 API: Using fallback URL: ${url}`);
    return url;
  }

  console.log('🔧 API: Using default localhost:5000');
  return 'http://localhost:5000';
};

// Base URL for the backend API
export const API_BASE_URL = resolveApiBaseUrl();
const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || 'oauth').toString().toLowerCase();

// Validate environment variable in production
if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
  console.warn(`⚠️ VITE_API_BASE_URL is not set in production. Falling back to ${API_BASE_URL}. Configure VITE_API_BASE_URL to avoid unexpected redirects.`);
}

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    // In mock mode, do not attach Authorization header
    if (AUTH_MODE !== 'mock') {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
    // If we get a 401 in oauth mode, clear token and redirect to login
    // In mock mode, do NOT redirect; allow fallbacks to handle
    if (error.response?.status === 401 && AUTH_MODE !== 'mock') {
      removeToken();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

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
      (error as any).response?.status >= 500 || // Server error
      // In mock mode, also treat 401/403 as reasons to use mock
      (AUTH_MODE === 'mock' && ((error as any).response?.status === 401 || (error as any).response?.status === 403));

    if (isNetworkError) {
      console.warn(`⚠️ ${featureName}: Backend unavailable, using mock data fallback`);
      return mockData;
    }

    // For other errors (like 401, 403), re-throw to let caller handle
    console.error(`❌ ${featureName}: API error`, error);
    throw error;
  }
}

/**
 * Register a new user after OAuth
 * If backend is unavailable, this will fail (no mock fallback for write operations)
 */
export const registerUser = async (data: RegisterData): Promise<void> => {
  try {
    await api.post('/register', data);
  } catch (error) {
    if (!(error as any).response) {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
};

/**
 * Get current user's profile
 * Falls back to mock data if backend is unavailable
 */
export const getUserProfile = async (): Promise<UserProfile> => {
  // We manually handle the API call here to ensure 404s (User not found) 
  // are propagated to the caller (Register page) instead of falling back to mock data.
  try {
    const response = await api.get<UserProfile>('/profile');
    return response.data;
  } catch (error) {
    // If it's a 404, it means the user is not registered yet. 
    // We MUST throw this so the Register page knows to show the form.
    if ((error as any).response?.status === 404) {
      throw error;
    }

    // For other errors (network, 500s), we can fall back to mock data 
    // to allow the app to function in "demo" mode or when backend is down.
    console.warn(`⚠️ User Profile: Backend unavailable or error, using mock data fallback`);
    return mockCurrentUser;
  }
};

/**
 * Update user profile
 * If backend is unavailable, this will fail (no mock fallback for write operations)
 */
export const updateUser = async (data: UpdateUserData): Promise<void> => {
  try {
    await api.put('/update', data);
  } catch (error) {
    if (!(error as any).response) {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
};

/**
 * Check if a username is available
 * Falls back to mock check (always returns true - available) if backend is unavailable
 */
export const checkUsername = async (username: string): Promise<boolean> => {
  return withFallback(
    async () => {
      const response = await api.get<CheckUsernameResponse>('/check_username', {
        params: { username },
      });
      return !response.data.exists; // Return true if username is available
    },
    true, // Mock: always return true (username available) when backend is down
    'Username Check'
  );
};

// ===== FEED API =====

/**
 * Get feed posts with pagination
 * Falls back to mock data if backend is unavailable
 */
export const getFeedPosts = async (
  page: number = 1,
  _filter?: FeedFilter
): Promise<{ posts: FeedPost[]; has_more: boolean }> => {
  const perPage = 10;

  return withFallback(
    async () => {
      // Call your Flask backend: GET /api/feed
      const resp = await api.get<{
        page: number;
        per_page: number;
        feed: any[];
      }>("/api/feed", {
        params: {
          page,
          per_page: perPage,
          // TODO: when backend supports filters, pass them here:
          // type: filter?.type,
          // cuisine: filter?.cuisine,
          // difficulty: filter?.difficulty,
          // max_time: filter?.max_time,
          // sort_by: filter?.sort_by,
        },
      });

      // Transform backend response to match frontend FeedPost structure
      const backendPosts = resp.data.feed ?? [];
      const posts: FeedPost[] = backendPosts.map((post: any) => ({
        id: post.id,
        user_id: post.user?.id || '',
        user: {
          username: post.user?.username || 'unknown',
          display_name: post.user?.username || 'Unknown User',
          profile_pic: post.user?.profile_pic || '',
        },
        title: post.recipe_data?.title || post.caption || 'Untitled Post',
        description: post.caption || '',
        media_url: post.image_url,
        media_type: 'image' as const,
        recipe_data: post.recipe_data,
        likes_count: post.engagement?.likes_count || 0,
        comments_count: post.engagement?.comments_count || 0,
        views_count: post.views_count || 0,
        is_liked: post.engagement?.is_liked || false,
        is_saved: post.engagement?.is_saved || false,
        created_at: post.created_at,
      }));

      return {
        posts,
        // simple has_more: if we got a full page, assume more exists
        has_more: posts.length === perPage,
      };
    },
    (() => {
      // 🔁 Mock data fallback with pagination (offline / backend down)
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const posts = mockFeedPosts.slice(startIndex, endIndex);
      const hasMore = endIndex < mockFeedPosts.length;
      return { posts, has_more: hasMore };
    })(),
    "Feed Posts"
  );
};


/**
 * Search posts by keyword
 * Searches through caption and recipe_data (title, ingredients, tags, cuisine)
 * Falls back to mock data filtering if backend is unavailable
 */
export const searchPosts = async (
  query: string,
  page: number = 1,
  perPage: number = 20
): Promise<{ posts: FeedPost[]; has_more: boolean; total: number }> => {
  const searchQuery = query.toLowerCase().trim();

  return withFallback(
    async () => {
      const resp = await api.get<{
        page: number;
        per_page: number;
        total: number;
        has_more: boolean;
        results: any[];
      }>("/api/posts/search", {
        params: {
          q: searchQuery,
          page,
          per_page: perPage,
        },
      });

      // Transform backend response to match frontend FeedPost structure
      const backendPosts = resp.data.results ?? [];
      const posts: FeedPost[] = backendPosts.map((post: any) => {
        // Transform recipe_data if it exists
        let recipeData = undefined;
        if (post.recipe_data && typeof post.recipe_data === 'object') {
          // Transform ingredients from objects to strings, filter out empty ones
          let ingredients: string[] | undefined = undefined;
          if (Array.isArray(post.recipe_data.ingredients) && post.recipe_data.ingredients.length > 0) {
            ingredients = post.recipe_data.ingredients
              .map((ing: any) => {
                if (typeof ing === 'string') return ing.trim();
                // If it's an object with item, amount, unit
                if (ing && typeof ing === 'object' && ing.item) {
                  const parts = [];
                  if (ing.amount) parts.push(String(ing.amount).trim());
                  if (ing.unit) parts.push(String(ing.unit).trim());
                  parts.push(String(ing.item).trim());
                  return parts.filter(p => p).join(' ');
                }
                return String(ing).trim();
              })
              .filter((ing: string) => ing.length > 0);
          }

          // Filter out empty instructions
          let instructions: string[] | undefined = undefined;
          if (Array.isArray(post.recipe_data.instructions) && post.recipe_data.instructions.length > 0) {
            instructions = post.recipe_data.instructions
              .map((inst: any) => String(inst).trim())
              .filter((inst: string) => inst.length > 0);
          }

          // Only create recipeData if we have meaningful data
          if (post.recipe_data.title || ingredients || instructions) {
            recipeData = {
              title: post.recipe_data.title,
              cooking_time: post.recipe_data.prep_time && post.recipe_data.cook_time
                ? post.recipe_data.prep_time + post.recipe_data.cook_time
                : post.recipe_data.cook_time || post.recipe_data.prep_time,
              difficulty: post.recipe_data.difficulty,
              servings: post.recipe_data.servings,
              ingredients: ingredients && ingredients.length > 0 ? ingredients : undefined,
              instructions: instructions && instructions.length > 0 ? instructions : undefined,
            };
          }
        }

        return {
          id: post.id,
          user_id: post.user?.id || '',
          user: {
            username: post.user?.username || 'unknown',
            display_name: post.user?.username || 'Unknown User',
            profile_pic: post.user?.profile_pic || '',
          },
          title: post.recipe_data?.title || post.caption || 'Untitled Post',
          description: post.caption || '',
          media_url: post.image_url,
          media_type: 'image' as const,
          recipe_data: recipeData,
          likes_count: post.engagement?.likes_count || 0,
          comments_count: post.engagement?.comments_count || 0,
          views_count: post.views_count || 0,
          is_liked: post.engagement?.is_liked || false,
          is_saved: post.engagement?.is_saved || false,
          created_at: post.created_at,
        };
      });

      return {
        posts,
        has_more: resp.data.has_more,
        total: resp.data.total,
      };
    },
    (() => {
      // Mock data fallback - filter mock posts locally
      const filtered = mockFeedPosts.filter(post =>
        post.title.toLowerCase().includes(searchQuery) ||
        post.description?.toLowerCase().includes(searchQuery) ||
        post.recipe_data?.ingredients?.some((ingredient) => {
          const ingredientText = typeof ingredient === 'string' 
            ? ingredient 
            : ingredient.item || ingredient.name || '';
          return ingredientText.toLowerCase().includes(searchQuery);
        }) ||
        post.user.display_name.toLowerCase().includes(searchQuery) ||
        post.user.username.toLowerCase().includes(searchQuery)
      );
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const posts = filtered.slice(startIndex, endIndex);
      return {
        posts,
        has_more: endIndex < filtered.length,
        total: filtered.length,
      };
    })(),
    "Search Posts"
  );
};


/**
 * Like a post
 * Requires JWT authentication
 */
export const likePost = async (postId: string): Promise<void> => {

  try {
    await api.post('/api/posts/like', { post_id: postId });
  } catch (error) {
    if (!(error as any).response) {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw error;
  }
};

/**
 * Unlike a post
 * Requires JWT authentication
 */
export const unlikePost = async (postId: string): Promise<void> => {
  await api.delete('/api/posts/like', { data: { post_id: postId } });
};

/**
 * Save a post
 * Requires JWT authentication
 */
export const savePost = async (postId: string): Promise<void> => {
  await api.post('/api/posts/save', { post_id: postId });
};

/**
 * Unsave a post
 * Requires JWT authentication
 */
export const unsavePost = async (postId: string): Promise<void> => {
  await api.delete('/api/posts/save', { data: { post_id: postId } });
};

/**
 * Get comments for a post
 * Falls back to mock data if backend is unavailable
 */
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  return withFallback(
    async () => {
      const response = await api.get<{ comments: Comment[]; count: number }>(`/api/posts/${postId}/comments`);
      return response.data.comments;
    },
    mockComments.filter(c => c.post_id === postId),
    'Post Comments'
  );
};

/**
 * Add a comment to a post
 * Requires JWT authentication
 */
export const addComment = async (postId: string, content: string): Promise<Comment> => {
  const response = await api.post<Comment>('/api/posts/comments', { post_id: postId, content });
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
 * Falls back to mock data if backend is unavailable
 */
export const getConversations = async (): Promise<Conversation[]> => {
  return withFallback(
    async () => {
      const response = await api.get<Conversation[]>('/api/messages/conversations');
      return response.data;
    },
    mockConversations,
    'Conversations'
  );
};

/**
 * Get messages for a specific conversation
 * Falls back to mock data if backend is unavailable
 */
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  return withFallback(
    async () => {
      const response = await api.get<Message[]>(`/api/messages/conversations/${conversationId}`);
      return response.data;
    },
    mockMessages.filter(m => m.conversation_id === conversationId),
    'Conversation Messages'
  );
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
 * Falls back to mock data if backend is unavailable
 */
export const getUnreadCount = async (): Promise<number> => {
  return withFallback(
    async () => {
      // Flask backend endpoint: GET /api/messages/unread
      const response = await api.get<{ count: number }>('/api/messages/unread');
      return response.data.count;
    },
    // fallback: sum mock unread counts if backend is down
    mockConversations.reduce((sum, conv) => sum + conv.unread_count, 0),
    'Unread Count'
  );
};



/**
 * Create or get a conversation with a user
 */
export const getOrCreateConversation = async (userId: string): Promise<Conversation> => {
  const response = await api.post<Conversation>('/api/messages/conversations', { user_id: userId });
  return response.data;
};

// ===== CHALLENGES & GAMIFICATION API =====

/**
 * Get all available challenges
 * Falls back to mock data if backend is unavailable
 */
export const getChallenges = async (): Promise<Challenge[]> => {
  return withFallback(
    async () => {
      const response = await api.get<{ challenges: Challenge[] } | Challenge[]>('/api/challenges');
      // Handle both formats: { challenges: [...] } or just [...]
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      if (data && typeof data === 'object' && 'challenges' in data) {
        return data.challenges;
      }
      return [];
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

// ===== POSTS CREATION API =====

/**
 * Upload image for post creation
 * Returns the public URL of the uploaded image
 * If backend is unavailable, this will fail (no mock fallback for write operations)
 */
export const uploadPostImage = async (imageFile: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await api.post<{ image_url: string }>('/api/posts/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data.image_url;
  } catch (error) {
    if (!(error as any).response) {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw new Error('Failed to upload image. Please try again.');
  }
};

/**
 * Create a new post (simple or recipe)
 * If backend is unavailable, this will fail (no mock fallback for write operations)
 */
export const createPost = async (postData: {
  post_type: 'simple' | 'recipe';
  image_url: string;
  caption: string;
  recipe_data?: any;
}): Promise<void> => {
  try {
    await api.post('/api/posts/create', postData);
  } catch (error) {
    if (!(error as any).response) {
      throw new Error('Unable to connect to server. Please check your connection.');
    }
    throw new Error('Failed to create post. Please try again.');
  }
};

export default api;
