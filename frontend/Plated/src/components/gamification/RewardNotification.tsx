import React, { useEffect, useState } from 'react';
import './RewardNotification.css';

export type NotificationType =
  | 'recipe_complete'
  | 'level_up'
  | 'challenge_complete'
  | 'challenge_failed'
  | 'cooking'
  | 'eating';

interface RewardNotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  rewards?: {
    coins?: number;
    xp?: number;
    level?: number;
  };
  autoHide?: boolean;
  duration?: number; // milliseconds
  onClose?: () => void;
}

const NOTIFICATION_IMAGES: Record<NotificationType, string> = {
  recipe_complete: '/assets/gamification/HappyCooking.jpg',
  level_up: '/assets/gamification/LevelUp.jpg',
  challenge_complete: '/assets/gamification/ChallengeCompleted.jpg',
  challenge_failed: '/assets/gamification/ChallengeFailed.jpg',
  cooking: '/assets/gamification/CookingWithCat.jpg',
  eating: '/assets/gamification/Eating.jpg',
};

export const RewardNotification: React.FC<RewardNotificationProps> = ({
  type,
  title,
  message,
  rewards,
  autoHide = true,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300); // Match CSS animation duration
  };

  if (!isVisible) return null;

  const imageSrc = NOTIFICATION_IMAGES[type];

  return (
    <div className={`reward-notification ${isExiting ? 'exiting' : ''}`}>
      <div className="notification-card">
        <button className="close-button" onClick={handleClose} aria-label="Close">
          ×
        </button>

        <div className="notification-image">
          <img src={imageSrc} alt={type} />
        </div>

        <div className="notification-content">
          <h3 className="notification-title">{title}</h3>
          <p className="notification-message">{message}</p>

          {rewards && (
            <div className="rewards-display">
              {rewards.coins !== undefined && (
                <div className="reward-badge coins">
                  <span className="reward-icon">🪙</span>
                  <span className="reward-value">+{rewards.coins}</span>
                </div>
              )}
              {rewards.xp !== undefined && (
                <div className="reward-badge xp">
                  <span className="reward-icon">⭐</span>
                  <span className="reward-value">+{rewards.xp} XP</span>
                </div>
              )}
              {rewards.level !== undefined && (
                <div className="reward-badge level">
                  <span className="reward-icon">🎊</span>
                  <span className="reward-value">Level {rewards.level}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook for managing notification queue
export const useRewardNotifications = () => {
  const [notifications, setNotifications] = useState<Array<RewardNotificationProps & { id: string }>>([]);

  const showNotification = (notification: Omit<RewardNotificationProps, 'onClose'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    setNotifications((prev) => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    showNotification,
    removeNotification,
  };
};

// Container for multiple notifications
export const RewardNotificationContainer: React.FC<{
  notifications: Array<RewardNotificationProps & { id: string }>;
  onRemove: (id: string) => void;
}> = ({ notifications, onRemove }) => {
  return (
    <div className="reward-notification-container">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <RewardNotification
            {...notification}
            onClose={() => onRemove(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};
