// src/pages/cook/ProofPage.tsx
import { useNavigate, useParams } from 'react-router-dom';
import { useGamificationStore } from '../../stores/gamificationStore';
import './ProofPage.css';

function ProofPage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { challenges, rewards } = useGamificationStore();

  const challenge = challenges.find((c) => c.id === challengeId);

  if (!challenge) {
    return (
      <div className="proof-page">
        <div className="proof-card">
          <h1>Challenge not found</h1>
          <p>We couldn’t find this cooking challenge. Try starting again from the challenges page.</p>
          <button
            className="proof-primary-btn"
            onClick={() => navigate('/challenges')}
          >
            Back to challenges
          </button>
        </div>
      </div>
    );
  }

  const baseRewards = challenge.rewards;
  const xp = baseRewards?.xp ?? 0;
  const coins = baseRewards?.coins ?? 0;
  const badgeCount = baseRewards?.badges?.length ?? 0;

  return (
    <div className="proof-page">
      <div className="proof-hero">
        <span className="proof-pill">Challenge complete</span>
        <h1>{challenge.recipe?.title ?? challenge.title}</h1>
        <p>
          🎉 Great job finishing this cook session!
          <br />
          This is where you’ll upload your proof pics / notes and see your rewards.
        </p>
      </div>

      <div className="proof-grid">
        {/* Left: Rewards summary */}
        <section className="proof-card rewards-card">
          <h2>Your rewards for this challenge</h2>
          <div className="proof-reward-row">
            <div className="proof-reward-box">
              <div className="icon">⭐</div>
              <div className="value">{xp}</div>
              <div className="label">XP</div>
            </div>
            <div className="proof-reward-box">
              <div className="icon">🪙</div>
              <div className="value">{coins}</div>
              <div className="label">Coins</div>
            </div>
            <div className="proof-reward-box">
              <div className="icon">🏆</div>
              <div className="value">{badgeCount}</div>
              <div className="label">Badges (potential)</div>
            </div>
          </div>

          {rewards && (
            <div className="proof-current-stats">
              <p>
                You’re currently <strong>Level {rewards.level}</strong> with{' '}
                <strong>{rewards.xp}</strong> XP and{' '}
                <strong>{rewards.coins}</strong> coins in your wallet.
              </p>
            </div>
          )}
        </section>

        {/* Right: “Proof” placeholders */}
        <section className="proof-card proof-inputs">
          <h2>Proof & Notes (coming soon)</h2>

          <div className="proof-input-group">
            <label>Upload your cook photos</label>
            <div className="proof-upload-placeholder">
              <span>📸 Drag & drop or click to upload (future feature)</span>
            </div>
          </div>

          <div className="proof-input-group">
            <label>How did it go?</label>
            <textarea
              className="proof-notes"
              placeholder="Write a quick note to your future self: what worked, what you’d tweak next time…"
              disabled
            />
            <small className="disabled-hint">
              (Read-only mock for now – this will be wired to the backend later.)
            </small>
          </div>

          <div className="proof-actions">
            <button
              className="proof-secondary-btn"
              onClick={() => navigate(`/cook/${challenge.id}`)}
            >
              View steps again
            </button>
            <button
              className="proof-primary-btn"
              onClick={() => navigate('/challenges')}
            >
              Back to challenges
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ProofPage;
