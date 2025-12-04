import { formatDistanceToNow } from 'date-fns';
import type { Conversation } from '../../types';
import './ConversationList.css';

interface ConversationListProps {
  conversations: Conversation[];
  onSelect: (conversationId: string) => void;
  selectedId?: string;
}

function ConversationList({ conversations, onSelect, selectedId }: ConversationListProps) {
  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return timestamp;
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    // Assuming 1-on-1 conversations, get the other participant
    return conversation.participants[0]; // Simplified - backend should filter to show only other user
  };

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h2>Messages</h2>
        <button className="new-message-btn" aria-label="New message">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3h18v18h-18z"></path>
            <polyline points="12 8 12 16"></polyline>
            <polyline points="8 12 16 12"></polyline>
          </svg>
        </button>
      </div>

      <div className="conversation-search">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input type="text" placeholder="Search conversations..." />
      </div>

      <div className="conversations">
        {conversations.length === 0 ? (
          <div className="conversations-empty">
            <p>No conversations yet</p>
            <p className="empty-subtitle">Start a new conversation to get started</p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const participant = getOtherParticipant(conversation);
            const isSelected = conversation.id === selectedId;

            return (
              <button
                key={conversation.id}
                className={`conversation-item ${isSelected ? 'selected' : ''} ${conversation.unread_count > 0 ? 'unread' : ''}`}
                onClick={() => onSelect(conversation.id)}
              >
                <div className="conversation-avatar">
                  <img
                    src={participant.profile_pic || '/default-avatar.png'}
                    alt={participant.display_name}
                  />
                  {conversation.unread_count > 0 && (
                    <span className="unread-dot"></span>
                  )}
                </div>

                <div className="conversation-details">
                  <div className="conversation-header">
                    <span className="conversation-name">
                      {participant.display_name}
                    </span>
                    {conversation.last_message && (
                      <span className="conversation-time">
                        {formatTime(conversation.last_message.created_at)}
                      </span>
                    )}
                  </div>

                  <div className="conversation-preview">
                    {conversation.last_message ? (
                      <span className={conversation.unread_count > 0 ? 'unread-text' : ''}>
                        {conversation.last_message.content}
                      </span>
                    ) : (
                      <span className="no-messages">No messages yet</span>
                    )}
                  </div>
                </div>

                {conversation.unread_count > 0 && (
                  <span className="unread-count">{conversation.unread_count}</span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ConversationList;
