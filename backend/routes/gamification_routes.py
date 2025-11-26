# backend/routes/gamification_routes.py
from flask import Blueprint, request, jsonify
from supabase_client import supabase
from datetime import datetime, date
import uuid

gamification_bp = Blueprint("gamification", __name__)

@gamification_bp.route("/gamification/<user_id>", methods=["GET"])
def get_user_gamification(user_id):
    """Get gamification stats for user"""
    try:
        result = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()

        if not result.data:
            # Create initial record if doesn't exist
            init_data = {
                "user_id": user_id,
                "xp": 0,
                "level": 1,
                "coins": 0,
                "current_streak": 0,
                "longest_streak": 0
            }
            create_res = supabase.table("user_gamification").insert(init_data).execute()
            return jsonify(create_res.data[0]), 200

        return jsonify(result.data[0]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/<user_id>/xp", methods=["POST"])
def add_xp(user_id):
    """Add XP to user (called when user completes actions)"""
    data = request.get_json() or {}
    xp_amount = data.get('amount', 0)

    if xp_amount <= 0:
        return jsonify({"error": "amount must be positive"}), 400

    try:
        # Get current stats
        current = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()

        if not current.data:
            # Initialize
            current_xp = 0
            current_level = 1
        else:
            current_xp = current.data[0]['xp']
            current_level = current.data[0]['level']

        # Add XP
        new_xp = current_xp + xp_amount

        # Calculate new level (simple: every 100 XP = 1 level)
        new_level = (new_xp // 100) + 1

        # Update (NOTE: user_gamification table doesn't have updated_at column)
        update_data = {
            "xp": new_xp,
            "level": new_level
        }

        if current.data:
            supabase.table("user_gamification")\
                .update(update_data)\
                .eq("user_id", user_id)\
                .execute()
        else:
            update_data["user_id"] = user_id
            supabase.table("user_gamification").insert(update_data).execute()

        level_up = new_level > current_level

        return jsonify({
            "xp": new_xp,
            "level": new_level,
            "level_up": level_up,
            "xp_gained": xp_amount
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/<user_id>/coins", methods=["POST"])
def add_coins(user_id):
    """Add coins to user"""
    data = request.get_json() or {}
    coin_amount = data.get('amount', 0)

    if coin_amount <= 0:
        return jsonify({"error": "amount must be positive"}), 400

    try:
        current = supabase.table("user_gamification")\
            .select("coins")\
            .eq("user_id", user_id)\
            .execute()

        current_coins = current.data[0]['coins'] if current.data else 0
        new_coins = current_coins + coin_amount

        # NOTE: user_gamification table doesn't have updated_at column
        supabase.table("user_gamification")\
            .update({"coins": new_coins})\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({"coins": new_coins, "coins_gained": coin_amount}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/<user_id>/streak", methods=["POST"])
def update_streak(user_id):
    """Update user's activity streak"""
    try:
        current = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()

        today = date.today()

        if not current.data:
            # Initialize with streak = 1
            init_data = {
                "user_id": user_id,
                "current_streak": 1,
                "longest_streak": 1,
                "last_activity_date": today.isoformat()
            }
            supabase.table("user_gamification").insert(init_data).execute()
            return jsonify({"current_streak": 1, "longest_streak": 1}), 200

        stats = current.data[0]
        last_activity = stats.get('last_activity_date')
        current_streak = stats.get('current_streak', 0)
        longest_streak = stats.get('longest_streak', 0)

        if last_activity:
            last_date = date.fromisoformat(last_activity)
            days_diff = (today - last_date).days

            if days_diff == 0:
                # Already logged today
                return jsonify({"current_streak": current_streak, "longest_streak": longest_streak}), 200
            elif days_diff == 1:
                # Consecutive day
                current_streak += 1
            else:
                # Streak broken
                current_streak = 1
        else:
            current_streak = 1

        # Update longest streak
        if current_streak > longest_streak:
            longest_streak = current_streak

        # NOTE: user_gamification table doesn't have updated_at column
        supabase.table("user_gamification")\
            .update({
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "last_activity_date": today.isoformat()
            })\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({"current_streak": current_streak, "longest_streak": longest_streak}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/badges", methods=["GET"])
def get_all_badges():
    """Get all available badges"""
    try:
        result = supabase.table("badges").select("*").execute()
        return jsonify({"badges": result.data or []}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/<user_id>/badges", methods=["GET"])
def get_user_badges(user_id):
    """Get badges earned by user"""
    try:
        result = supabase.table("user_badges")\
            .select("badge_id, earned_at")\
            .eq("user_id", user_id)\
            .execute()

        badge_ids = [b['badge_id'] for b in (result.data or [])]

        if not badge_ids:
            return jsonify({"badges": []}), 200

        badges_res = supabase.table("badges")\
            .select("*")\
            .in_("id", badge_ids)\
            .execute()

        return jsonify({"badges": badges_res.data or []}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/challenges", methods=["GET"])
def get_challenges():
    """Get active challenges"""
    try:
        result = supabase.table("challenges")\
            .select("*")\
            .eq("is_active", True)\
            .order("created_at", desc=True)\
            .execute()

        return jsonify({"challenges": result.data or []}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
