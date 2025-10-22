import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { useMessageStore } from '../../stores/messageStore';
import { getConversations } from '../../utils/api';
import ConversationList from '../../components/messages/ConversationList';
import ChatWindow from '../../components/messages/ChatWindow';
import './DirectMessagesPage.css';

function DirectMessagesPage() {
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const {
    conversations,
    currentConversation,
    setConversations,
    setCurrentConversation,
    setLoading,
    setError,
  } = useMessageStore();

  const [showMobileChat, setShowMobileChat] = useState(false);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Set current conversation based on URL
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
        setShowMobileChat(true);
      }
    }
  }, [conversationId, conversations, setCurrentConversation]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConversations();
      setConversations(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    navigate(`/messages/${conversationId}`);
    setShowMobileChat(true);
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
    navigate('/messages');
    setCurrentConversation(null);
  };

  return (
    <div className="dm-page">
      {/* Header */}
      <header className="dm-header">
        <div className="dm-header-content">
          {showMobileChat ? (
            <button className="back-btn" onClick={handleBackToList}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
          ) : (
            <button className="back-btn" onClick={() => navigate('/feed')}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
          <h1>Messages</h1>
          <div className="header-spacer"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="dm-content">
        {/* Conversation List - Desktop: always visible, Mobile: hide when chat is open */}
        <div className={`dm-sidebar ${showMobileChat ? 'mobile-hidden' : ''}`}>
          <ConversationList
            conversations={conversations}
            onSelect={handleConversationSelect}
            selectedId={currentConversation?.id}
          />
        </div>

        {/* Chat Window - Desktop: always visible, Mobile: show when conversation selected */}
        <div className={`dm-main ${!showMobileChat ? 'mobile-hidden' : ''}`}>
          {currentConversation ? (
            <ChatWindow
              conversation={currentConversation}
              onBack={handleBackToList}
            />
          ) : (
            <div className="dm-empty">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <h2>Select a conversation</h2>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DirectMessagesPage;
