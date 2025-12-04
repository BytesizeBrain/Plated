import React, { useEffect, useState } from 'react';
import { useGamificationStore } from '../../stores/gamificationStore';
import { getProofStats } from '../../utils/proofApi';
import { ProofUploadModal } from './ProofUploadModal';
import type { ProofStats, ProofSubmitResponse } from '../../types';
import './RecipeActions.css';

interface RecipeActionsProps {
  recipeId: string;
  recipeName?: string; // Recipe title for proof modal
  ingredients: string[]; // List of ingredient strings from the recipe
  userId?: string; // Optional: current user ID
}

export const RecipeActions: React.FC<RecipeActionsProps> = ({
  recipeId,
  recipeName,
  ingredients,
  userId,
}) => {
  const {
    completeRecipe,
    fetchRecipeCompletions,
    fetchDailyIngredient,
    completionsByRecipe,
    dailyIngredient,
  } = useGamificationStore();

  const [isCompleting, setIsCompleting] = useState(false);
  const [showRewardToast, setShowRewardToast] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [proofStats, setProofStats] = useState<ProofStats | null>(null);
  const [rewardData, setRewardData] = useState<{
    reward: number;
    chaos_bonus: number;
    xp_gained: number;
    level_up: boolean;
    proof_bonus?: number;
  } | null>(null);

  const completionData = completionsByRecipe[recipeId];

  useEffect(() => {
    // Fetch data on mount
    fetchDailyIngredient();
    fetchRecipeCompletions(recipeId);
    
    // Fetch proof stats
    getProofStats(recipeId).then(setProofStats).catch(console.error);
  }, [recipeId, fetchRecipeCompletions, fetchDailyIngredient]);

  // Check if this recipe uses today's chaos ingredient
  const isChaosRecipe =
    dailyIngredient?.active &&
    dailyIngredient.ingredient &&
    ingredients
      .map((i) => i.toLowerCase())
      .some((ing) => ing.includes(dailyIngredient.ingredient!.toLowerCase()));

  const handleComplete = async () => {
    if (!userId) {
      alert('Please log in to complete recipes!');
      return;
    }

    setIsCompleting(true);
    try {
      const response = await completeRecipe(recipeId, userId);
      setRewardData(response);
      setShowRewardToast(true);
      
      // After showing reward, prompt for proof upload
      setTimeout(() => {
        setShowRewardToast(false);
        setShowProofModal(true); // Show proof upload modal
      }, 2000);
    } catch (error) {
      console.error('Failed to complete recipe:', error);
      alert('Failed to complete recipe. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleProofSuccess = (result: ProofSubmitResponse) => {
    // Update reward data with proof bonus
    if (result.coins_awarded > 0) {
      setRewardData(prev => prev ? {
        ...prev,
        proof_bonus: result.coins_awarded
      } : null);
    }
    
    // Refresh proof stats
    getProofStats(recipeId).then(setProofStats).catch(console.error);
  };

  return (
    <div className="recipe-actions-container">
      {/* Daily Chaos Ingredient Banner */}
      {isChaosRecipe && dailyIngredient && (
        <div className="chaos-banner">
          <span className="chaos-emoji">{dailyIngredient.icon_emoji || '⚡'}</span>
          <div className="chaos-text">
            <strong>Today's Chaos Ingredient:</strong> {dailyIngredient.ingredient}
            <span className="chaos-multiplier">
              {dailyIngredient.multiplier}x coins & XP!
            </span>
          </div>
        </div>
      )}

      {/* Complete Recipe Button */}
      <button
        className="cooked-button"
        onClick={handleComplete}
        disabled={isCompleting}
      >
        {isCompleting ? 'Submitting...' : 'I cooked this! 🎉'}
      </button>

      {/* Reward Toast */}
      {showRewardToast && rewardData && (
        <div className="reward-toast">
          <div className="reward-toast-content">
            <div className="reward-item">
              <span className="reward-icon">🪙</span>
              <span className="reward-value">+{rewardData.reward} coins</span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">⭐</span>
              <span className="reward-value">+{rewardData.xp_gained} XP</span>
            </div>
            {rewardData.level_up && (
              <div className="reward-item level-up">
                <span className="reward-icon">🎊</span>
                <span className="reward-value">LEVEL UP!</span>
              </div>
            )}
            {rewardData.chaos_bonus > 0 && (
              <div className="reward-item chaos">
                <span className="reward-icon">⚡</span>
                <span className="reward-value">
                  +{rewardData.chaos_bonus} chaos bonus!
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cooked-It Chain with Proof Stats */}
      {(completionData && completionData.count > 0) || (proofStats && proofStats.totalCooks > 0) ? (
        <div className="cooked-chain">
          <div className="chain-header">
            <span className="chain-count">
              {proofStats?.totalCooks || completionData?.count || 0} cooks
              {proofStats && proofStats.verifiedProofs > 0 && (
                <span className="proof-count">
                  {' · '}{proofStats.verifiedProofs} with proof ⭐
                </span>
              )}
            </span>
          </div>
          <div className="chain-avatars">
            {completionData?.users.slice(0, 10).map((user) => (
              <div 
                key={user.userId} 
                className={`avatar-wrapper ${user.hasProof ? 'has-proof' : ''}`} 
                title={user.username + (user.hasProof ? ' ⭐' : '')}
              >
                <img
                  src={user.avatarUrl || '/default-avatar.png'}
                  alt={user.username}
                  className="avatar"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-avatar.png';
                  }}
                />
                {user.hasProof && <span className="proof-star">⭐</span>}
              </div>
            ))}
            {completionData && completionData.count > 10 && (
              <div className="avatar-wrapper more-count">
                <span>+{completionData.count - 10}</span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Proof Upload Modal */}
      <ProofUploadModal
        isOpen={showProofModal}
        onClose={() => setShowProofModal(false)}
        recipeId={recipeId}
        recipeName={recipeName}
        onSuccess={handleProofSuccess}
      />
    </div>
  );
};
