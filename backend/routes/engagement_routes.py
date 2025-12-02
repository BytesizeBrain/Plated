# backend/routes/engagement_routes.py
from flask import Blueprint, request, jsonify, g
from supabase_client import supabase
from routes.user_routes import jwt_required, get_user_id_from_jwt
import uuid

engagement_bp = Blueprint("engagement", __name__)

@engagement_bp.route("/posts/like", methods=["POST"])
@jwt_required
def like_post():
    """Like a post"""
    data = request.get_json() or {}
    post_id = data.get('post_id')

    if not post_id:
        return jsonify({"error": "post_id required"}), 400

    user_id, error = get_user_id_from_jwt()
    if error:
        return error

    try:
        # Check if post exists
        post_check = supabase.table("posts").select("id").eq("id", post_id).execute()
        if not post_check.data:
            return jsonify({"error": "Post not found"}), 404

        # Insert like (UNIQUE constraint prevents duplicates)
        supabase.table("likes").insert({
            "post_id": post_id,
            "user_id": user_id
        }).execute()

        return jsonify({"liked": True, "message": "Post liked"}), 201

    except Exception as e:
        # If duplicate, it's already liked
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            return jsonify({"liked": True, "message": "Already liked"}), 200
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/like", methods=["DELETE"])
@jwt_required
def unlike_post():
    """Unlike a post"""
    data = request.get_json() or {}
    post_id = data.get('post_id')

    if not post_id:
        return jsonify({"error": "post_id required"}), 400

    user_id, error = get_user_id_from_jwt()
    if error:
        return error

    try:
        result = supabase.table("likes")\
            .delete()\
            .eq("post_id", post_id)\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({"liked": False, "message": "Post unliked"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/<post_id>/likes", methods=["GET"])
def get_post_likes_count(post_id):
    """Get total likes for a post"""
    try:
        result = supabase.table("likes")\
            .select("id", count="exact")\
            .eq("post_id", post_id)\
            .execute()

        return jsonify({"count": result.count or 0}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/<post_id>/liked", methods=["GET"])
@jwt_required
def check_user_liked_post(post_id):
    """Check if current user liked a post"""
    user_id, error = get_user_id_from_jwt()
    if error:
        return error

    try:
        result = supabase.table("likes")\
            .select("id")\
            .eq("post_id", post_id)\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({"liked": len(result.data) > 0}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/comments", methods=["POST"])
@jwt_required
def create_comment():
    """Create a comment on a post"""
    data = request.get_json() or {}
    post_id = data.get('post_id')
    content = data.get('content', '').strip()

    if not post_id or not content:
        return jsonify({"error": "post_id and content required"}), 400

    user_id, error = get_user_id_from_jwt()
    if error:
        return error

    try:
        # NOTE: DB column is 'text', not 'content'
        result = supabase.table("comments").insert({
            "post_id": post_id,
            "user_id": user_id,
            "text": content  # DB uses 'text' column
        }).execute()

        # Return with 'content' key for API consistency
        comment_data = result.data[0]
        comment_data['content'] = comment_data.get('text', '')

        return jsonify(comment_data), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/<post_id>/comments", methods=["GET"])
def get_post_comments(post_id):
    """Get all comments for a post"""
    try:
        # Get comments with user info
        comments_result = supabase.table("comments")\
            .select("*")\
            .eq("post_id", post_id)\
            .order("created_at", desc=False)\
            .execute()

        comments = comments_result.data or []

        # Get user info for each comment
        user_ids = list(set(c['user_id'] for c in comments))
        if user_ids:
            users_result = supabase.table("user")\
                .select("id, username, display_name, profile_pic")\
                .in_("id", user_ids)\
                .execute()

            users_map = {u['id']: u for u in (users_result.data or [])}

            # Attach user info to comments and map 'text' to 'content'
            for comment in comments:
                user = users_map.get(comment['user_id'], {})
                comment['user'] = {
                    'username': user.get('username', 'Unknown'),
                    'display_name': user.get('display_name') or user.get('username', 'Unknown'),
                    'profile_pic': user.get('profile_pic')
                }
                # Map DB 'text' column to API 'content' key
                comment['content'] = comment.get('text', '')

        return jsonify({"comments": comments, "count": len(comments)}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/comments/<comment_id>", methods=["DELETE"])
@jwt_required
def delete_comment(comment_id):
    """Delete a comment (user must own it)"""
    user_id, error = get_user_id_from_jwt()
    if error:
        return error

    try:
        # Delete only if user owns it
        result = supabase.table("comments")\
            .delete()\
            .eq("id", comment_id)\
            .eq("user_id", user_id)\
            .execute()

        if not result.data:
            return jsonify({"error": "Comment not found or unauthorized"}), 404

        return jsonify({"message": "Comment deleted"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/save", methods=["POST"])
@jwt_required
def save_post():
    """Save/bookmark a post"""
    data = request.get_json() or {}
    post_id = data.get('post_id')

    if not post_id:
        return jsonify({"error": "post_id required"}), 400

    user_id, error = get_user_id_from_jwt()
    if error:
        return error

    try:
        supabase.table("saved_posts").insert({
            "post_id": post_id,
            "user_id": user_id
        }).execute()

        return jsonify({"saved": True, "message": "Post saved"}), 201

    except Exception as e:
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            return jsonify({"saved": True, "message": "Already saved"}), 200
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/save", methods=["DELETE"])
@jwt_required
def unsave_post():
    """Unsave/unbookmark a post"""
    data = request.get_json() or {}
    post_id = data.get('post_id')

    if not post_id:
        return jsonify({"error": "post_id required"}), 400

    user_id, error = get_user_id_from_jwt()
    if error:
        return error

    try:
        supabase.table("saved_posts")\
            .delete()\
            .eq("post_id", post_id)\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({"saved": False, "message": "Post unsaved"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/saved", methods=["GET"])
@jwt_required
def get_saved_posts():
    """Get all saved posts for current user"""
    user_id, error = get_user_id_from_jwt()
    if error:
        return error
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    start = (page - 1) * per_page
    end = start + per_page - 1

    try:
        # Get saved post IDs
        saved_result = supabase.table("saved_posts")\
            .select("post_id, saved_at")\
            .eq("user_id", user_id)\
            .order("saved_at", desc=True)\
            .range(start, end)\
            .execute()

        if not saved_result.data:
            return jsonify({"posts": [], "page": page, "per_page": per_page}), 200

        post_ids = [s['post_id'] for s in saved_result.data]

        # Get full post data
        posts_result = supabase.table("posts")\
            .select("*")\
            .in_("id", post_ids)\
            .execute()

        return jsonify({
            "posts": posts_result.data or [],
            "page": page,
            "per_page": per_page
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
