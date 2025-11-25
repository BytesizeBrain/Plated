import { useState, useEffect, useRef, useMemo } from 'react';
import { format, isSameDay, isToday, isYesterday } from 'date-fns';
import type { Message } from '../../types';
import { useMessageStore } from '../../stores/messageStore';
import { getUserProfile } from '../../utils/api';
import './MessageThread.css';

interface MessageThreadProps {
  messages: Message[];
  conversationId: string;
}

function MessageThread({ messages, conversationId }: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { typingIndicators } = useMessageStore();
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const typingUsers = useMemo(() => typingIndicators[conversationId] || [], [typingIndicators, conversationId]);

  useEffect(() => {
    // Get current user ID
    getUserProfile().then((profile) => setCurrentUserId(profile.id)).catch(() => {});
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isToday(date)) {
        return format(date, 'h:mm a');
      } else if (isYesterday(date)) {
        return `Yesterday ${format(date, 'h:mm a')}`;
      } else {
        return format(date, 'MMM d, h:mm a');
      }
    } catch {
      return timestamp;
    }
  };

  const shouldShowDateDivider = (currentMsg: Message, previousMsg?: Message) => {
    if (!previousMsg) return true;

    try {
      const currentDate = new Date(currentMsg.created_at);
      const previousDate = new Date(previousMsg.created_at);
      return !isSameDay(currentDate, previousDate);
    } catch {
      return false;
    }
  };

  const formatDateDivider = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isToday(date)) {
        return 'Today';
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        return format(date, 'MMMM d, yyyy');
      }
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="message-thread">
      {messages.length === 0 ? (
        <div className="thread-empty">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <p>No messages yet</p>
          <p className="empty-subtitle">Send a message to start the conversation</p>
        </div>
      ) : (
        <div className="messages">
          {messages.map((message, index) => {
            const isOwnMessage = message.sender_id === currentUserId;
            const previousMessage = index > 0 ? messages[index - 1] : undefined;
            const showDateDivider = shouldShowDateDivider(message, previousMessage);

            return (
              <div key={message.id}>
                {showDateDivider && (
                  <div className="date-divider">
                    <span>{formatDateDivider(message.created_at)}</span>
                  </div>
                )}

                <div className={`message ${isOwnMessage ? 'own' : 'other'}`}>
                  {!isOwnMessage && (
                    <img
                      src={message.sender.profile_pic || '/default-avatar.png'}
                      alt={message.sender.display_name}
                      className="message-avatar"
                    />
                  )}

                  <div className="message-content">
                    {!isOwnMessage && (
                      <div className="message-sender">{message.sender.display_name}</div>
                    )}
                    <div className="message-bubble">
                      <p>{message.content}</p>
                    </div>
                    <div className="message-time">
                      {formatMessageTime(message.created_at)}
                      {isOwnMessage && message.status && (
                        <span className="message-status">
                          {message.status === 'sending' && '•'}
                          {message.status === 'sent' && '✓'}
                          {message.status === 'delivered' && '✓✓'}
                          {message.status === 'read' && <span className="read-receipt">✓✓</span>}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="message other">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

export default MessageThread;
