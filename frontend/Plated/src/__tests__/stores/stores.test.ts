/**
 * Store Tests
 * 
 * Tests for Zustand stores including:
 * - State management
 * - Actions and reducers
 * - Optimistic updates
 * - Error handling
 * - Performance optimizations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFeedStore } from '../stores/feedStore';
import { useMessageStore } from '../stores/messageStore';
import { mockPost, mockComment, mockConversation } from '../__tests__/utils';

describe('FeedStore', () => {
  beforeEach(() => {
    // Reset store state
    useFeedStore.setState({
      posts: [],
      filter: { type: 'for-you', sort_by: 'recent' },
      isLoading: false,
      error: null,
      hasMore: true,
      currentPage: 1,
    });
  });

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useFeedStore());
      
      expect(result.current.posts).toEqual([]);
      expect(result.current.filter).toEqual({ type: 'for-you', sort_by: 'recent' });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.hasMore).toBe(true);
      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('Post Management', () => {
    it('sets posts correctly', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.setPosts([mockPost]);
      });
      
      expect(result.current.posts).toEqual([mockPost]);
    });

    it('adds posts to existing list', () => {
      const { result } = renderHook(() => useFeedStore());
      const newPost = { ...mockPost, id: 'post-2', title: 'New Recipe' };
      
      act(() => {
        result.current.setPosts([mockPost]);
        result.current.addPosts([newPost]);
      });
      
      expect(result.current.posts).toHaveLength(2);
      expect(result.current.posts[0]).toEqual(mockPost);
      expect(result.current.posts[1]).toEqual(newPost);
    });

    it('updates specific post', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.setPosts([mockPost]);
        result.current.updatePost('post-1', { title: 'Updated Recipe' });
      });
      
      expect(result.current.posts[0].title).toBe('Updated Recipe');
      expect(result.current.posts[0].id).toBe('post-1');
    });

    it('does not update non-existent post', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.setPosts([mockPost]);
        result.current.updatePost('non-existent', { title: 'Updated Recipe' });
      });
      
      expect(result.current.posts[0].title).toBe('Test Recipe');
    });
  });

  describe('Optimistic Updates', () => {
    it('toggles like status optimistically', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.setPosts([mockPost]);
        result.current.toggleLike('post-1');
      });
      
      expect(result.current.posts[0].is_liked).toBe(true);
      expect(result.current.posts[0].likes_count).toBe(43);
    });

    it('toggles save status optimistically', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.setPosts([mockPost]);
        result.current.toggleSave('post-1');
      });
      
      expect(result.current.posts[0].is_saved).toBe(true);
    });

    it('increments comment count optimistically', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.setPosts([mockPost]);
        result.current.incrementCommentCount('post-1');
      });
      
      expect(result.current.posts[0].comments_count).toBe(6);
    });

    it('handles multiple optimistic updates correctly', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.setPosts([mockPost]);
        result.current.toggleLike('post-1');
        result.current.toggleSave('post-1');
        result.current.incrementCommentCount('post-1');
      });
      
      const post = result.current.posts[0];
      expect(post.is_liked).toBe(true);
      expect(post.is_saved).toBe(true);
      expect(post.likes_count).toBe(43);
      expect(post.comments_count).toBe(6);
    });
  });

  describe('Filter Management', () => {
    it('updates filter correctly', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.setFilter({ type: 'following' });
      });
      
      expect(result.current.filter.type).toBe('following');
      expect(result.current.filter.sort_by).toBe('recent'); // Should preserve other properties
    });

    it('updates multiple filter properties', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.setFilter({ 
          type: 'trending', 
          difficulty: 'easy',
          max_time: 30 
        });
      });
      
      expect(result.current.filter.type).toBe('trending');
      expect(result.current.filter.difficulty).toBe('easy');
      expect(result.current.filter.max_time).toBe(30);
    });
  });

  describe('Pagination', () => {
    it('increments page correctly', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.incrementPage();
      });
      
      expect(result.current.currentPage).toBe(2);
    });

    it('resets feed correctly', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.setPosts([mockPost]);
        result.current.setError('Some error');
        result.current.incrementPage();
        result.current.resetFeed();
      });
      
      expect(result.current.posts).toEqual([]);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Loading States', () => {
    it('sets loading state correctly', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.isLoading).toBe(true);
    });

    it('sets error state correctly', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.setError('Network error');
      });
      
      expect(result.current.error).toBe('Network error');
    });

    it('clears error state', () => {
      const { result } = renderHook(() => useFeedStore());
      
      act(() => {
        result.current.setError('Network error');
        result.current.setError(null);
      });
      
      expect(result.current.error).toBeNull();
    });
  });
});

describe('MessageStore', () => {
  beforeEach(() => {
    // Reset store state
    useMessageStore.setState({
      conversations: [],
      currentConversation: null,
      messages: {},
      unreadCount: 0,
      typingIndicators: {},
      isLoading: false,
      error: null,
    });
  });

  describe('Initial State', () => {
    it('has correct initial state', () => {
      const { result } = renderHook(() => useMessageStore());
      
      expect(result.current.conversations).toEqual([]);
      expect(result.current.currentConversation).toBeNull();
      expect(result.current.messages).toEqual({});
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.typingIndicators).toEqual({});
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Conversation Management', () => {
    it('sets conversations correctly', () => {
      const { result } = renderHook(() => useMessageStore());
      
      act(() => {
        result.current.setConversations([mockConversation]);
      });
      
      expect(result.current.conversations).toEqual([mockConversation]);
    });

    it('adds new conversation to the beginning', () => {
      const { result } = renderHook(() => useMessageStore());
      const newConversation = { ...mockConversation, id: 'conv-2' };
      
      act(() => {
        result.current.setConversations([mockConversation]);
        result.current.addConversation(newConversation);
      });
      
      expect(result.current.conversations).toHaveLength(2);
      expect(result.current.conversations[0]).toEqual(newConversation);
      expect(result.current.conversations[1]).toEqual(mockConversation);
    });

    it('updates specific conversation', () => {
      const { result } = renderHook(() => useMessageStore());
      
      act(() => {
        result.current.setConversations([mockConversation]);
        result.current.updateConversation('conv-1', { unread_count: 0 });
      });
      
      expect(result.current.conversations[0].unread_count).toBe(0);
    });

    it('sets current conversation', () => {
      const { result } = renderHook(() => useMessageStore());
      
      act(() => {
        result.current.setCurrentConversation(mockConversation);
      });
      
      expect(result.current.currentConversation).toEqual(mockConversation);
    });
  });

  describe('Message Management', () => {
    it('sets messages for conversation', () => {
      const { result } = renderHook(() => useMessageStore());
      const messages = [mockComment];
      
      act(() => {
        result.current.setMessages('conv-1', messages);
      });
      
      expect(result.current.messages['conv-1']).toEqual(messages);
    });

    it('adds message to conversation', () => {
      const { result } = renderHook(() => useMessageStore());
      const newMessage = { ...mockComment, id: 'msg-2', content: 'New message' };
      
      act(() => {
        result.current.setMessages('conv-1', [mockComment]);
        result.current.addMessage('conv-1', newMessage);
      });
      
      expect(result.current.messages['conv-1']).toHaveLength(2);
      expect(result.current.messages['conv-1'][1]).toEqual(newMessage);
    });

    it('updates specific message', () => {
      const { result } = renderHook(() => useMessageStore());
      
      act(() => {
        result.current.setMessages('conv-1', [mockComment]);
        result.current.updateMessage('conv-1', 'comment-1', { is_read: true });
      });
      
      expect(result.current.messages['conv-1'][0].is_read).toBe(true);
    });

    it('updates conversation when message is added', () => {
      const { result } = renderHook(() => useMessageStore());
      const newMessage = { ...mockComment, id: 'msg-2', content: 'New message' };
      
      act(() => {
        result.current.setConversations([mockConversation]);
        result.current.addMessage('conv-1', newMessage);
      });
      
      expect(result.current.conversations[0].last_message).toEqual(newMessage);
      expect(result.current.conversations[0].updated_at).toBe(newMessage.created_at);
    });
  });

  describe('Unread Count Management', () => {
    it('sets unread count correctly', () => {
      const { result } = renderHook(() => useMessageStore());
      
      act(() => {
        result.current.setUnreadCount(5);
      });
      
      expect(result.current.unreadCount).toBe(5);
    });

    it('increments unread count', () => {
      const { result } = renderHook(() => useMessageStore());
      
      act(() => {
        result.current.setUnreadCount(3);
        result.current.incrementUnreadCount();
      });
      
      expect(result.current.unreadCount).toBe(4);
    });

    it('decrements unread count', () => {
      const { result } = renderHook(() => useMessageStore());
      
      act(() => {
        result.current.setUnreadCount(5);
        result.current.decrementUnreadCount(2);
      });
      
      expect(result.current.unreadCount).toBe(3);
    });

    it('does not allow negative unread count', () => {
      const { result } = renderHook(() => useMessageStore());
      
      act(() => {
        result.current.setUnreadCount(2);
        result.current.decrementUnreadCount(5);
      });
      
      expect(result.current.unreadCount).toBe(0);
    });
  });

  describe('Typing Indicators', () => {
    it('sets typing indicator', () => {
      const { result } = renderHook(() => useMessageStore());
      const indicator = {
        conversation_id: 'conv-1',
        user_id: 'user-1',
        is_typing: true,
      };
      
      act(() => {
        result.current.setTypingIndicator(indicator);
      });
      
      expect(result.current.typingIndicators['conv-1']).toContainEqual(indicator);
    });

    it('removes typing indicator when is_typing is false', () => {
      const { result } = renderHook(() => useMessageStore());
      const indicator = {
        conversation_id: 'conv-1',
        user_id: 'user-1',
        is_typing: false,
      };
      
      act(() => {
        result.current.setTypingIndicator({ ...indicator, is_typing: true });
        result.current.setTypingIndicator(indicator);
      });
      
      expect(result.current.typingIndicators['conv-1']).not.toContainEqual(indicator);
    });

    it('removes specific typing indicator', () => {
      const { result } = renderHook(() => useMessageStore());
      
      act(() => {
        result.current.setTypingIndicator({
          conversation_id: 'conv-1',
          user_id: 'user-1',
          is_typing: true,
        });
        result.current.removeTypingIndicator('conv-1', 'user-1');
      });
      
      expect(result.current.typingIndicators['conv-1']).toEqual([]);
    });
  });

  describe('Mark Messages as Read', () => {
    it('marks all messages in conversation as read', () => {
      const { result } = renderHook(() => useMessageStore());
      const unreadMessage = { ...mockComment, is_read: false };
      
      act(() => {
        result.current.setMessages('conv-1', [unreadMessage]);
        result.current.setUnreadCount(1);
        result.current.markMessagesAsRead('conv-1');
      });
      
      expect(result.current.messages['conv-1'][0].is_read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
    });

    it('updates conversation unread count', () => {
      const { result } = renderHook(() => useMessageStore());
      
      act(() => {
        result.current.setConversations([mockConversation]);
        result.current.markMessagesAsRead('conv-1');
      });
      
      expect(result.current.conversations[0].unread_count).toBe(0);
    });
  });

  describe('Reset Functionality', () => {
    it('resets store to initial state', () => {
      const { result } = renderHook(() => useMessageStore());
      
      act(() => {
        result.current.setConversations([mockConversation]);
        result.current.setCurrentConversation(mockConversation);
        result.current.setMessages('conv-1', [mockComment]);
        result.current.setUnreadCount(5);
        result.current.setError('Some error');
        result.current.reset();
      });
      
      expect(result.current.conversations).toEqual([]);
      expect(result.current.currentConversation).toBeNull();
      expect(result.current.messages).toEqual({});
      expect(result.current.unreadCount).toBe(0);
      expect(result.current.error).toBeNull();
    });
  });
});
