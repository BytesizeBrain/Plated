import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGamificationStore } from '../../stores/gamificationStore';
import { getChallenge, estimateRecipeBudget } from '../../utils/api';
import type {
  Challenge,
  IngredientEstimateRequestItem,
  BudgetEstimateResponse,
} from '../../types';

import './CookModePage.css';

function CookModePage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { challenges, updateSessionStep, completeSession } = useGamificationStore();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerIntervalRef = useRef<number | null>(null);
  // Budget / ingredient price state
  const [budgetTarget, setBudgetTarget] = useState<number | ''>('');
  const [budgetResult, setBudgetResult] = useState<BudgetEstimateResponse | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);

  // Load challenge data with smart fallback (tries API first, falls back to mock if unavailable)
  useEffect(() => {
    const loadChallenge = async () => {
      if (!challengeId) {
        navigate('/challenges');
        return;
      }

      setIsLoading(true);
      
      // First try to find in store (might already be loaded)
      const existingChallenge = challenges.find(c => c.id === challengeId);
      if (existingChallenge) {
        setChallenge(existingChallenge);
        setIsLoading(false);
        return;
      }

      // If not in store, try API (with fallback to mock)
      try {
        const challengeData = await getChallenge(challengeId);
        if (challengeData) {
          setChallenge(challengeData);
        } else {
          // Challenge not found, redirect back
          navigate('/challenges');
        }
      } catch (error) {
        console.error('Error loading challenge:', error);
        // getChallenge already handles fallback, so if it fails here, challenge doesn't exist
        navigate('/challenges');
      } finally {
        setIsLoading(false);
      }
    };

    loadChallenge();
  }, [challengeId, challenges, navigate]);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="cook-mode-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading challenge...</p>
        </div>
      </div>
    );
  }

  // If challenge not found or invalid, will redirect
  if (!challenge || !challenge.recipe) {
    return null;
  }

  const steps = challenge.recipe.steps;
  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Build ingredient request items for backend
  type RecipeIngredientObject = {
    item?: string;
    name?: string;
    amount?: string;
    unit?: string;
  };

  function buildIngredientRequestItems(): IngredientEstimateRequestItem[] {
    const raw = challenge?.recipe?.ingredients as (string | RecipeIngredientObject)[] | undefined;

    if (!raw || raw.length === 0) {
      return [];
    }

    return raw
      .map((ing) => {
        // Case 1: simple string ingredient like "chicken breast"
        if (typeof ing === 'string') {
          return {
            name: ing,
            quantity: 1,
          };
        }

        // Case 2: object ingredient: { item?: string; name?: string; unit?: string; ... }
        const name = (ing.item || ing.name || '').trim();
        if (!name) {
          return null; // skip if we can't find a usable name
        }

        return {
          name,
          quantity: 1,
          unit: ing.unit,
        };
      })
      .filter((x): x is IngredientEstimateRequestItem => x !== null);
  }

  // Handle budget estimation
  const handleEstimateBudget = async () => {
    if (!challenge?.recipe) {
      setBudgetError('No recipe loaded to estimate cost.');
      return;
    }

    const items = buildIngredientRequestItems();
    if (items.length === 0) {
      setBudgetError('This recipe has no ingredients to estimate.');
      return;
    }

    setIsEstimating(true);
    setBudgetError(null);

    try {
      const maxBudget =
        typeof budgetTarget === 'number' ? budgetTarget : undefined;

      const result = await estimateRecipeBudget(items, maxBudget);
      setBudgetResult(result);
    } catch (err: any) {
      console.error('Budget estimate failed:', err);
      setBudgetError(err?.message || 'Failed to estimate grocery cost.');
    } finally {
      setIsEstimating(false);
    }
  };


  const startTimer = () => {
    if (!currentStep.timerSec) return;

    setTimerSeconds(currentStep.timerSec);
    setIsTimerRunning(true);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          stopTimer();
          // Play notification sound
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSyBzvLYiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUsAA==');
          audio.play().catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const resetTimer = () => {
    stopTimer();
    if (currentStep.timerSec) {
      setTimerSeconds(currentStep.timerSec);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNextStep = () => {
    updateSessionStep(currentStepIndex + 1);
    stopTimer();

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeSession();
      navigate(`/proof/${challengeId}`);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      stopTimer();
    }
  };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to exit? Your progress will be saved.')) {
      navigate('/challenges');
    }
  };

  return (
    <div className="cook-mode-page">
      {/* Header */}
      <header className="cook-header">
        <button className="exit-btn" onClick={handleExit} aria-label="Exit cook mode">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="cook-title">
          <h1>{challenge.recipe.title}</h1>
          <div className="step-indicator">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="cook-progress">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Main Content */}
      <main className="cook-content">
        {/* Budget & Grocery Cost */}
        <section className="cook-budget-panel">
          <h2 className="cook-budget-title">Budget & Grocery Cost</h2>

          <div className="cook-budget-controls">
            <label className="cook-budget-label">
              Your budget ($)
              <input
                type="number"
                min={0}
                step={1}
                value={budgetTarget}
                onChange={(e) => {
                  const val = e.target.value;
                  setBudgetTarget(val === '' ? '' : Number(val));
                }}
                className="cook-budget-input"
                placeholder="e.g. 25"
              />
            </label>

            <button
              type="button"
              onClick={handleEstimateBudget}
              disabled={isEstimating}
              className="cook-budget-button"
            >
              {isEstimating ? 'Estimating…' : 'Estimate grocery cost'}
            </button>
          </div>

          {budgetError && (
            <p className="cook-budget-error">{budgetError}</p>
          )}

          {budgetResult && (
            <div className="cook-budget-result">
              <p className="cook-budget-total">
                Estimated total:{' '}
                <strong>${budgetResult.total_estimated_cost.toFixed(2)}</strong>{' '}
                {budgetResult.currency}
              </p>

              {budgetResult.budget_goal && (
                <div className="cook-budget-goal">
                  {budgetResult.budget_goal.under_budget ? (
                    <p>
                      🎉 You’re under budget! You save{' '}
                      <strong>${budgetResult.budget_goal.savings.toFixed(2)}</strong>  
                      vs your goal of{' '}
                      <strong>${budgetResult.budget_goal.max_budget.toFixed(2)}</strong>
                    </p>
                  ) : (
                    <p>
                      ⚠️ You’re over budget by{' '}
                      <strong>{Math.abs(budgetResult.budget_goal.savings).toFixed(2)}</strong>  
                      vs your goal of{' '}
                      <strong>${budgetResult.budget_goal.max_budget.toFixed(2)}</strong>
                    </p>
                  )}

                  <p>
                    Potential coins earned:{' '}
                    <strong>{budgetResult.budget_goal.coins_earned}</strong> 🪙
                  </p>
                </div>
              )}

              <details className="cook-budget-items">
                <summary>View ingredient breakdown</summary>
                <ul>
                  {budgetResult.items.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.ingredient_name}</strong> —{' '}
                      {item.estimated_cost != null
                        ? `$${item.estimated_cost.toFixed(2)}`
                        : item.message || 'No price data found'}
                      {item.store_name ? ` @ ${item.store_name}` : ''}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          )}
        </section>

        {/* Safety Note */}
        {currentStep.safetyNote && (
          <div className="safety-alert">
            <div className="safety-icon">⚠️</div>
            <div className="safety-content">
              <h3>Safety Note</h3>
              <p>{currentStep.safetyNote}</p>
            </div>
          </div>
        )}

        {/* Step Image/Video */}
        {currentStep.media && (
          <div className="step-media">
            {currentStep.media.type === 'img' ? (
              <img src={currentStep.media.url} alt={`Step ${currentStepIndex + 1}`} />
            ) : (
              <video src={currentStep.media.url} controls />
            )}
          </div>
        )}

        {/* Step Instruction */}
        <div className="step-instruction">
          <div className="step-number">{currentStepIndex + 1}</div>
          <p className="step-text">{currentStep.text}</p>
        </div>

        {/* Techniques */}
        {currentStep.techniques && currentStep.techniques.length > 0 && (
          <div className="step-techniques">
            <h4>Techniques:</h4>
            <div className="technique-tags">
              {currentStep.techniques.map((tech, idx) => (
                <span key={idx} className="technique-tag">
                  {tech.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Timer */}
        {currentStep.timerSec && (
          <div className="step-timer">
            <div className={`timer-display ${isTimerRunning ? 'running' : ''} ${timerSeconds === 0 ? 'completed' : ''}`}>
              <div className="timer-icon">⏱️</div>
              <div className="timer-time">{formatTime(timerSeconds)}</div>
            </div>
            <div className="timer-controls">
              {!isTimerRunning ? (
                <button className="timer-btn start" onClick={startTimer}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Start Timer
                </button>
              ) : (
                <button className="timer-btn pause" onClick={stopTimer}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                  Pause
                </button>
              )}
              <button className="timer-btn reset" onClick={resetTimer}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                Reset
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Navigation */}
      <footer className="cook-footer">
        <button
          className="nav-btn prev"
          onClick={handlePreviousStep}
          disabled={currentStepIndex === 0}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Previous
        </button>

        <button
          className="nav-btn next"
          onClick={handleNextStep}
        >
          {currentStepIndex === steps.length - 1 ? 'Complete' : 'Next'}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </footer>

      {/* Completed Steps Indicator */}
      <div className="steps-overview">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`step-dot ${idx < currentStepIndex ? 'completed' : ''} ${idx === currentStepIndex ? 'current' : ''}`}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default CookModePage;
