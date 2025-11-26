# backend/routes/engagement_routes.py
from flask import Blueprint, request, jsonify, g
from supabase_client import supabase
import uuid

engagement_bp = Blueprint("engagement", __name__)

@engagement_bp.route("/posts/like", methods=["POST"])
def like_post():
    """Like a post"""
    data = request.get_json() or {}
    post_id = data.get('post_id')

    if not post_id:
        return jsonify({"error": "post_id required"}), 400

    # TODO: Get user_id from JWT
    user_id = data.get('user_id', str(uuid.uuid4()))

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
def unlike_post():
    """Unlike a post"""
    data = request.get_json() or {}
    post_id = data.get('post_id')

    if not post_id:
        return jsonify({"error": "post_id required"}), 400

    user_id = data.get('user_id', str(uuid.uuid4()))

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
def check_user_liked_post(post_id):
    """Check if current user liked a post"""
    # TODO: Get user_id from JWT
    user_id = request.args.get('user_id', 'mock-user')

    try:
        result = supabase.table("likes")\
            .select("id")\
            .eq("post_id", post_id)\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({"liked": len(result.data) > 0}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
