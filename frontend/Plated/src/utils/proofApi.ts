import api from './api';
import type { ProofSubmitResponse, ProofStats, RecipeProof } from '../types';

// ============================================================================
// MOCK DATA - Used when backend is unavailable
// ============================================================================

const MOCK_PROOF_STATS: Record<string, ProofStats> = {
  'recipe-1': {
    recipeId: 'recipe-1',
    totalCooks: 18,
    withProof: 5,
    verifiedProofs: 4,
    recentProofs: [
      {
        id: 'proof-1',
        userId: 'user-1',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
        note: 'Turned out amazing!',
        createdAt: '2025-01-20T14:30:00Z'
      },
      {
        id: 'proof-2',
        userId: 'user-3',
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
        note: 'First time making this!',
        createdAt: '2025-01-21T09:15:00Z'
      }
    ]
  },
  'recipe-2': {
    recipeId: 'recipe-2',
    totalCooks: 12,
    withProof: 3,
    verifiedProofs: 3,
    recentProofs: [
      {
        id: 'proof-4',
        userId: 'user-2',
        imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
        note: 'Added extra cheese 🧀',
        createdAt: '2025-01-19T12:00:00Z'
      }
    ]
  }
};

// Default stats for recipes without data
const DEFAULT_PROOF_STATS: ProofStats = {
  recipeId: '',
  totalCooks: 0,
  withProof: 0,
  verifiedProofs: 0,
  recentProofs: []
};

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Submit proof of cooking a recipe (photo + optional note)
 */
export async function submitProof(
  recipeId: string,
  imageFile: File,
  note?: string
): Promise<ProofSubmitResponse> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    if (note) {
      formData.append('note', note);
    }

    const response = await api.post<ProofSubmitResponse>(
      `/api/recipes/${recipeId}/proof`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    
    console.log('✅ Submit Proof: Using real API');
    return response.data;
  } catch (error: any) {
    // Check if it's a real error from the API
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    // Mock fallback for demo
    console.warn('⚠️ Submit Proof: Backend unavailable, using mock');
    
    // Simulate 80% verification success rate
    const isVerified = Math.random() < 0.8;
    const verificationScore = isVerified 
      ? Math.round((0.75 + Math.random() * 0.23) * 100) / 100
      : Math.round((0.2 + Math.random() * 0.3) * 100) / 100;
    
    return {
      proof_id: `proof-mock-${Date.now()}`,
      verification_status: isVerified ? 'verified' : 'pending',
      verification_score: verificationScore,
      coins_awarded: isVerified ? 15 : 5,
      message: isVerified 
        ? 'Proof submitted successfully! ⭐ Verified!' 
        : 'Proof submitted successfully! Pending verification...'
    };
  }
}

/**
 * Submit proof using base64 image data (for camera capture)
 */
export async function submitProofBase64(
  recipeId: string,
  imageBase64: string,
  note?: string
): Promise<ProofSubmitResponse> {
  try {
    const response = await api.post<ProofSubmitResponse>(
      `/api/recipes/${recipeId}/proof`,
      { image: imageBase64, note }
    );
    
    console.log('✅ Submit Proof (Base64): Using real API');
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    // Use same mock as file upload
    console.warn('⚠️ Submit Proof (Base64): Backend unavailable, using mock');
    const isVerified = Math.random() < 0.8;
    
    return {
      proof_id: `proof-mock-${Date.now()}`,
      verification_status: isVerified ? 'verified' : 'pending',
      verification_score: isVerified ? 0.85 : 0.35,
      coins_awarded: isVerified ? 15 : 5,
      message: isVerified 
        ? 'Proof submitted successfully! ⭐ Verified!' 
        : 'Proof submitted successfully! Pending verification...'
    };
  }
}

/**
 * Get proof statistics for a recipe
 */
export async function getProofStats(recipeId: string): Promise<ProofStats> {
  try {
    const response = await api.get<{
      recipe_id: string;
      total_cooks: number;
      with_proof: number;
      verified_proofs: number;
      recent_proofs: any[];
    }>(`/api/recipes/${recipeId}/proof/stats`);
    
    console.log('✅ Proof Stats: Using real API');
    
    // Transform snake_case to camelCase
    return {
      recipeId: response.data.recipe_id,
      totalCooks: response.data.total_cooks,
      withProof: response.data.with_proof,
      verifiedProofs: response.data.verified_proofs,
      recentProofs: response.data.recent_proofs.map(p => ({
        id: p.id,
        userId: p.user_id,
        imageUrl: p.image_url,
        note: p.note,
        createdAt: p.created_at
      }))
    };
  } catch (error) {
    console.warn('⚠️ Proof Stats: Backend unavailable, using mock data');
    return MOCK_PROOF_STATS[recipeId] || { ...DEFAULT_PROOF_STATS, recipeId };
  }
}

/**
 * Get all verified proofs for a recipe (gallery view)
 */
export async function getRecipeProofs(
  recipeId: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ proofs: RecipeProof[]; total: number; hasMore: boolean }> {
  try {
    const response = await api.get<{
      proofs: any[];
      total: number;
      has_more: boolean;
    }>(`/api/recipes/${recipeId}/proofs`, {
      params: { limit, offset }
    });
    
    console.log('✅ Recipe Proofs: Using real API');
    
    return {
      proofs: response.data.proofs.map(p => ({
        id: p.id,
        userId: p.user_id,
        recipeId: recipeId,
        imageUrl: p.image_url,
        note: p.note,
        verificationStatus: 'verified' as const,
        verificationScore: p.verification_score,
        coinsAwarded: 15,
        createdAt: p.created_at
      })),
      total: response.data.total,
      hasMore: response.data.has_more
    };
  } catch (error) {
    console.warn('⚠️ Recipe Proofs: Backend unavailable, using mock data');
    
    const stats = MOCK_PROOF_STATS[recipeId];
    if (!stats) {
      return { proofs: [], total: 0, hasMore: false };
    }
    
    const mockProofs: RecipeProof[] = stats.recentProofs.map(p => ({
      id: p.id,
      userId: p.userId,
      recipeId: recipeId,
      imageUrl: p.imageUrl,
      note: p.note,
      verificationStatus: 'verified' as const,
      verificationScore: 0.9,
      coinsAwarded: 15,
      createdAt: p.createdAt
    }));
    
    return {
      proofs: mockProofs.slice(offset, offset + limit),
      total: mockProofs.length,
      hasMore: offset + limit < mockProofs.length
    };
  }
}

/**
 * Get all proofs submitted by a user
 */
export async function getUserProofs(userId: string): Promise<{
  proofs: RecipeProof[];
  totalVerified: number;
  totalPending: number;
}> {
  try {
    const response = await api.get<{
      proofs: any[];
      total_verified: number;
      total_pending: number;
    }>(`/api/users/${userId}/proofs`);
    
    console.log('✅ User Proofs: Using real API');
    
    return {
      proofs: response.data.proofs.map(p => ({
        id: p.id,
        userId: p.user_id,
        recipeId: p.recipe_id,
        imageUrl: p.image_url,
        note: p.note,
        verificationStatus: p.verification_status,
        verificationScore: p.verification_score,
        coinsAwarded: p.coins_awarded,
        createdAt: p.created_at
      })),
      totalVerified: response.data.total_verified,
      totalPending: response.data.total_pending
    };
  } catch (error) {
    console.warn('⚠️ User Proofs: Backend unavailable, using mock data');
    return { proofs: [], totalVerified: 0, totalPending: 0 };
  }
}
