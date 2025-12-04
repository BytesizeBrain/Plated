import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { Comment } from '../../types';
import { useFeedStore } from '../../stores/feedStore';
import { getPostComments, addComment } from '../../utils/api';
import './CommentSection.css';

interface CommentSectionProps {
  postId: string;
}

function CommentSection({ postId }: CommentSectionProps) {
  const { incrementCommentCount } = useFeedStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadComments();
  }, [postId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadComments = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await getPostComments(postId);
      setComments(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load comments';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');

      const comment = await addComment(postId, newComment.trim());
      setComments([...comments, comment]);
      setNewComment('');
      incrementCommentCount(postId);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to post comment';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="comment-section">
      <div className="comment-section-header">
        <h3>Comments ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      <form className="comment-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={isSubmitting}
          className="comment-input"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="comment-submit-btn"
        >
          {isSubmitting ? 'Posting...' : 'Post'}
        </button>
      </form>

      {error && <div className="comment-error">{error}</div>}

      {/* Comments List */}
      <div className="comments-list">
        {isLoading ? (
          <div className="comments-loading">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="comments-empty">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <img
                src={comment.user.profile_pic || '/default-avatar.png'}
                alt={comment.user.display_name}
                className="comment-avatar"
              />
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">{comment.user.display_name}</span>
                  <span className="comment-username">@{comment.user.username}</span>
                  <span className="comment-timestamp">{formatTime(comment.created_at)}</span>
                </div>
                <p className="comment-text">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;
