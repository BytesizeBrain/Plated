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
export interface RecipeData {
  title?: string;
  prep_time?: number;
  cook_time?: number;
  cooking_time?: number; // legacy field name
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  cuisine?: string;
  ingredients?: (string | { item?: string; name?: string; amount?: string; unit?: string })[];
  instructions?: (string | { step?: string; text?: string })[];
  tags?: string[];
}

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
  recipe_data?: RecipeData;
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

// Gamification Types
export type ChallengeType = 'daily' | 'weekly' | 'seasonal' | 'special';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard' | 'expert';
export type ChallengeStatus = 'locked' | 'available' | 'in_progress' | 'submitted' | 'verified' | 'completed' | 'failed';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  status: ChallengeStatus;
  recipe?: {
    id: string;
    title: string;
    cooking_time: number;
    difficulty: 'easy' | 'medium' | 'hard';
    servings: number;
    ingredients: string[];
    steps: CookingStep[];
    techniques?: string[];
    equipment?: string[];
    allergens?: string[];
  };
  requirements?: string[];
  rewards: {
    xp: number;
    coins: number;
    badges?: Badge[];
  };
  deadline?: string;
  participants?: number;
  progress?: number;
  coverUrl?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CookingStep {
  idx: number;
  text: string;
  timerSec?: number;
  safetyNote?: string;
  media?: {
    type: 'img' | 'vid';
    url: string;
  };
  techniques?: string[];
}

export interface CookSession {
  id: string;
  challengeId?: string;
  recipeId: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  currentStep: number;
  stepEvents: StepEvent[];
  status: 'in_progress' | 'submitted' | 'verified' | 'rejected';
  proof?: ProofSubmission;
}

export interface StepEvent {
  idx: number;
  completedAt: string;
}

export interface ProofSubmission {
  sessionId: string;
  photos: MediaUpload[];
  video?: MediaUpload;
  exif?: ExifSummary[];
  submittedAt: string;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  verificationNotes?: string;
}

export interface MediaUpload {
  localId: string;
  uploadUrl?: string;
  blobSize: number;
  mime: string;
  width: number;
  height: number;
  url?: string;
}

export interface ExifSummary {
  timestamp?: string;
  location?: { lat: number; lng: number };
  deviceModel?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  kind: 'technique' | 'cuisine' | 'event' | 'streak' | 'mastery';
  iconUrl: string;
  earnedAt?: string;
  progress?: number;
  total?: number;
}

export interface RewardSummary {
  xp: number;
  level: number;
  nextLevelXp: number;
  coins: number;
  badges: Badge[];
  streak: StreakInfo;
}

export interface StreakInfo {
  currentDays: number;
  longestStreak: number;
  freezeTokens: number;
  lastCompletedAt?: string;
  nextCutoff?: string;
}

export interface Squad {
  id: string;
  name: string;
  description?: string;
  members: SquadMember[];
  weeklyGoal: number;
  progress: number;
  inviteCode?: string;
  createdAt: string;
}

export interface SquadMember {
  userId: string;
  username: string;
  displayName: string;
  profilePic: string;
  role: 'leader' | 'member';
  weeklyContribution: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  profilePic: string;
  xp: number;
  level: number;
  weeklyXp?: number;
}

export interface Coupon {
  id: string;
  partner: string;
  title: string;
  description: string;
  valueCents: number;
  costCoins: number;
  expiresAt: string;
  status: 'available' | 'claimed' | 'redeemed' | 'expired';
  code?: string;
  barcodeUrl?: string;
  iconUrl?: string;
}

// --- Ingredient price / budget estimate types ---

export interface IngredientEstimateRequestItem {
  name: string;
  quantity: number;
  unit?: string;
}

export interface IngredientEstimateItem {
  ingredient_name: string;
  quantity: number;
  unit?: string | null;

  found: boolean;
  message?: string;

  store_name?: string;
  store_location?: string | null;
  price_per_unit?: number;
  currency?: string;
  estimated_cost?: number;
  source_url?: string | null;
  last_updated?: string | null;
}

export interface BudgetGoalResult {
  max_budget: number;
  under_budget: boolean;
  savings: number;
  coins_earned: number;
}

export interface BudgetEstimateResponse {
  items: IngredientEstimateItem[];
  total_estimated_cost: number;
  currency: string;
  budget_goal?: BudgetGoalResult;
}

// Mock Mode Configuration
export interface MockConfig {
  enabled: boolean;
  features: {
    feed: boolean;
    messages: boolean;
    challenges: boolean;
    rewards: boolean;
    squads: boolean;
    leaderboards: boolean;
    market: boolean;
  };
}


