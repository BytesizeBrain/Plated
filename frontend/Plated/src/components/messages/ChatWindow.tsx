import { useEffect } from 'react';
import type { Conversation } from '../../types';
import { useMessageStore } from '../../stores/messageStore';
import { getConversationMessages, markMessagesAsRead as markAsReadApi } from '../../utils/api';
import MessageThread from './MessageThread';
import MessageInput from './MessageInput';
import './ChatWindow.css';

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
}

function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { messages, setMessages, markMessagesAsRead, setLoading, setError } = useMessageStore();
  const conversationMessages = messages[conversation.id] || [];

  // Load messages
  useEffect(() => {
    loadMessages();
    markConversationAsRead();
  }, [conversation.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConversationMessages(conversation.id);
      setMessages(conversation.id, data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async () => {
    try {
      if (conversation.unread_count > 0) {
        await markAsReadApi(conversation.id);
        markMessagesAsRead(conversation.id);
      }
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  const getOtherParticipant = () => {
    return conversation.participants[0]; // Simplified - backend should filter
  };

  const participant = getOtherParticipant();

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        {onBack && (
          <button className="chat-back-btn mobile-only" onClick={onBack}>
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
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
        )}

        <div className="chat-user-info">
          <img
            src={participant.profile_pic || '/default-avatar.png'}
            alt={participant.display_name}
            className="chat-user-avatar"
          />
          <div className="chat-user-details">
            <div className="chat-user-name">{participant.display_name}</div>
            <div className="chat-username">@{participant.username}</div>
          </div>
        </div>

        <button className="chat-menu-btn" aria-label="More options">
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
            <circle cx="12" cy="12" r="1"></circle>
            <circle cx="12" cy="5" r="1"></circle>
            <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>
      </div>

      {/* Message Thread */}
      <MessageThread messages={conversationMessages} conversationId={conversation.id} />

      {/* Message Input */}
      <MessageInput conversationId={conversation.id} />
    </div>
  );
}

export default ChatWindow;
