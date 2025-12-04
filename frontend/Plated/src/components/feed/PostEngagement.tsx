import { useState } from 'react';
import type { FeedPost } from '../../types';
import { useFeedStore } from '../../stores/feedStore';
import { likePost, unlikePost, savePost, unsavePost, sharePost } from '../../utils/api';
import './PostEngagement.css';

interface PostEngagementProps {
  post: FeedPost;
  onCommentClick: () => void;
}

function PostEngagement({ post, onCommentClick }: PostEngagementProps) {
  const { toggleLike, toggleSave } = useFeedStore();
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;

    try {
      setIsLiking(true);
      toggleLike(post.id); // Optimistic update

      if (post.is_liked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (err) {
      // Revert on error
      toggleLike(post.id);
      console.error('Failed to toggle like:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      toggleSave(post.id); // Optimistic update

      if (post.is_saved) {
        await unsavePost(post.id);
      } else {
        await savePost(post.id);
      }
    } catch (err) {
      // Revert on error
      toggleSave(post.id);
      console.error('Failed to toggle save:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.description || `Check out this recipe: ${post.title}`,
          url: `${window.location.origin}/posts/${post.id}`,
        });
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/posts/${post.id}`);
        alert('Link copied to clipboard!');
      }

      await sharePost(post.id);
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  return (
    <div className="post-engagement">
      <button
        className={`engagement-btn ${post.is_liked ? 'active' : ''}`}
        onClick={handleLike}
        disabled={isLiking}
        aria-label="Like post"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={post.is_liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
        <span>{post.likes_count > 0 ? post.likes_count : ''}</span>
      </button>

      <button
        className="engagement-btn"
        onClick={onCommentClick}
        aria-label="Comment on post"
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
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>{post.comments_count > 0 ? post.comments_count : ''}</span>
      </button>

      <button
        className="engagement-btn"
        onClick={handleShare}
        aria-label="Share post"
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
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
      </button>

      <button
        className={`engagement-btn save-btn ${post.is_saved ? 'active' : ''}`}
        onClick={handleSave}
        disabled={isSaving}
        aria-label="Save post"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill={post.is_saved ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    </div>
  );
}

export default PostEngagement;
