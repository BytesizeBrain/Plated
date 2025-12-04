import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGamificationStore } from '../../stores/gamificationStore';
import { getChallenge } from '../../utils/api';
import type { Challenge } from '../../types';
import './CookModePage.css'; // or your own ProofPage CSS

function ProofPage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const { challenges } = useGamificationStore();

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChallenge = async () => {
      if (!challengeId) {
        setError('No challenge selected.');
        setIsLoading(false);
        return;
      }

      // try store first
      const existing = challenges.find(c => c.id === challengeId);
      if (existing) {
        setChallenge(existing);
        setIsLoading(false);
        return;
      }

      try {
        const data = await getChallenge(challengeId);
        if (!data) {
          setError('Challenge not found.');
        } else {
          setChallenge(data);
        }
      } catch (err) {
        console.error('Error loading challenge for proof page:', err);
        setError('Unable to load challenge details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadChallenge();
  }, [challengeId, challenges]);

  if (isLoading) {
    return (
      <div className="cook-mode-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Loading proof screen…</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="cook-mode-page" style={{ padding: '2rem', color: 'white' }}>
        <h1>Proof submission</h1>
        <p>{error || 'Challenge data unavailable.'}</p>
        <button
          onClick={() => navigate('/challenges')}
          style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: 8 }}
        >
          Back to challenges
        </button>
      </div>
    );
  }

  return (
    <div className="cook-mode-page">
      <main className="cook-content">
        <h1>{challenge.recipe?.title || challenge.title}</h1>
        <p>🎉 Great job finishing the cook session!</p>
        <p>
          This is where we’ll ask for your proof photos / notes and show the coins / XP you earned
          (wired to the backend later).
        </p>

        <button
          onClick={() => navigate('/challenges')}
          style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', borderRadius: 10 }}
        >
          Back to challenges
        </button>
      </main>
    </div>
  );
}

export default ProofPage;
