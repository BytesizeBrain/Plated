# backend/routes/social_routes.py
from flask import Blueprint, request, jsonify
from supabase_client import supabase
import uuid

social_bp = Blueprint("social", __name__)

@social_bp.route("/users/<user_id>/follow", methods=["POST"])
def follow_user(user_id):
    """Follow a user"""
    data = request.get_json() or {}
    follower_id = data.get('follower_id')  # TODO: Get from JWT

    if not follower_id:
        return jsonify({"error": "follower_id required"}), 400

    if follower_id == user_id:
        return jsonify({"error": "Cannot follow yourself"}), 400

    try:
        # Check if user exists
        user_check = supabase.table("user").select("id").eq("id", user_id).execute()
        if not user_check.data:
            return jsonify({"error": "User not found"}), 404

        # Insert follow relationship (NOTE: DB uses 'following_id' not 'followed_id')
        supabase.table("followers").insert({
            "follower_id": follower_id,
            "following_id": user_id  # Actual DB column name
        }).execute()

        return jsonify({"following": True, "message": "User followed"}), 201

    except Exception as e:
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            return jsonify({"following": True, "message": "Already following"}), 200
        return jsonify({"error": str(e)}), 500

@social_bp.route("/users/<user_id>/follow", methods=["DELETE"])
def unfollow_user(user_id):
    """Unfollow a user"""
    data = request.get_json() or {}
    follower_id = data.get('follower_id')  # TODO: Get from JWT

    if not follower_id:
        return jsonify({"error": "follower_id required"}), 400

    try:
        supabase.table("followers")\
            .delete()\
            .eq("follower_id", follower_id)\
            .eq("following_id", user_id)\
            .execute()

        return jsonify({"following": False, "message": "User unfollowed"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@social_bp.route("/users/<user_id>/followers", methods=["GET"])
def get_followers(user_id):
    """Get list of followers for a user"""
    try:
        # Get follower IDs
        followers_res = supabase.table("followers")\
            .select("follower_id")\
            .eq("following_id", user_id)\
            .execute()

        follower_ids = [f['follower_id'] for f in (followers_res.data or [])]

        if not follower_ids:
            return jsonify({"followers": [], "count": 0}), 200

        # Get user info for followers
        users_res = supabase.table("user")\
            .select("id, username, display_name, profile_pic")\
            .in_("id", follower_ids)\
            .execute()

        return jsonify({
            "followers": users_res.data or [],
            "count": len(users_res.data or [])
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@social_bp.route("/users/<user_id>/following", methods=["GET"])
def get_following(user_id):
    """Get list of users that this user follows"""
    try:
        # Get followed user IDs
        following_res = supabase.table("followers")\
            .select("following_id")\
            .eq("follower_id", user_id)\
            .execute()

        followed_ids = [f['following_id'] for f in (following_res.data or [])]

        if not followed_ids:
            return jsonify({"following": [], "count": 0}), 200

        # Get user info
        users_res = supabase.table("user")\
            .select("id, username, display_name, profile_pic")\
            .in_("id", followed_ids)\
            .execute()

        return jsonify({
            "following": users_res.data or [],
            "count": len(users_res.data or [])
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@social_bp.route("/users/<user_id>/following/<target_id>", methods=["GET"])
def check_following_status(user_id, target_id):
    """Check if user_id follows target_id"""
    try:
        result = supabase.table("followers")\
            .select("follower_id")\
            .eq("follower_id", user_id)\
            .eq("following_id", target_id)\
            .execute()

        return jsonify({"following": len(result.data or []) > 0}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@social_bp.route("/users/<user_id>/stats", methods=["GET"])
def get_user_stats(user_id):
    """Get follower/following counts"""
    try:
        # Count followers
        followers_res = supabase.table("followers")\
            .select("follower_id", count="exact")\
            .eq("following_id", user_id)\
            .execute()

        # Count following
        following_res = supabase.table("followers")\
            .select("following_id", count="exact")\
            .eq("follower_id", user_id)\
            .execute()

        # Count posts
        posts_res = supabase.table("posts")\
            .select("id", count="exact")\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({
            "followers_count": followers_res.count or 0,
            "following_count": following_res.count or 0,
            "posts_count": posts_res.count or 0
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
