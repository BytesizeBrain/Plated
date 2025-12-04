import { useState, useEffect } from 'react';
import { getUserSquadBadge } from '../../utils/squadApi';
import './SquadBadge.css';

interface SquadBadgeProps {
  userId: string;
  size?: 'small' | 'medium';
}

/**
 * A small badge component that displays a user's squad name.
 * Can be used on profile cards, post cards, etc.
 */
function SquadBadge({ userId, size = 'small' }: SquadBadgeProps) {
  const [squadName, setSquadName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSquadBadge = async () => {
      try {
        const data = await getUserSquadBadge(userId);
        if (data.has_squad) {
          setSquadName(data.squad_name);
        }
      } catch (err) {
        console.error('Failed to fetch squad badge:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSquadBadge();
  }, [userId]);

  if (isLoading || !squadName) {
    return null;
  }

  return (
    <span className={`squad-badge-inline ${size}`} title={`${squadName} Squad`}>
      <span className="squad-badge-icon">👥</span>
      <span className="squad-badge-name">{squadName}</span>
    </span>
  );
}

export default SquadBadge;
