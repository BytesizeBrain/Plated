export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  profile_pic: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name: string;
  profile_pic: string;
}

export interface JWTPayload {
  email: string;
  exp: number;
  display_name?: string;
  profile_pic?: string;
}

export interface RegisterData {
  username: string;
  display_name: string;
  profile_pic?: string;
}

export interface UpdateUserData {
  username?: string;
  display_name?: string;
  profile_pic?: string;
}

export interface CheckUsernameResponse {
  exists: boolean;
}

export interface ApiError {
  error: string;
}

// Feed Types
export interface FeedPost {
  id: string;
  user_id: string;
  user: {
    username: string;
    display_name: string;
    profile_pic: string;
  };
  title: string;
  description?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  recipe_data?: {
    cooking_time?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    servings?: number;
    ingredients?: string[];
    instructions?: string[];
  };
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_liked: boolean;
  is_saved: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  user: {
    username: string;
    display_name: string;
    profile_pic: string;
  };
  content: string;
  created_at: string;
}

export interface FeedFilter {
  type: 'for-you' | 'following' | 'trending';
  cuisine?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  max_time?: number;
  sort_by?: 'recent' | 'popular' | 'trending';
}

// Message Types
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender: {
    username: string;
    display_name: string;
    profile_pic: string;
  };
  content: string;
  created_at: string;
  is_read: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  participant_ids: string[];
  participants: {
    id: string;
    username: string;
    display_name: string;
    profile_pic: string;
  }[];
  last_message?: Message;
  unread_count: number;
  updated_at: string;
}

export interface SendMessageData {
  conversation_id?: string;
  recipient_id?: string;
  content: string;
}

export interface TypingIndicator {
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
}
