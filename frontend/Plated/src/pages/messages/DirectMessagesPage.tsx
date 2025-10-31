import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';
import { useMessageStore } from '../../stores/messageStore';
import { getConversations } from '../../utils/api';
import ConversationList from '../../components/messages/ConversationList';
import ChatWindow from '../../components/messages/ChatWindow';
import BottomNav from '../../components/navigation/BottomNav';
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
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMessage);
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

  const handleNewMessage = () => {
    setShowNewMessageModal(true);
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
          <button 
            className="new-message-btn"
            onClick={handleNewMessage}
            aria-label="New message"
          >
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
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
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

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="modal-overlay" onClick={() => setShowNewMessageModal(false)}>
          <div className="new-message-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Message</h2>
              <button 
                className="modal-close"
                onClick={() => setShowNewMessageModal(false)}
              >
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
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              <p>Select a user to start a new conversation:</p>
              <div className="user-list">
                {/* Mock users for now - in real app, this would be fetched from API */}
                <div className="user-item" onClick={() => {
                  setShowNewMessageModal(false);
                  // In real app, create new conversation and navigate to it
                  alert('New conversation started! (Mock implementation)');
                }}>
                  <img 
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" 
                    alt="Maria Rodriguez"
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <div className="user-name">Maria Rodriguez</div>
                    <div className="user-handle">@chef_maria</div>
                  </div>
                </div>
                <div className="user-item" onClick={() => {
                  setShowNewMessageModal(false);
                  alert('New conversation started! (Mock implementation)');
                }}>
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face" 
                    alt="John Smith"
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <div className="user-name">John Smith</div>
                    <div className="user-handle">@john_cook</div>
                  </div>
                </div>
                <div className="user-item" onClick={() => {
                  setShowNewMessageModal(false);
                  alert('New conversation started! (Mock implementation)');
                }}>
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face" 
                    alt="Sarah Johnson"
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <div className="user-name">Sarah Johnson</div>
                    <div className="user-handle">@sarah_baker</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default DirectMessagesPage;
