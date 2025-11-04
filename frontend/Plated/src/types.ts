export interface User {
  id?: string;
  email?: string;
  username: string;
  display_name?: string;
  profile_pic?: string;
  [key: string]: unknown;
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

// ===== Front-end domain types (restored for UI and mocks) =====

export interface FeedFilter {
  type?: string;
  cuisine?: string;
  difficulty?: string;
  max_time?: number;
  sort_by?: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user: User;
  content: string;
  created_at: string;
  [key: string]: unknown;
}

export interface FeedPost {
  id: string;
  author?: User;
  title: string;
  description?: string;
  image_url?: string;
  likes?: number;
  comments_count?: number;
  saved?: boolean;
  created_at: string;
  [key: string]: unknown;
}

export interface Conversation {
  id: string;
  name?: string;
  last_message_at?: string;
  unread_count: number;
  [key: string]: unknown;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: User;
  content: string;
  created_at: string;
  read?: boolean;
  [key: string]: unknown;
}

export interface SendMessageData {
  conversation_id: string;
  content: string;
}

export interface Badge {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  earnedAt?: string;
  kind?: string;
  [key: string]: unknown;
}

export interface ChallengeStepEvent {
  idx: number;
  completedAt: string;
}

export interface CookSession {
  id: string;
  recipeId: string;
  currentStep: number;
  stepEvents: ChallengeStepEvent[];
  completedAt?: string;
  status: 'in_progress' | 'submitted' | 'completed';
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  status?: 'not_started' | 'in_progress' | 'completed' | 'available' | 'locked';
  startedAt?: string;
  type?: string;
  [key: string]: unknown;
}

export interface RewardSummary {
  xp: number;
  level: number;
  nextLevelXp: number;
  coins: number;
  badges: Badge[];
  streak: {
    currentDays: number;
    longestStreak: number;
    lastCompletedAt?: string;
    freezeTokens: number;
    nextCutoff?: number | string;
  };
  [key: string]: unknown;
}

export interface Squad {
  id: string;
  name: string;
  members: User[];
  description?: string;
  weeklyGoal?: number | string;
  [key: string]: unknown;
}

export interface LeaderboardEntry {
  user?: User;
  score?: number;
  rank?: number;
  [key: string]: unknown;
}

export interface Coupon {
  id: string;
  title: string;
  description?: string;
  status: 'available' | 'claimed' | 'redeemed';
  partner?: string;
  [key: string]: unknown;
}

export interface MockConfig {
  enabled: boolean;
  features?: unknown;
  [key: string]: unknown;
}