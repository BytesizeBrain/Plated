import axios from 'axios';
import { getToken, removeToken } from './auth';
import { mockFeedPosts, mockConversations, mockCurrentUser } from '../data/mockData';
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
  FeedFilter
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

export default api;
