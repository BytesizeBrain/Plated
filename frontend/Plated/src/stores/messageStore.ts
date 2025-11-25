import { create } from 'zustand';
import type { Message, Conversation, TypingIndicator } from '../types';

interface MessageState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Record<string, Message[]>; // conversationId -> messages
  unreadCount: number;
  typingIndicators: Record<string, TypingIndicator[]>; // conversationId -> typing users
  isLoading: boolean;
  error: string | null;

  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  setCurrentConversation: (conversation: Conversation | null) => void;

  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;

  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: (amount: number) => void;

  setTypingIndicator: (indicator: TypingIndicator) => void;
  removeTypingIndicator: (conversationId: string, userId: string) => void;

  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  markMessagesAsRead: (conversationId: string) => void;
  reset: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  conversations: [],
  currentConversation: null,
  messages: {},
  unreadCount: 0,
  typingIndicators: {},
  isLoading: false,
  error: null,

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) => set((state) => ({
    conversations: [conversation, ...state.conversations],
  })),

  updateConversation: (conversationId, updates) => set((state) => ({
    conversations: state.conversations.map((conv) =>
      conv.id === conversationId ? { ...conv, ...updates } : conv
    ),
  })),

  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),

  setMessages: (conversationId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [conversationId]: messages,
    },
  })),

  addMessage: (conversationId, message) => set((state) => {
    const existingMessages = state.messages[conversationId] || [];
    return {
      messages: {
        ...state.messages,
        [conversationId]: [...existingMessages, message],
      },
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId
          ? {
              ...conv,
              last_message: message,
              updated_at: message.created_at,
            }
          : conv
      ),
    };
  }),

  updateMessage: (conversationId, messageId, updates) => set((state) => ({
    messages: {
      ...state.messages,
      [conversationId]: (state.messages[conversationId] || []).map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      ),
    },
  })),

  setUnreadCount: (count) => set({ unreadCount: count }),

  incrementUnreadCount: () => set((state) => ({
    unreadCount: state.unreadCount + 1,
  })),

  decrementUnreadCount: (amount) => set((state) => ({
    unreadCount: Math.max(0, state.unreadCount - amount),
  })),

  setTypingIndicator: (indicator) => set((state) => {
    const conversationTyping = state.typingIndicators[indicator.conversation_id] || [];
    const filtered = conversationTyping.filter((t) => t.user_id !== indicator.user_id);

    return {
      typingIndicators: {
        ...state.typingIndicators,
        [indicator.conversation_id]: indicator.is_typing
          ? [...filtered, indicator]
          : filtered,
      },
    };
  }),

  removeTypingIndicator: (conversationId, userId) => set((state) => ({
    typingIndicators: {
      ...state.typingIndicators,
      [conversationId]: (state.typingIndicators[conversationId] || []).filter(
        (t) => t.user_id !== userId
      ),
    },
  })),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  markMessagesAsRead: (conversationId) => set((state) => {
    const messages = state.messages[conversationId] || [];
    const unreadInConversation = messages.filter((msg) => !msg.is_read).length;

    return {
      messages: {
        ...state.messages,
        [conversationId]: messages.map((msg) => ({ ...msg, is_read: true })),
      },
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      ),
      unreadCount: Math.max(0, state.unreadCount - unreadInConversation),
    };
  }),

  reset: () => set({
    conversations: [],
    currentConversation: null,
    messages: {},
    unreadCount: 0,
    typingIndicators: {},
    error: null,
  }),
}));
