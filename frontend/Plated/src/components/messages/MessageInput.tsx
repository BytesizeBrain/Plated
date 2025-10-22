import { useState, useRef } from 'react';
import { useMessageStore } from '../../stores/messageStore';
import { sendMessage } from '../../utils/api';
import './MessageInput.css';

interface MessageInputProps {
  conversationId: string;
}

function MessageInput({ conversationId }: MessageInputProps) {
  const { addMessage } = useMessageStore();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    const messageContent = message.trim();
    setMessage('');

    try {
      setIsSending(true);

      // Optimistic update - add message with sending status
      const tempMessage = {
        id: `temp-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: 'current-user', // Will be replaced by backend response
        sender: {
          username: 'you',
          display_name: 'You',
          profile_pic: '',
        },
        content: messageContent,
        created_at: new Date().toISOString(),
        is_read: false,
        status: 'sending' as const,
      };

      addMessage(conversationId, tempMessage);

      // Send to backend
      await sendMessage({
        conversation_id: conversationId,
        content: messageContent,
      });

      // Replace temp message with real one
      // In a real app, we'd remove the temp message and add the real one
      // For now, the backend response will have the correct ID
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <button type="button" className="emoji-btn" aria-label="Add emoji">
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
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      </button>

      <textarea
        ref={inputRef}
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={isSending}
        className="message-textarea"
        rows={1}
      />

      <button
        type="submit"
        className="send-btn"
        disabled={!message.trim() || isSending}
        aria-label="Send message"
      >
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
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </form>
  );
}

export default MessageInput;
