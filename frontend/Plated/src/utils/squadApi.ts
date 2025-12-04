import api from './api';

// ============================================================================
// MOCK DATA - Used when backend is unavailable
// ============================================================================

const MOCK_SQUADS = [
  {
    id: "squad-anime-club",
    name: "Anime Club",
    description: "Cooking anime-inspired dishes!",
    weekly_points: 3200,
    total_points: 15600,
    member_count: 15,
    rank: 1
  },
  {
    id: "squad-dorm-4b",
    name: "Dorm 4B",
    description: "The best cooks in the dorm!",
    weekly_points: 2450,
    total_points: 12500,
    member_count: 8,
    rank: 2
  },
  {
    id: "squad-budget-kings",
    name: "Budget Kings",
    description: "Making $5 taste like $50",
    weekly_points: 2100,
    total_points: 8900,
    member_count: 10,
    rank: 3
  },
  {
    id: "squad-cs-majors",
    name: "CS Majors",
    description: "Debugging recipes one bug at a time",
    weekly_points: 1890,
    total_points: 9800,
    member_count: 12,
    rank: 4
  },
  {
    id: "squad-night-owls",
    name: "Night Owls",
    description: "Late night cooking crew",
    weekly_points: 1560,
    total_points: 5400,
    member_count: 6,
    rank: 5
  }
];

const MOCK_MY_SQUAD: MySquadResponse = {
  squad: {
    id: "squad-dorm-4b",
    name: "Dorm 4B",
    code: "DORM4B",
    description: "The best cooks in the dorm!",
    weekly_points: 2450,
    total_points: 12500,
    member_count: 8,
    created_at: "2025-01-15T10:00:00Z"
  },
  members: [
    { user_id: "user-1", username: "chef_mike", display_name: "Mike Chen", profile_pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike", role: "leader" as const, weekly_contribution: 450, joined_at: "2025-01-15T10:00:00Z" },
    { user_id: "user-6", username: "pasta_queen", display_name: "Sarah Kim", profile_pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah", role: "member" as const, weekly_contribution: 380, joined_at: "2025-01-15T12:00:00Z" },
    { user_id: "user-7", username: "grill_master", display_name: "Jake Wilson", profile_pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=jake", role: "member" as const, weekly_contribution: 320, joined_at: "2025-01-16T09:00:00Z" },
    { user_id: "user-8", username: "spice_lord", display_name: "Raj Patel", profile_pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=raj", role: "member" as const, weekly_contribution: 290, joined_at: "2025-01-16T14:00:00Z" },
    { user_id: "user-9", username: "sushi_sam", display_name: "Sam Tanaka", profile_pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam", role: "member" as const, weekly_contribution: 260, joined_at: "2025-01-17T11:00:00Z" },
    { user_id: "user-10", username: "baker_betty", display_name: "Betty Ross", profile_pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=betty", role: "member" as const, weekly_contribution: 240, joined_at: "2025-01-18T08:00:00Z" },
    { user_id: "user-11", username: "wok_wizard", display_name: "David Liu", profile_pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=david", role: "member" as const, weekly_contribution: 280, joined_at: "2025-01-19T15:00:00Z" },
    { user_id: "user-12", username: "taco_tim", display_name: "Tim Garcia", profile_pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=tim", role: "member" as const, weekly_contribution: 230, joined_at: "2025-01-20T10:00:00Z" },
  ]
};

// Track mock state for create/join/leave operations
let mockUserHasSquad = true;
let mockUserSquad = MOCK_MY_SQUAD;

// ============================================================================
// API FUNCTIONS
// ============================================================================

interface Squad {
  id: string;
  name: string;
  code?: string;
  description?: string;
  weekly_points: number;
  total_points: number;
  member_count: number;
  rank?: number;
  created_at?: string;
}

interface SquadMember {
  user_id: string;
  username: string;
  display_name: string;
  profile_pic: string;
  role: 'leader' | 'member';
  weekly_contribution: number;
  joined_at: string;
}

interface SquadsLeaderboardResponse {
  squads: Squad[];
}

interface MySquadResponse {
  squad: Squad | null;
  members: SquadMember[];
}

interface CreateSquadResponse {
  squad: Squad;
  invite_code: string;
}

interface JoinSquadResponse {
  squad: Squad;
  message: string;
}

/**
 * Get the squads leaderboard (top squads this week)
 */
export async function getSquadsLeaderboard(): Promise<SquadsLeaderboardResponse> {
  try {
    const response = await api.get<SquadsLeaderboardResponse>('/api/squads');
    console.log('✅ Squads Leaderboard: Using real API data');
    return response.data;
  } catch (error) {
    console.warn('⚠️ Squads Leaderboard: Backend unavailable, using mock data');
    return { squads: MOCK_SQUADS };
  }
}

/**
 * Get the current user's squad
 */
export async function getMySquad(): Promise<MySquadResponse> {
  try {
    const response = await api.get<MySquadResponse>('/api/squads/my');
    console.log('✅ My Squad: Using real API data');
    return response.data;
  } catch (error) {
    console.warn('⚠️ My Squad: Backend unavailable, using mock data');
    if (mockUserHasSquad) {
      return mockUserSquad;
    }
    return { squad: null, members: [] };
  }
}

/**
 * Create a new squad
 */
export async function createSquad(name: string, description?: string): Promise<CreateSquadResponse> {
  try {
    const response = await api.post<CreateSquadResponse>('/api/squads', { name, description });
    console.log('✅ Create Squad: Using real API');
    return response.data;
  } catch (error: any) {
    // Check if it's a real error from the API
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    // Mock fallback for demo
    console.warn('⚠️ Create Squad: Backend unavailable, using mock');
    const newSquad: Squad = {
      id: `squad-${Date.now()}`,
      name,
      code: generateMockCode(),
      description: description || '',
      weekly_points: 0,
      total_points: 0,
      member_count: 1,
      created_at: new Date().toISOString()
    };
    
    mockUserHasSquad = true;
    mockUserSquad = {
      squad: { ...newSquad, code: newSquad.code || '' },
      members: [{
        user_id: 'current-user',
        username: 'you',
        display_name: 'You',
        profile_pic: '',
        role: 'leader',
        weekly_contribution: 0,
        joined_at: new Date().toISOString()
      }]
    };
    
    return { squad: newSquad, invite_code: newSquad.code! };
  }
}

/**
 * Join a squad using an invite code
 */
export async function joinSquad(code: string): Promise<JoinSquadResponse> {
  try {
    const response = await api.post<JoinSquadResponse>('/api/squads/join', { code });
    console.log('✅ Join Squad: Using real API');
    return response.data;
  } catch (error: any) {
    // Check if it's a real error from the API
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    // Mock fallback - find squad by code
    console.warn('⚠️ Join Squad: Backend unavailable, using mock');
    const foundSquad = MOCK_SQUADS.find(s => 
      s.id === 'squad-dorm-4b' && code.toUpperCase() === 'DORM4B' ||
      s.id === 'squad-cs-majors' && code.toUpperCase() === 'CSCODE' ||
      s.id === 'squad-anime-club' && code.toUpperCase() === 'ANIME1'
    );
    
    if (!foundSquad) {
      throw new Error('Invalid invite code');
    }
    
    mockUserHasSquad = true;
    const joinedSquad: Squad = {
      ...foundSquad,
      code: code.toUpperCase(),
      created_at: new Date().toISOString()
    };
    
    mockUserSquad = {
      squad: joinedSquad,
      members: MOCK_MY_SQUAD.members
    };
    
    return { 
      squad: joinedSquad, 
      message: `Successfully joined ${foundSquad.name}!` 
    };
  }
}

/**
 * Leave the current squad
 */
export async function leaveSquad(): Promise<void> {
  try {
    await api.post('/api/squads/leave');
    console.log('✅ Leave Squad: Using real API');
  } catch (error: any) {
    // Check if it's a real error from the API
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    // Mock fallback
    console.warn('⚠️ Leave Squad: Backend unavailable, using mock');
    mockUserHasSquad = false;
    mockUserSquad = { squad: null, members: [] } as any;
  }
}

/**
 * Get a user's squad badge info (for profile cards)
 */
export async function getUserSquadBadge(userId: string): Promise<{
  has_squad: boolean;
  squad_name: string | null;
  squad_id: string | null;
}> {
  try {
    const response = await api.get(`/api/squads/user/${userId}/badge`);
    return response.data;
  } catch (error) {
    // Mock fallback - randomly assign some users to squads
    const mockSquadUsers: Record<string, string> = {
      'user-1': 'Dorm 4B',
      'user-2': 'CS Majors',
      'user-3': 'Anime Club',
    };
    
    if (mockSquadUsers[userId]) {
      return {
        has_squad: true,
        squad_name: mockSquadUsers[userId],
        squad_id: `squad-${mockSquadUsers[userId].toLowerCase().replace(/\s+/g, '-')}`
      };
    }
    
    return { has_squad: false, squad_name: null, squad_id: null };
  }
}

// Helper function
function generateMockCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
