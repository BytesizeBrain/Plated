# backend/routes/messages_routes.py
from flask import Blueprint, request, jsonify
from supabase_client import supabase
from datetime import datetime
import uuid

messages_bp = Blueprint("messages", __name__)

@messages_bp.route("/conversations", methods=["POST"])
def create_conversation():
    """Create or get existing conversation between users"""
    data = request.get_json() or {}
    user_id = data.get('user_id')  # Current user
    other_user_id = data.get('other_user_id')  # User to chat with

    if not user_id or not other_user_id:
        return jsonify({"error": "user_id and other_user_id required"}), 400

    try:
        # Check if conversation already exists between these users
        # Get all conversations for user_id
        user_convos = supabase.table("conversation_participants")\
            .select("conversation_id")\
            .eq("user_id", user_id)\
            .execute()

        convo_ids = [c['conversation_id'] for c in (user_convos.data or [])]

        if convo_ids:
            # Check if other_user is in any of these conversations
            other_user_convos = supabase.table("conversation_participants")\
                .select("conversation_id")\
                .eq("user_id", other_user_id)\
                .in_("conversation_id", convo_ids)\
                .execute()

            if other_user_convos.data:
                # Conversation exists
                existing_convo_id = other_user_convos.data[0]['conversation_id']
                return jsonify({"conversation_id": existing_convo_id, "created": False}), 200

        # Create new conversation
        convo_res = supabase.table("conversations").insert({}).execute()
        convo_id = convo_res.data[0]['id']

        # Add both users as participants
        supabase.table("conversation_participants").insert([
            {"conversation_id": convo_id, "user_id": user_id},
            {"conversation_id": convo_id, "user_id": other_user_id}
        ]).execute()

        return jsonify({"conversation_id": convo_id, "created": True}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@messages_bp.route("/conversations/<conversation_id>/messages", methods=["POST"])
def send_message(conversation_id):
    """Send a message in a conversation"""
    data = request.get_json() or {}
    sender_id = data.get('sender_id')  # TODO: Get from JWT
    content = data.get('content', '').strip()

    if not sender_id or not content:
        return jsonify({"error": "sender_id and content required"}), 400

    try:
        # Verify sender is participant
        participant_check = supabase.table("conversation_participants")\
            .select("user_id")\
            .eq("conversation_id", conversation_id)\
            .eq("user_id", sender_id)\
            .execute()

        if not participant_check.data:
            return jsonify({"error": "User not participant of conversation"}), 403

        # Insert message
        message_res = supabase.table("messages").insert({
            "conversation_id": conversation_id,
            "sender_id": sender_id,
            "content": content
        }).execute()

        # Update conversation updated_at
        supabase.table("conversations")\
            .update({"updated_at": datetime.utcnow().isoformat()})\
            .eq("id", conversation_id)\
            .execute()

        return jsonify(message_res.data[0]), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@messages_bp.route("/conversations/<conversation_id>/messages", methods=["GET"])
def get_messages(conversation_id):
    """Get all messages in a conversation"""
    user_id = request.args.get('user_id')  # TODO: Get from JWT
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))

    start = (page - 1) * per_page
    end = start + per_page - 1

    try:
        # Verify user is participant
        if user_id:
            participant_check = supabase.table("conversation_participants")\
                .select("user_id")\
                .eq("conversation_id", conversation_id)\
                .eq("user_id", user_id)\
                .execute()

            if not participant_check.data:
                return jsonify({"error": "Unauthorized"}), 403

        # Get messages
        messages_res = supabase.table("messages")\
            .select("*")\
            .eq("conversation_id", conversation_id)\
            .order("created_at", desc=False)\
            .range(start, end)\
            .execute()

        return jsonify({
            "messages": messages_res.data or [],
            "page": page,
            "per_page": per_page
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@messages_bp.route("/conversations", methods=["GET"])
def get_user_conversations():
    """Get all conversations for current user"""
    user_id = request.args.get('user_id')  # TODO: Get from JWT

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    try:
        # Get conversation IDs for user
        participant_res = supabase.table("conversation_participants")\
            .select("conversation_id")\
            .eq("user_id", user_id)\
            .execute()

        convo_ids = [p['conversation_id'] for p in (participant_res.data or [])]

        if not convo_ids:
            return jsonify({"conversations": []}), 200

        # Get conversation details
        convos_res = supabase.table("conversations")\
            .select("*")\
            .in_("id", convo_ids)\
            .order("updated_at", desc=True)\
            .execute()

        conversations = []
        for convo in (convos_res.data or []):
            convo_id = convo['id']

            # Get other participants
            participants_res = supabase.table("conversation_participants")\
                .select("user_id")\
                .eq("conversation_id", convo_id)\
                .neq("user_id", user_id)\
                .execute()

            other_user_ids = [p['user_id'] for p in (participants_res.data or [])]

            # Get last message
            last_msg_res = supabase.table("messages")\
                .select("*")\
                .eq("conversation_id", convo_id)\
                .order("created_at", desc=True)\
                .limit(1)\
                .execute()

            last_message = last_msg_res.data[0] if last_msg_res.data else None

            # Get unread count
            last_read_res = supabase.table("conversation_participants")\
                .select("last_read_at")\
                .eq("conversation_id", convo_id)\
                .eq("user_id", user_id)\
                .execute()

            last_read_at = last_read_res.data[0]['last_read_at'] if last_read_res.data else None

            unread_count = 0
            if last_read_at and last_message:
                unread_res = supabase.table("messages")\
                    .select("id", count="exact")\
                    .eq("conversation_id", convo_id)\
                    .neq("sender_id", user_id)\
                    .gt("created_at", last_read_at)\
                    .execute()
                unread_count = unread_res.count or 0

            conversations.append({
                "id": convo_id,
                "other_user_ids": other_user_ids,
                "last_message": last_message,
                "unread_count": unread_count,
                "updated_at": convo['updated_at']
            })

        return jsonify({"conversations": conversations}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@messages_bp.route("/conversations/<conversation_id>/read", methods=["POST"])
def mark_conversation_read(conversation_id):
    """Mark conversation as read for current user"""
    data = request.get_json() or {}
    user_id = data.get('user_id')  # TODO: Get from JWT

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    try:
        supabase.table("conversation_participants")\
            .update({"last_read_at": datetime.utcnow().isoformat()})\
            .eq("conversation_id", conversation_id)\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({"message": "Marked as read"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
