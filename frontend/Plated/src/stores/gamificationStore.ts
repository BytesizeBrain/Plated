import { create } from 'zustand';
import { API_BASE_URL } from '../utils/api';
import { getToken } from '../utils/auth';
import type {
  Challenge,
  RewardSummary,
  Badge,
  CookSession,
  Squad,
  LeaderboardEntry,
  Coupon,
  DailyIngredient,
  SkillTrack,
  RecipeCompletionResponse,
  CompleteRecipeResponse
} from '../types';

interface GamificationState {
  // Challenges
  challenges: Challenge[];
  activeChallenges: Challenge[];
  currentSession: CookSession | null;

  // Rewards
  rewards: RewardSummary | null;

  // Social
  squad: Squad | null;
  leaderboard: LeaderboardEntry[];

  // Market
  coupons: Coupon[];

  // Recipe Completion & Skill Tracks
  dailyIngredient: DailyIngredient | null;
  skillTracks: SkillTrack[];
  completionsByRecipe: Record<string, RecipeCompletionResponse>;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions - Challenges
  setChallenges: (challenges: Challenge[]) => void;
  setActiveChallenges: (challenges: Challenge[]) => void;
  updateChallenge: (challengeId: string, updates: Partial<Challenge>) => void;
  startChallenge: (challengeId: string) => void;
  completeChallenge: (challengeId: string) => void;

  // Actions - Cook Session
  setCurrentSession: (session: CookSession | null) => void;
  updateSessionStep: (step: number) => void;
  completeSession: () => void;

  // Actions - Rewards
  setRewards: (rewards: RewardSummary) => void;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => void;
  earnBadge: (badge: Badge) => void;
  incrementStreak: () => void;
  useStreakFreeze: () => void;

  // Actions - Social
  setSquad: (squad: Squad | null) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;

  // Actions - Market
  setCoupons: (coupons: Coupon[]) => void;
  claimCoupon: (couponId: string) => void;
  redeemCoupon: (couponId: string) => void;

  // Actions - Recipe Completion & Skill Tracks
  fetchDailyIngredient: () => Promise<void>;
  fetchSkillTracks: (userId?: string) => Promise<void>;
  fetchRecipeCompletions: (recipeId: string) => Promise<void>;
  completeRecipe: (recipeId: string, userId: string) => Promise<CompleteRecipeResponse>;
  setDailyIngredient: (ingredient: DailyIngredient) => void;
  setSkillTracks: (tracks: SkillTrack[]) => void;

  // Utility
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const calculateLevel = (xp: number): number => {
  // Level formula: level = floor(sqrt(xp / 100))
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

const calculateNextLevelXp = (level: number): number => {
  // XP required for next level
  return level * level * 100;
};

export const useGamificationStore = create<GamificationState>((set, get) => ({
  challenges: [],
  activeChallenges: [],
  currentSession: null,
  rewards: null,
  squad: null,
  leaderboard: [],
  coupons: [],
  dailyIngredient: null,
  skillTracks: [],
  completionsByRecipe: {},
  isLoading: false,
  error: null,

  // Challenge actions
  setChallenges: (challenges) =>
    set({
      challenges,
      // auto-populate activeChallenges any time we load/set challenges
      activeChallenges: challenges.filter((c) => c.status === 'in_progress'),
    }),

  setActiveChallenges: (activeChallenges) => set({ activeChallenges }),

  updateChallenge: (challengeId, updates) => set((state) => ({
    challenges: state.challenges.map((challenge) =>
      challenge.id === challengeId ? { ...challenge, ...updates } : challenge
    ),
    activeChallenges: state.activeChallenges.map((challenge) =>
      challenge.id === challengeId ? { ...challenge, ...updates } : challenge
    ),
  })),

  startChallenge: (challengeId) =>
    set((state) => {
      const updatedChallenges = state.challenges.map((c) =>
        c.id === challengeId
          ? {
              ...c,
              status: 'in_progress' as const,
              startedAt: c.startedAt ?? new Date().toISOString(),
            }
          : c
      );

      return {
        challenges: updatedChallenges,
        activeChallenges: updatedChallenges.filter(
          (c) => c.status === 'in_progress'
        ),
      };
    }),
  completeChallenge: (challengeId) =>
    set((state) => {
      const updatedChallenges = state.challenges.map((c) =>
        c.id === challengeId
          ? {
              ...c,
              status: 'completed' as const,
              progress: 1,
            }
          : c
      );

      return {
        challenges: updatedChallenges,
        activeChallenges: updatedChallenges.filter(
          (c) => c.status === 'in_progress'
        ),
      };
    }),

  // Cook session actions
  setCurrentSession: (session) => set({ currentSession: session }),

  updateSessionStep: (step) => set((state) => {
    if (!state.currentSession) return state;

    return {
      currentSession: {
        ...state.currentSession,
        currentStep: step,
        stepEvents: [
          ...state.currentSession.stepEvents,
          { idx: step, completedAt: new Date().toISOString() },
        ],
      },
    };
  }),

  completeSession: () => set((state) => {
    if (!state.currentSession) return state;

    return {
      currentSession: {
        ...state.currentSession,
        completedAt: new Date().toISOString(),
        status: 'submitted' as const,
      },
    };
  }),

  // Reward actions
  setRewards: (rewards) => set({ rewards }),

  addXp: (amount) => set((state) => {
    if (!state.rewards) return state;

    const newXp = state.rewards.xp + amount;
    const newLevel = calculateLevel(newXp);
    const nextLevelXp = calculateNextLevelXp(newLevel);

    return {
      rewards: {
        ...state.rewards,
        xp: newXp,
        level: newLevel,
        nextLevelXp,
      },
    };
  }),

  addCoins: (amount) => set((state) => {
    if (!state.rewards) return state;

    return {
      rewards: {
        ...state.rewards,
        coins: state.rewards.coins + amount,
      },
    };
  }),

  spendCoins: (amount) => set((state) => {
    if (!state.rewards || state.rewards.coins < amount) return state;

    return {
      rewards: {
        ...state.rewards,
        coins: state.rewards.coins - amount,
      },
    };
  }),

  earnBadge: (badge) => set((state) => {
    if (!state.rewards) return state;

    return {
      rewards: {
        ...state.rewards,
        badges: [...state.rewards.badges, badge],
      },
    };
  }),

  incrementStreak: () => set((state) => {
    if (!state.rewards) return state;

    const newDays = state.rewards.streak.currentDays + 1;
    const longestStreak = Math.max(newDays, state.rewards.streak.longestStreak);

    return {
      rewards: {
        ...state.rewards,
        streak: {
          ...state.rewards.streak,
          currentDays: newDays,
          longestStreak,
          lastCompletedAt: new Date().toISOString(),
        },
      },
    };
  }),

  useStreakFreeze: () => set((state) => {
    if (!state.rewards || state.rewards.streak.freezeTokens <= 0) return state;

    return {
      rewards: {
        ...state.rewards,
        streak: {
          ...state.rewards.streak,
          freezeTokens: state.rewards.streak.freezeTokens - 1,
        },
      },
    };
  }),

  // Social actions
  setSquad: (squad) => set({ squad }),

  setLeaderboard: (entries) => set({ leaderboard: entries }),

  // Market actions
  setCoupons: (coupons) => set({ coupons }),

  claimCoupon: (couponId) => set((state) => ({
    coupons: state.coupons.map((coupon) =>
      coupon.id === couponId ? { ...coupon, status: 'claimed' as const } : coupon
    ),
  })),

  redeemCoupon: (couponId) => set((state) => ({
    coupons: state.coupons.map((coupon) =>
      coupon.id === couponId ? { ...coupon, status: 'redeemed' as const } : coupon
    ),
  })),

  // Recipe Completion & Skill Tracks Actions
  fetchDailyIngredient: async () => {
    try {
      set({ isLoading: true, error: null });
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/gamification/daily-ingredient`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch daily ingredient');
      }

      const data: DailyIngredient = await response.json();
      set({ dailyIngredient: data });
    } catch (error) {
      console.error('Error fetching daily ingredient:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSkillTracks: async (userId?: string) => {
    try {
      set({ isLoading: true, error: null });
      const url = userId
        ? `${API_BASE_URL}/api/gamification/skill-tracks?user_id=${userId}`
        : `${API_BASE_URL}/api/gamification/skill-tracks`;

      const token = getToken();
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skill tracks');
      }

      const data: SkillTrack[] = await response.json();
      set({ skillTracks: data });
    } catch (error) {
      console.error('Error fetching skill tracks:', error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRecipeCompletions: async (recipeId: string) => {
    try {
      set({ isLoading: true, error: null });
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/gamification/recipes/${recipeId}/completions`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recipe completions');
      }

      const data: RecipeCompletionResponse = await response.json();
      set((state) => ({
        completionsByRecipe: {
          ...state.completionsByRecipe,
          [recipeId]: data,
        },
      }));
    } catch (error) {
      console.error(`Error fetching completions for recipe ${recipeId}:`, error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  completeRecipe: async (recipeId: string, userId: string): Promise<CompleteRecipeResponse> => {
    try {
      set({ isLoading: true, error: null });
      const token = getToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(
        `${API_BASE_URL}/api/gamification/recipes/${recipeId}/complete`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ user_id: userId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to complete recipe');
      }

      const data: CompleteRecipeResponse = await response.json();

      // Refresh related data
      await Promise.all([
        get().fetchRecipeCompletions(recipeId),
        get().fetchSkillTracks(userId),
      ]);

      // Update rewards if level up occurred
      if (data.level_up && get().rewards) {
        const currentRewards = get().rewards!;
        set({
          rewards: {
            ...currentRewards,
            xp: currentRewards.xp + data.xp_gained,
            coins: currentRewards.coins + data.reward,
          },
        });
      }

      return data;
    } catch (error) {
      console.error(`Error completing recipe ${recipeId}:`, error);
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  setDailyIngredient: (ingredient) => set({ dailyIngredient: ingredient }),

  setSkillTracks: (tracks) => set({ skillTracks: tracks }),

  // Utility
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set({
    challenges: [],
    activeChallenges: [],
    currentSession: null,
    rewards: null,
    squad: null,
    leaderboard: [],
    coupons: [],
    dailyIngredient: null,
    skillTracks: [],
    completionsByRecipe: {},
    isLoading: false,
    error: null,
  }),
}));
