# backend/routes/gamification_routes.py
from flask import Blueprint, request, jsonify
from supabase_client import supabase
from datetime import datetime, date
import uuid
import logging

from routes.user_routes import jwt_required, get_user_id_from_jwt

logger = logging.getLogger(__name__)

MOCK_SKILL_TRACKS = [
    {
        "id": "mock-microwave-master",
        "slug": "microwave-master",
        "name": "Microwave Master",
        "description": "Master the art of microwave-only cooking with zero kitchen cleanup.",
        "icon": "🔥",
        "totalRecipes": 10,
        "completedRecipes": 3,
        "completedAt": None
    },
    {
        "id": "mock-five-ingredient-hero",
        "slug": "five-ingredient-hero",
        "name": "5-Ingredient Hero",
        "description": "Flex your creativity when the pantry is almost empty.",
        "icon": "🧠",
        "totalRecipes": 8,
        "completedRecipes": 5,
        "completedAt": "2025-01-15T15:00:00Z"
    },
    {
        "id": "mock-budget-pro",
        "slug": "five-dollar-dinners",
        "name": "$5 Dinner Pro",
        "description": "Stack coins by cooking dinners that cost less than a latte.",
        "icon": "💰",
        "totalRecipes": 7,
        "completedRecipes": 2,
        "completedAt": None
    },
    {
        "id": "mock-late-night-noodles",
        "slug": "late-night-noodles",
        "name": "Late-Night Noodles",
        "description": "Instant noodle glow-ups tailor-made for all-nighter study sessions.",
        "icon": "🍜",
        "totalRecipes": 9,
        "completedRecipes": 7,
        "completedAt": None
    }
]

def _ensure_user_access(requested_user_id: str | None = None):
    """Return authenticated user_id and optionally enforce it matches requested_user_id."""
    user_id, error = get_user_id_from_jwt()
    if error:
        return None, error

    if requested_user_id and str(user_id) != str(requested_user_id):
        return None, (jsonify({"error": "Forbidden"}), 403)

    return user_id, None

gamification_bp = Blueprint("gamification", __name__)

@gamification_bp.route("/gamification/<user_id>", methods=["GET"])
@jwt_required
def get_user_gamification(user_id):
    """Get gamification stats for user"""
    auth_user_id, error = _ensure_user_access(user_id)
    if error:
        return error

    target_user_id = str(auth_user_id)
    try:
        result = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", target_user_id)\
            .execute()

        if not result.data:
            # Create initial record if doesn't exist
            init_data = {
                "user_id": target_user_id,
                "xp": 0,
                "level": 1,
                "coins": 0,
                "current_streak": 0,
                "longest_streak": 0
            }
            create_res = supabase.table("user_gamification").insert(init_data).execute()
            logger.info(
                "[GAMIFICATION] user=%s created initial record",
                target_user_id
            )
            return jsonify(create_res.data[0]), 200

        logger.info(
            "[GAMIFICATION] user=%s retrieved record",
            target_user_id
        )
        return jsonify(result.data[0]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/<user_id>/xp", methods=["POST"])
@jwt_required
def add_xp(user_id):
    """Add XP to user (called when user completes actions)"""
    auth_user_id, error = _ensure_user_access(user_id)
    if error:
        return error

    target_user_id = str(auth_user_id)
    data = request.get_json() or {}
    xp_amount = data.get('amount', 0)

    if xp_amount <= 0:
        return jsonify({"error": "amount must be positive"}), 400

    try:
        # Get current stats
        current = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", target_user_id)\
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
                .eq("user_id", target_user_id)\
                .execute()
        else:
            update_data["user_id"] = target_user_id
            supabase.table("user_gamification").insert(update_data).execute()

        level_up = new_level > current_level

        logger.info(
            "[XP] user=%s delta=%s new_xp=%s new_level=%s level_up=%s",
            target_user_id,
            xp_amount,
            new_xp,
            new_level,
            level_up
        )

        return jsonify({
            "xp": new_xp,
            "level": new_level,
            "level_up": level_up,
            "xp_gained": xp_amount
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/<user_id>/coins", methods=["POST"])
@jwt_required
def add_coins(user_id):
    """Add coins to user"""
    auth_user_id, error = _ensure_user_access(user_id)
    if error:
        return error

    target_user_id = str(auth_user_id)
    data = request.get_json() or {}
    coin_amount = data.get('amount', 0)

    if coin_amount <= 0:
        return jsonify({"error": "amount must be positive"}), 400

    try:
        current = supabase.table("user_gamification")\
            .select("coins")\
            .eq("user_id", target_user_id)\
            .execute()

        current_coins = current.data[0]['coins'] if current.data else 0
        new_coins = current_coins + coin_amount

        # NOTE: user_gamification table doesn't have updated_at column
        supabase.table("user_gamification")\
            .update({"coins": new_coins})\
            .eq("user_id", target_user_id)\
            .execute()

        logger.info(
            "[COINS] user=%s delta=%s new_coins=%s reason=manual",
            target_user_id,
            coin_amount,
            new_coins
        )

        return jsonify({"coins": new_coins, "coins_gained": coin_amount}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/<user_id>/streak", methods=["POST"])
@jwt_required
def update_streak(user_id):
    """Update user's activity streak"""
    auth_user_id, error = _ensure_user_access(user_id)
    if error:
        return error

    target_user_id = str(auth_user_id)
    try:
        current = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", target_user_id)\
            .execute()

        today = date.today()

        if not current.data:
            # Initialize with streak = 1
            init_data = {
                "user_id": target_user_id,
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
            .eq("user_id", target_user_id)\
            .execute()

        logger.info(f"User {target_user_id} updated streak, current streak: {current_streak}, longest streak: {longest_streak}")

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
        logger.exception("Error fetching badges")
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/<user_id>/badges", methods=["GET"])
@jwt_required
def get_user_badges(user_id):
    """Get badges earned by user"""
    auth_user_id, error = _ensure_user_access(user_id)
    if error:
        return error

    target_user_id = str(auth_user_id)
    try:
        result = supabase.table("user_badges")\
            .select("badge_id, earned_at")\
            .eq("user_id", target_user_id)\
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
        logger.exception("Error fetching user badges")
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/challenges", methods=["GET"])
@jwt_required
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
        logger.exception("Error fetching challenges")
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/rewards/summary", methods=["GET"])
@jwt_required
def get_rewards_summary():
    """Get current user's rewards summary (XP, coins, level, streak)

    Returns a summary of gamification data for the authenticated user.
    Falls back to default values if no gamification data exists.
    """
    requested_user_id = request.args.get("user_id")
    auth_user_id, error = _ensure_user_access(requested_user_id)
    if error:
        return error

    target_user_id = str(auth_user_id)

    try:
        default_summary = {
            "xp": 0,
            "level": 1,
            "nextLevelXp": 100,
            "coins": 0,
            "streak": {
                "currentDays": 0,
                "freezeTokens": 0,
                "nextCutoff": None
            },
            "badges": []
        }

        # Get user gamification stats
        gamification_res = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", target_user_id)\
            .execute()

        if not gamification_res.data:
            return jsonify(default_summary), 200

        stats = gamification_res.data[0]

        # Get user badges
        badges_res = supabase.table("user_badges")\
            .select("badge_id, earned_at")\
            .eq("user_id", target_user_id)\
            .execute()

        badge_ids = [b['badge_id'] for b in (badges_res.data or [])]
        badges = []

        if badge_ids:
            badges_details = supabase.table("badges")\
                .select("*")\
                .in_("id", badge_ids)\
                .execute()
            badges = badges_details.data or []

        # Calculate next level XP (simple: 100 XP per level)
        current_level = stats.get('level', 1)
        next_level_xp = current_level * 100

        summary = {
            "xp": stats.get('xp', 0),
            "level": current_level,
            "nextLevelXp": next_level_xp,
            "coins": stats.get('coins', 0),
            "streak": {
                "currentDays": stats.get('current_streak', 0),
                "freezeTokens": stats.get('freeze_tokens', 0),
                "nextCutoff": stats.get('last_activity_date')
            },
            "badges": badges
        }

        return jsonify(summary), 200
    except Exception as e:
        logger.exception("Error fetching rewards summary")
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/recipes/<recipe_id>/complete", methods=["POST"])
@jwt_required
def complete_recipe(recipe_id):
    """
    Mark a recipe as cooked by the user (Cooked-It Chain feature).

    Logic:
    1. Check if user already completed this recipe (idempotent)
    2. Create recipe_completion record
    3. Award base coins + check for Daily Chaos bonus
    4. Award creator bonus if applicable
    5. Update skill track progress
    6. Check if any skill track is now complete

    Returns:
        {
            "reward": int,           # Total coins earned
            "creator_bonus": int,    # Bonus given to creator
            "chaos_bonus": int,      # Bonus from daily ingredient
            "xp_gained": int,        # XP earned
            "level_up": bool         # Whether user leveled up
        }
    """
    auth_user_id, error = _ensure_user_access()
    if error:
        return error

    user_id = str(auth_user_id)

    try:
        # Check if already completed (idempotent)
        existing = supabase.table("recipe_completion")\
            .select("id")\
            .eq("user_id", user_id)\
            .eq("recipe_id", recipe_id)\
            .execute()

        if existing.data:
            return jsonify({"message": "Already completed", "reward": 0}), 200

        # Create completion record
        supabase.table("recipe_completion")\
            .insert({
                "user_id": user_id,
                "recipe_id": recipe_id,
                "has_proof": False
            })\
            .execute()

        # Calculate reward
        base_reward = 10
        chaos_bonus = 0
        xp_gained = 15  # Base XP for completing a recipe

        # Check Daily Chaos Ingredient
        today = date.today().isoformat()
        daily_response = supabase.table("daily_ingredient")\
            .select("*")\
            .eq("date", today)\
            .execute()

        if daily_response.data:
            daily = daily_response.data[0]
            ingredient = daily["ingredient"]

            # Check if recipe uses this ingredient
            tag_response = supabase.table("recipe_ingredient_tag")\
                .select("id")\
                .eq("recipe_id", recipe_id)\
                .ilike("ingredient", f"%{ingredient}%")\
                .execute()

            if tag_response.data:
                multiplier = float(daily["multiplier"])
                chaos_bonus = int(base_reward * (multiplier - 1))
                xp_gained = int(xp_gained * multiplier)  # Chaos bonus applies to XP too
                logger.info(
                    "[CHAOS_BONUS] user=%s recipe=%s ingredient=%s multiplier=%s",
                    user_id,
                    recipe_id,
                    ingredient,
                    multiplier
                )

        total_reward = base_reward + chaos_bonus

        # Award coins to user via transaction log
        supabase.table("coin_transaction")\
            .insert({
                "user_id": user_id,
                "amount": total_reward,
                "reason": "recipe_completion",
                "metadata": {
                    "recipe_id": recipe_id,
                    "chaos_bonus": chaos_bonus > 0
                }
            })\
            .execute()

        # Update user_gamification coins balance
        current_stats = supabase.table("user_gamification")\
            .select("coins")\
            .eq("user_id", user_id)\
            .execute()

        if current_stats.data:
            new_coins = current_stats.data[0]['coins'] + total_reward
            supabase.table("user_gamification")\
                .update({"coins": new_coins})\
                .eq("user_id", user_id)\
                .execute()

        # Award XP
        current_xp_res = supabase.table("user_gamification")\
            .select("xp, level")\
            .eq("user_id", user_id)\
            .execute()

        level_up = False
        if current_xp_res.data:
            current_xp = current_xp_res.data[0]['xp']
            current_level = current_xp_res.data[0]['level']
            new_xp = current_xp + xp_gained
            new_level = (new_xp // 100) + 1
            level_up = new_level > current_level

            supabase.table("user_gamification")\
                .update({"xp": new_xp, "level": new_level})\
                .eq("user_id", user_id)\
                .execute()

        # Get recipe details for creator bonus
        creator_bonus = 0
        recipe_response = supabase.table("posts")\
            .select("user_id")\
            .eq("id", recipe_id)\
            .execute()

        if recipe_response.data:
            recipe = recipe_response.data[0]
            creator_id = recipe.get("user_id")
            if creator_id and str(creator_id) != str(user_id):
                creator_bonus = 5
                supabase.table("coin_transaction")\
                    .insert({
                        "user_id": creator_id,
                        "amount": creator_bonus,
                        "reason": "creator_completion_bonus",
                        "metadata": {
                            "recipe_id": recipe_id,
                            "from_user_id": user_id
                        }
                    })\
                    .execute()

                # Update creator's coin balance
                creator_stats = supabase.table("user_gamification")\
                    .select("coins")\
                    .eq("user_id", creator_id)\
                    .execute()

                if creator_stats.data:
                    creator_new_coins = creator_stats.data[0]['coins'] + creator_bonus
                    supabase.table("user_gamification")\
                        .update({"coins": creator_new_coins})\
                        .eq("user_id", creator_id)\
                        .execute()

                logger.info(
                    "[CREATOR_BONUS] recipe=%s creator=%s bonus=%s from_user=%s",
                    recipe_id,
                    creator_id,
                    creator_bonus,
                    user_id
                )

        # Update skill track progress
        TRACK_COMPLETION_THRESHOLD = 5  # Number of recipes to complete a track
        tracks_response = supabase.table("skill_track_recipe")\
            .select("track_id")\
            .eq("recipe_id", recipe_id)\
            .execute()

        for track_link in (tracks_response.data or []):
            track_id = track_link["track_id"]

            # Get or create progress
            progress_response = supabase.table("skill_track_progress")\
                .select("*")\
                .eq("user_id", user_id)\
                .eq("track_id", track_id)\
                .execute()

            if not progress_response.data:
                # Create new progress entry
                supabase.table("skill_track_progress")\
                    .insert({
                        "user_id": user_id,
                        "track_id": track_id,
                        "completed_recipes": 1
                    })\
                    .execute()
            else:
                # Increment progress
                progress = progress_response.data[0]
                new_count = progress["completed_recipes"] + 1

                update_data = {"completed_recipes": new_count}

                # Check if track is complete
                if new_count >= TRACK_COMPLETION_THRESHOLD:
                    update_data["completed_at"] = datetime.utcnow().isoformat()

                    # Award track completion bonus
                    supabase.table("coin_transaction")\
                        .insert({
                            "user_id": user_id,
                            "amount": 50,
                            "reason": "skill_track_completed",
                            "metadata": {"track_id": track_id}
                        })\
                        .execute()

                    # Update coins
                    user_stats = supabase.table("user_gamification")\
                        .select("coins")\
                        .eq("user_id", user_id)\
                        .execute()

                    if user_stats.data:
                        final_coins = user_stats.data[0]['coins'] + 50
                        supabase.table("user_gamification")\
                            .update({"coins": final_coins})\
                            .eq("user_id", user_id)\
                            .execute()

                    logger.info(
                        "[TRACK_COMPLETED] user=%s track=%s bonus=%s",
                        user_id,
                        track_id,
                        50
                    )

                supabase.table("skill_track_progress")\
                    .update(update_data)\
                    .eq("user_id", user_id)\
                    .eq("track_id", track_id)\
                    .execute()

                logger.info(
                    "[TRACK_PROGRESS] user=%s track=%s completed_recipes=%s threshold=%s",
                    user_id,
                    track_id,
                    update_data.get("completed_recipes"),
                    TRACK_COMPLETION_THRESHOLD
                )

        logger.info(
            "[RECIPE_COMPLETE] user=%s recipe=%s reward=%s chaos_bonus=%s xp=%s level_up=%s creator_bonus=%s",
            user_id,
            recipe_id,
            total_reward,
            chaos_bonus,
            xp_gained,
            level_up,
            creator_bonus
        )

        return jsonify({
            "reward": total_reward,
            "creator_bonus": creator_bonus,
            "chaos_bonus": chaos_bonus,
            "xp_gained": xp_gained,
            "level_up": level_up
        }), 201

    except Exception as e:
        logger.exception("Error completing recipe")
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/recipes/<recipe_id>/completions", methods=["GET"])
@jwt_required
def get_recipe_completions(recipe_id):
    """
    Get the "Cooked-It Chain" – list of users who completed this recipe.

    Returns:
        {
            "count": int,
            "users": [
                {
                    "userId": str,
                    "username": str,
                    "avatarUrl": str,
                    "createdAt": str
                }
            ],
            "recipeId": str
        }
    """
    try:
        # Get completions
        completions_response = supabase.table("recipe_completion")\
            .select("user_id, created_at")\
            .eq("recipe_id", recipe_id)\
            .order("created_at", desc=False)\
            .limit(50)\
            .execute()

        data = []

        # For each completion, fetch user profile from local SQLite
        # NOTE: In production, you might want to join with Supabase users table
        for completion in (completions_response.data or []):
            user_id = completion["user_id"]

            # Try to get user from local SQLite first
            from models.user_model import User
            user = User.query.filter_by(id=user_id).first()

            if user:
                data.append({
                    "userId": str(user_id),
                    "username": user.username,
                    "avatarUrl": user.profile_pic,
                    "createdAt": completion["created_at"]
                })
            else:
                # Fallback: user not in local DB
                data.append({
                    "userId": str(user_id),
                    "username": "Unknown User",
                    "avatarUrl": None,
                    "createdAt": completion["created_at"]
                })

        return jsonify({
            "count": len(data),
            "users": data,
            "recipeId": recipe_id
        }), 200

    except Exception as e:
        logger.exception("Error fetching recipe completions")
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/daily-ingredient", methods=["GET"])
@jwt_required
def get_daily_ingredient():
    """
    Get today's Chaos Ingredient with multiplier.

    Returns:
        {
            "active": bool,
            "ingredient": str,      # e.g., "eggs"
            "multiplier": float,    # e.g., 2.0
            "date": str,            # ISO date
            "icon_emoji": str       # e.g., "🥚"
        }

        OR if no daily ingredient:

        {
            "active": false
        }
    """
    try:
        today = date.today().isoformat()
        response = supabase.table("daily_ingredient")\
            .select("*")\
            .eq("date", today)\
            .execute()

        if not response.data:
            return jsonify({"active": False}), 200

        daily = response.data[0]
        return jsonify({
            "active": True,
            "ingredient": daily["ingredient"],
            "multiplier": float(daily["multiplier"]),
            "date": daily["date"],
            "icon_emoji": daily.get("icon_emoji")
        }), 200

    except Exception as e:
        logger.exception("Error fetching daily ingredient")
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/skill-tracks", methods=["GET"])
@jwt_required
def get_skill_tracks():
    """
    Get all skill tracks with the current user's progress on each.

    Query params:
        user_id (optional): If provided, returns user's progress

    Returns:
        [
            {
                "id": str,
                "slug": str,
                "name": str,
                "description": str,
                "icon": str,
                "totalRecipes": int,
                "completedRecipes": int,
                "completedAt": str | null
            }
        ]
    """
    requested_user_id = request.args.get("user_id")
    auth_user_id, error = _ensure_user_access(requested_user_id)
    if error:
        return error

    target_user_id = str(auth_user_id)

    try:
        # Get all tracks
        tracks_response = supabase.table("skill_track")\
            .select("*")\
            .order("display_order", desc=False)\
            .execute()

        if not (tracks_response.data or []):
            logger.info("No skill tracks found in Supabase, returning mock data")
            return jsonify(MOCK_SKILL_TRACKS), 200

        # Get user's progress if user_id provided
        progress_map = {}
        progress_response = supabase.table("skill_track_progress")\
            .select("*")\
            .eq("user_id", target_user_id)\
            .execute()

        progress_map = {p["track_id"]: p for p in (progress_response.data or [])}

        data = []
        for track in (tracks_response.data or []):
            track_id = track["id"]

            # Count total recipes in track
            recipe_count_response = supabase.table("skill_track_recipe")\
                .select("id", count="exact")\
                .eq("track_id", track_id)\
                .execute()

            total_recipes = recipe_count_response.count or 0

            progress = progress_map.get(track_id)
            data.append({
                "id": track_id,
                "slug": track["slug"],
                "name": track["name"],
                "description": track.get("description"),
                "icon": track.get("icon"),
                "totalRecipes": total_recipes,
                "completedRecipes": progress["completed_recipes"] if progress else 0,
                "completedAt": progress.get("completed_at") if progress else None
            })

        return jsonify(data), 200

    except Exception as e:
        logger.exception("Error fetching skill tracks from Supabase, returning mock data")
        return jsonify(MOCK_SKILL_TRACKS), 200