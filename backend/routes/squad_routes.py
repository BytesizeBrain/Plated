# backend/routes/squad_routes.py
"""
Squad Pot - Team Cooking Challenges

Simple V1 implementation:
- Create Squad (gets an invite code)
- Join Squad via code
- Squad page with member list + total squad points this week
- Simple leaderboard: "Top squads this week"
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
import random
import string
import logging

from routes.user_routes import jwt_required, get_user_id_from_jwt

logger = logging.getLogger(__name__)

squad_bp = Blueprint("squad", __name__)

# ============================================================================
# MOCK DATA - Will be replaced with Supabase when tables are created
# ============================================================================

MOCK_SQUADS = {
    "squad-dorm-4b": {
        "id": "squad-dorm-4b",
        "name": "Dorm 4B",
        "code": "DORM4B",
        "description": "The best cooks in the dorm!",
        "created_at": "2025-01-15T10:00:00Z",
        "created_by": "user-1",
        "weekly_points": 2450,
        "total_points": 12500,
        "member_count": 8
    },
    "squad-cs-majors": {
        "id": "squad-cs-majors",
        "name": "CS Majors",
        "code": "CSCODE",
        "description": "Debugging recipes one bug at a time",
        "created_at": "2025-01-10T14:30:00Z",
        "created_by": "user-2",
        "weekly_points": 1890,
        "total_points": 9800,
        "member_count": 12
    },
    "squad-anime-club": {
        "id": "squad-anime-club",
        "name": "Anime Club",
        "code": "ANIME1",
        "description": "Cooking anime-inspired dishes!",
        "created_at": "2025-01-08T09:00:00Z",
        "created_by": "user-3",
        "weekly_points": 3200,
        "total_points": 15600,
        "member_count": 15
    },
    "squad-night-owls": {
        "id": "squad-night-owls",
        "name": "Night Owls",
        "code": "NITE99",
        "description": "Late night cooking crew",
        "created_at": "2025-01-20T23:00:00Z",
        "created_by": "user-4",
        "weekly_points": 1560,
        "total_points": 5400,
        "member_count": 6
    },
    "squad-budget-kings": {
        "id": "squad-budget-kings",
        "name": "Budget Kings",
        "code": "CHEAP1",
        "description": "Making $5 taste like $50",
        "created_at": "2025-01-12T16:00:00Z",
        "created_by": "user-5",
        "weekly_points": 2100,
        "total_points": 8900,
        "member_count": 10
    }
}

MOCK_SQUAD_MEMBERS = {
    "squad-dorm-4b": [
        {"user_id": "user-1", "username": "chef_mike", "display_name": "Mike Chen", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=mike", "role": "leader", "weekly_contribution": 450, "joined_at": "2025-01-15T10:00:00Z"},
        {"user_id": "user-6", "username": "pasta_queen", "display_name": "Sarah Kim", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah", "role": "member", "weekly_contribution": 380, "joined_at": "2025-01-15T12:00:00Z"},
        {"user_id": "user-7", "username": "grill_master", "display_name": "Jake Wilson", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=jake", "role": "member", "weekly_contribution": 320, "joined_at": "2025-01-16T09:00:00Z"},
        {"user_id": "user-8", "username": "spice_lord", "display_name": "Raj Patel", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=raj", "role": "member", "weekly_contribution": 290, "joined_at": "2025-01-16T14:00:00Z"},
        {"user_id": "user-9", "username": "sushi_sam", "display_name": "Sam Tanaka", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=sam", "role": "member", "weekly_contribution": 260, "joined_at": "2025-01-17T11:00:00Z"},
        {"user_id": "user-10", "username": "baker_betty", "display_name": "Betty Ross", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=betty", "role": "member", "weekly_contribution": 240, "joined_at": "2025-01-18T08:00:00Z"},
        {"user_id": "user-11", "username": "wok_wizard", "display_name": "David Liu", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=david", "role": "member", "weekly_contribution": 280, "joined_at": "2025-01-19T15:00:00Z"},
        {"user_id": "user-12", "username": "taco_tim", "display_name": "Tim Garcia", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=tim", "role": "member", "weekly_contribution": 230, "joined_at": "2025-01-20T10:00:00Z"},
    ],
    "squad-cs-majors": [
        {"user_id": "user-2", "username": "code_cook", "display_name": "Alex Dev", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=alex", "role": "leader", "weekly_contribution": 320, "joined_at": "2025-01-10T14:30:00Z"},
        {"user_id": "user-13", "username": "debug_chef", "display_name": "Chris Bug", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=chris", "role": "member", "weekly_contribution": 280, "joined_at": "2025-01-11T09:00:00Z"},
    ],
    "squad-anime-club": [
        {"user_id": "user-3", "username": "ramen_hero", "display_name": "Yuki Sato", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=yuki", "role": "leader", "weekly_contribution": 520, "joined_at": "2025-01-08T09:00:00Z"},
        {"user_id": "user-14", "username": "bento_master", "display_name": "Hana Mori", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=hana", "role": "member", "weekly_contribution": 480, "joined_at": "2025-01-09T11:00:00Z"},
    ],
    "squad-night-owls": [
        {"user_id": "user-4", "username": "midnight_chef", "display_name": "Luna Night", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=luna", "role": "leader", "weekly_contribution": 400, "joined_at": "2025-01-20T23:00:00Z"},
    ],
    "squad-budget-kings": [
        {"user_id": "user-5", "username": "penny_pincher", "display_name": "Max Saver", "profile_pic": "https://api.dicebear.com/7.x/avataaars/svg?seed=max", "role": "leader", "weekly_contribution": 350, "joined_at": "2025-01-12T16:00:00Z"},
    ]
}

# Track user squad memberships (user_id -> squad_id)
MOCK_USER_SQUADS = {
    "user-1": "squad-dorm-4b",
    "user-2": "squad-cs-majors",
    "user-3": "squad-anime-club",
    "user-4": "squad-night-owls",
    "user-5": "squad-budget-kings",
    "user-6": "squad-dorm-4b",
    "user-7": "squad-dorm-4b",
    "user-8": "squad-dorm-4b",
    "user-9": "squad-dorm-4b",
    "user-10": "squad-dorm-4b",
    "user-11": "squad-dorm-4b",
    "user-12": "squad-dorm-4b",
    "user-13": "squad-cs-majors",
    "user-14": "squad-anime-club",
}


def _generate_invite_code():
    """Generate a unique 6-character invite code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def _ensure_user_access(requested_user_id: str | None = None):
    """Return authenticated user_id and optionally enforce it matches requested_user_id."""
    user_id, error = get_user_id_from_jwt()
    if error:
        return None, error

    if requested_user_id and str(user_id) != str(requested_user_id):
        return None, (jsonify({"error": "Forbidden"}), 403)

    return user_id, None


# ============================================================================
# ROUTES
# ============================================================================

@squad_bp.route("/squads", methods=["GET"])
@jwt_required
def get_squads_leaderboard():
    """
    Get top squads leaderboard for this week.
    
    Returns:
        {
            "squads": [
                {
                    "id": str,
                    "name": str,
                    "description": str,
                    "weekly_points": int,
                    "total_points": int,
                    "member_count": int,
                    "rank": int
                }
            ]
        }
    """
    try:
        # Sort squads by weekly points
        sorted_squads = sorted(
            MOCK_SQUADS.values(),
            key=lambda s: s["weekly_points"],
            reverse=True
        )
        
        # Add rank
        leaderboard = []
        for idx, squad in enumerate(sorted_squads, 1):
            leaderboard.append({
                "id": squad["id"],
                "name": squad["name"],
                "description": squad.get("description", ""),
                "weekly_points": squad["weekly_points"],
                "total_points": squad["total_points"],
                "member_count": squad["member_count"],
                "rank": idx
            })
        
        return jsonify({"squads": leaderboard}), 200
        
    except Exception as e:
        logger.exception("Error fetching squads leaderboard")
        return jsonify({"error": "An internal error occurred"}), 500


@squad_bp.route("/squads/my", methods=["GET"])
@jwt_required
def get_my_squad():
    """
    Get the current user's squad info.
    
    Returns:
        {
            "squad": { ... } | null,
            "members": [ ... ]
        }
    """
    auth_user_id, error = _ensure_user_access()
    if error:
        return error
    
    user_id = str(auth_user_id)
    
    try:
        # Check if user is in a squad
        squad_id = MOCK_USER_SQUADS.get(user_id)
        
        if not squad_id:
            return jsonify({"squad": None, "members": []}), 200
        
        squad = MOCK_SQUADS.get(squad_id)
        if not squad:
            return jsonify({"squad": None, "members": []}), 200
        
        members = MOCK_SQUAD_MEMBERS.get(squad_id, [])
        
        # Sort members by weekly contribution
        sorted_members = sorted(members, key=lambda m: m["weekly_contribution"], reverse=True)
        
        return jsonify({
            "squad": {
                "id": squad["id"],
                "name": squad["name"],
                "code": squad["code"],
                "description": squad.get("description", ""),
                "weekly_points": squad["weekly_points"],
                "total_points": squad["total_points"],
                "member_count": squad["member_count"],
                "created_at": squad["created_at"]
            },
            "members": sorted_members
        }), 200
        
    except Exception as e:
        logger.exception("Error fetching user's squad")
        return jsonify({"error": "An internal error occurred"}), 500


@squad_bp.route("/squads/<squad_id>", methods=["GET"])
@jwt_required
def get_squad(squad_id):
    """
    Get a specific squad's details.
    
    Returns:
        {
            "squad": { ... },
            "members": [ ... ]
        }
    """
    try:
        squad = MOCK_SQUADS.get(squad_id)
        
        if not squad:
            return jsonify({"error": "Squad not found"}), 404
        
        members = MOCK_SQUAD_MEMBERS.get(squad_id, [])
        sorted_members = sorted(members, key=lambda m: m["weekly_contribution"], reverse=True)
        
        return jsonify({
            "squad": {
                "id": squad["id"],
                "name": squad["name"],
                "description": squad.get("description", ""),
                "weekly_points": squad["weekly_points"],
                "total_points": squad["total_points"],
                "member_count": squad["member_count"],
                "created_at": squad["created_at"]
            },
            "members": sorted_members
        }), 200
        
    except Exception as e:
        logger.exception("Error fetching squad")
        return jsonify({"error": "An internal error occurred"}), 500


@squad_bp.route("/squads", methods=["POST"])
@jwt_required
def create_squad():
    """
    Create a new squad.
    
    Request body:
        {
            "name": str,
            "description": str (optional)
        }
    
    Returns:
        {
            "squad": { ... },
            "invite_code": str
        }
    """
    auth_user_id, error = _ensure_user_access()
    if error:
        return error
    
    user_id = str(auth_user_id)
    
    try:
        # Check if user is already in a squad
        if user_id in MOCK_USER_SQUADS:
            return jsonify({"error": "You are already in a squad. Leave your current squad first."}), 400
        
        data = request.get_json() or {}
        name = data.get("name", "").strip()
        description = data.get("description", "").strip()
        
        if not name:
            return jsonify({"error": "Squad name is required"}), 400
        
        if len(name) > 30:
            return jsonify({"error": "Squad name must be 30 characters or less"}), 400
        
        # Generate unique ID and invite code
        squad_id = f"squad-{uuid.uuid4().hex[:8]}"
        invite_code = _generate_invite_code()
        
        # Create squad
        new_squad = {
            "id": squad_id,
            "name": name,
            "code": invite_code,
            "description": description,
            "created_at": datetime.utcnow().isoformat() + "Z",
            "created_by": user_id,
            "weekly_points": 0,
            "total_points": 0,
            "member_count": 1
        }
        
        MOCK_SQUADS[squad_id] = new_squad
        
        # Add creator as leader
        MOCK_SQUAD_MEMBERS[squad_id] = [{
            "user_id": user_id,
            "username": "you",  # Will be replaced with actual username from profile
            "display_name": "You",
            "profile_pic": "",
            "role": "leader",
            "weekly_contribution": 0,
            "joined_at": datetime.utcnow().isoformat() + "Z"
        }]
        
        MOCK_USER_SQUADS[user_id] = squad_id
        
        logger.info(f"[SQUAD_CREATE] user={user_id} squad={squad_id} name={name}")
        
        return jsonify({
            "squad": new_squad,
            "invite_code": invite_code
        }), 201
        
    except Exception as e:
        logger.exception("Error creating squad")
        return jsonify({"error": "An internal error occurred"}), 500


@squad_bp.route("/squads/join", methods=["POST"])
@jwt_required
def join_squad():
    """
    Join a squad using an invite code.
    
    Request body:
        {
            "code": str
        }
    
    Returns:
        {
            "squad": { ... },
            "message": str
        }
    """
    auth_user_id, error = _ensure_user_access()
    if error:
        return error
    
    user_id = str(auth_user_id)
    
    try:
        # Check if user is already in a squad
        if user_id in MOCK_USER_SQUADS:
            return jsonify({"error": "You are already in a squad. Leave your current squad first."}), 400
        
        data = request.get_json() or {}
        code = data.get("code", "").strip().upper()
        
        if not code:
            return jsonify({"error": "Invite code is required"}), 400
        
        # Find squad by code
        target_squad = None
        for squad in MOCK_SQUADS.values():
            if squad["code"] == code:
                target_squad = squad
                break
        
        if not target_squad:
            return jsonify({"error": "Invalid invite code"}), 404
        
        squad_id = target_squad["id"]
        
        # Add user to squad
        if squad_id not in MOCK_SQUAD_MEMBERS:
            MOCK_SQUAD_MEMBERS[squad_id] = []
        
        MOCK_SQUAD_MEMBERS[squad_id].append({
            "user_id": user_id,
            "username": "new_member",
            "display_name": "New Member",
            "profile_pic": "",
            "role": "member",
            "weekly_contribution": 0,
            "joined_at": datetime.utcnow().isoformat() + "Z"
        })
        
        MOCK_USER_SQUADS[user_id] = squad_id
        target_squad["member_count"] += 1
        
        logger.info(f"[SQUAD_JOIN] user={user_id} squad={squad_id}")
        
        return jsonify({
            "squad": target_squad,
            "message": f"Successfully joined {target_squad['name']}!"
        }), 200
        
    except Exception as e:
        logger.exception("Error joining squad")
        return jsonify({"error": "An internal error occurred"}), 500


@squad_bp.route("/squads/leave", methods=["POST"])
@jwt_required
def leave_squad():
    """
    Leave the current squad.
    
    Returns:
        {
            "message": str
        }
    """
    auth_user_id, error = _ensure_user_access()
    if error:
        return error
    
    user_id = str(auth_user_id)
    
    try:
        squad_id = MOCK_USER_SQUADS.get(user_id)
        
        if not squad_id:
            return jsonify({"error": "You are not in a squad"}), 400
        
        squad = MOCK_SQUADS.get(squad_id)
        
        # Remove user from squad members
        if squad_id in MOCK_SQUAD_MEMBERS:
            MOCK_SQUAD_MEMBERS[squad_id] = [
                m for m in MOCK_SQUAD_MEMBERS[squad_id] 
                if m["user_id"] != user_id
            ]
        
        # Update member count
        if squad:
            squad["member_count"] = max(0, squad["member_count"] - 1)
            
            # If no members left, delete squad
            if squad["member_count"] == 0:
                del MOCK_SQUADS[squad_id]
                if squad_id in MOCK_SQUAD_MEMBERS:
                    del MOCK_SQUAD_MEMBERS[squad_id]
        
        del MOCK_USER_SQUADS[user_id]
        
        logger.info(f"[SQUAD_LEAVE] user={user_id} squad={squad_id}")
        
        return jsonify({"message": "Successfully left the squad"}), 200
        
    except Exception as e:
        logger.exception("Error leaving squad")
        return jsonify({"error": "An internal error occurred"}), 500


@squad_bp.route("/squads/user/<user_id>/badge", methods=["GET"])
@jwt_required
def get_user_squad_badge(user_id):
    """
    Get a user's squad badge info (for displaying on profile cards).
    
    Returns:
        {
            "has_squad": bool,
            "squad_name": str | null,
            "squad_id": str | null
        }
    """
    try:
        squad_id = MOCK_USER_SQUADS.get(user_id)
        
        if not squad_id:
            return jsonify({
                "has_squad": False,
                "squad_name": None,
                "squad_id": None
            }), 200
        
        squad = MOCK_SQUADS.get(squad_id)
        
        return jsonify({
            "has_squad": True,
            "squad_name": squad["name"] if squad else None,
            "squad_id": squad_id
        }), 200
        
    except Exception as e:
        logger.exception("Error fetching user squad badge")
        return jsonify({"error": "An internal error occurred"}), 500
