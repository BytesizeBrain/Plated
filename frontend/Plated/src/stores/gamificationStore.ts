import { create } from 'zustand';
import type {
  Challenge,
  RewardSummary,
  Badge,
  CookSession,
  Squad,
  LeaderboardEntry,
  Coupon
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

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions - Challenges
  setChallenges: (challenges: Challenge[]) => void;
  setActiveChallenges: (challenges: Challenge[]) => void;
  updateChallenge: (challengeId: string, updates: Partial<Challenge>) => void;
  startChallenge: (challengeId: string) => void;

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
  isLoading: false,
  error: null,

  // Challenge actions
  setChallenges: (challenges) => set({ challenges }),

  setActiveChallenges: (activeChallenges) => set({ activeChallenges }),

  updateChallenge: (challengeId, updates) => set((state) => ({
    challenges: state.challenges.map((challenge) =>
      challenge.id === challengeId ? { ...challenge, ...updates } : challenge
    ),
    activeChallenges: state.activeChallenges.map((challenge) =>
      challenge.id === challengeId ? { ...challenge, ...updates } : challenge
    ),
  })),

  startChallenge: (challengeId) => set((state) => {
    const challenge = state.challenges.find((c) => c.id === challengeId);
    if (!challenge) return state;

    return {
      challenges: state.challenges.map((c) =>
        c.id === challengeId ? { ...c, status: 'in_progress' as const, startedAt: new Date().toISOString() } : c
      ),
      activeChallenges: [...state.activeChallenges, { ...challenge, status: 'in_progress' as const }],
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
    isLoading: false,
    error: null,
  }),
}));
