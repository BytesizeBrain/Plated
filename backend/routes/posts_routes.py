# backend/routes/posts_routes.py
from flask import Blueprint, request, jsonify, g
from supabase_client import supabase
from services.storage_service import StorageService
from routes.user_routes import jwt_required, get_user_id_from_jwt
import uuid

posts_bp = Blueprint("posts", __name__)

@posts_bp.route("/")
@posts_bp.route("/home")
def home():
    return jsonify({"message": "Flask and Supabase backend is running."})

@posts_bp.route("/posts", methods=["POST"])
def create_post_temp():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    image_url = data.get("image_url")
    caption = data.get("caption")

    if not user_id:
        return jsonify({"Error": "Missing user_id"}), 400

    try:
        response = (
            supabase.table("posts")
            .insert({
                "user_id": user_id,
                "image_url": image_url,
                "caption": caption,
            })
            .execute()
        )
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({"Error": str(e)}), 500

@posts_bp.route("/posts", methods=["GET"])
def list_posts():
    try:
        res = supabase.table("posts") \
            .select("*") \
            .order("created_at", desc=True) \
            .execute()
        
        return jsonify(res.data), 200

    except Exception as e:
        return jsonify({"Error": str(e)}), 500

@posts_bp.route("/feed", methods=["GET"])
@jwt_required
def get_feed():
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))

        # Get user_id from JWT token
        user_id, error = get_user_id_from_jwt()
        if error:
            return error

        start = (page - 1) * per_page
        end = start + per_page - 1

        # Get posts
        posts_res = (
            supabase.table("posts")
            .select("id, user_id, image_url, created_at, caption, post_type, recipe_data")
            .order("created_at", desc=True)
            .range(start, end)
            .execute()
        )

        posts = posts_res.data or []

        if not posts:
            return jsonify({
                "page": page,
                "per_page": per_page,
                "feed": []
            }), 200

        post_ids = [p['id'] for p in posts]
        user_ids = list({p.get("user_id") for p in posts if p.get("user_id")})

        # Get user info
        users_res = (
            supabase.table("user")
            .select("id, username, profile_pic")
            .in_("id", user_ids)
            .execute()
        )
        users_by_id = {u["id"]: u for u in (users_res.data or [])}

        # Get engagement counts - aggregate by post_id
        likes_res = supabase.table("likes")\
            .select("post_id")\
            .in_("post_id", post_ids)\
            .execute()

        likes_count = {}
        for like in (likes_res.data or []):
            post_id = like['post_id']
            likes_count[post_id] = likes_count.get(post_id, 0) + 1

        comments_res = supabase.table("comments")\
            .select("post_id")\
            .in_("post_id", post_ids)\
            .execute()

        comments_count = {}
        for comment in (comments_res.data or []):
            post_id = comment['post_id']
            comments_count[post_id] = comments_count.get(post_id, 0) + 1

        # Get user-specific engagement status
        user_likes = {}
        user_saves = {}
        if user_id:
            user_likes_res = supabase.table("likes")\
                .select("post_id")\
                .eq("user_id", user_id)\
                .in_("post_id", post_ids)\
                .execute()
            user_likes = {like['post_id']: True for like in (user_likes_res.data or [])}

            user_saves_res = supabase.table("saved_posts")\
                .select("post_id")\
                .eq("user_id", user_id)\
                .in_("post_id", post_ids)\
                .execute()
            user_saves = {save['post_id']: True for save in (user_saves_res.data or [])}

        # Build feed response
        feed = []
        for post in posts:
            user = users_by_id.get(post["user_id"])

            feed_item = {
                "id": post["id"],
                "image_url": post["image_url"],
                "caption": post["caption"],
                "post_type": post.get("post_type", "simple"),
                "recipe_data": post.get("recipe_data"),
                "created_at": post["created_at"],
                "user": {
                    "id": post["user_id"],
                    "username": user["username"] if user else "Unknown",
                    "profile_pic": user.get("profile_pic") if user else None,
                },
                "engagement": {
                    "likes_count": likes_count.get(post["id"], 0),
                    "comments_count": comments_count.get(post["id"], 0),
                    "is_liked": user_likes.get(post["id"], False),
                    "is_saved": user_saves.get(post["id"], False)
                }
            }
            feed.append(feed_item)

        return jsonify({
            "page": page,
            "per_page": per_page,
            "feed": feed,
        }), 200

    except Exception as e:
        return jsonify({"Error": str(e)}), 500


@posts_bp.route("/posts/user/<user_id>", methods=["GET"])
def get_user_posts(user_id):
    try:
        response = (
            supabase.table("posts")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"Error": str(e)}), 500


@posts_bp.route("/posts/<post_id>", methods=["GET"])
def get_post(post_id):
    try:
        res = (
            supabase.table("posts")
            .select("*")
            .eq("id", post_id)
            .execute()
        )
        if not res.data:
            return jsonify({"Error": "Post not found."}), 404
        return jsonify(res.data[0]), 200
    except Exception as e:
        return jsonify({"Error": str(e)}), 500


@posts_bp.route("/posts/<post_id>", methods=["DELETE"])
def delete_post(post_id):
    try:
        # TODO: later check if current user owns the post via JWT
        res = (
            supabase.table("posts")
            .delete()
            .eq("id", post_id)
            .execute()
        )

        # supabase-py normally returns deleted rows in `data`; use that
        if not res.data:
            return jsonify({"Error": "Post not found"}), 404

        return jsonify({"Message": "Delete post successfully."}), 200

    except Exception as e:
        return jsonify({"Error": str(e)}), 500


@posts_bp.route("/getRecipes", methods=["GET"])
def get_recipes():
    try:
        response = supabase.table("recipes").select("*").execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"Error": str(e)}), 500


@posts_bp.route("/post", methods=["POST"])
def create_recipe():
    try:
        data = request.get_json() or {}
        response = supabase.table("recipes").insert(data).execute()
        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({"Error": str(e)}), 500


@posts_bp.route("/posts/create", methods=["POST"])
@jwt_required
def create_post_with_data():
    """
    Create a post (simple or recipe) with JSON data
    Expects: post_type, image_url, caption, optional recipe_data
    Requires: JWT authentication (user_id extracted from token email)
    """
    data = request.get_json() or {}

    # Validate required fields
    post_type = data.get('post_type', 'simple')
    image_url = data.get('image_url', '').strip()
    caption = data.get('caption', '').strip()

    if post_type not in ['simple', 'recipe']:
        return jsonify({"error": "post_type must be 'simple' or 'recipe'"}), 400

    # Validate recipe-specific fields
    recipe_data = None
    if post_type == 'recipe':
        recipe_data = data.get('recipe_data')
        if not recipe_data:
            return jsonify({"error": "recipe_data required for recipe posts"}), 400

        # Validate required recipe fields
        required_fields = ['title', 'ingredients', 'instructions']
        for field in required_fields:
            if field not in recipe_data:
                return jsonify({"error": f"recipe_data.{field} is required"}), 400

        if not isinstance(recipe_data['ingredients'], list) or len(recipe_data['ingredients']) == 0:
            return jsonify({"error": "recipe_data.ingredients must be non-empty array"}), 400

        if not isinstance(recipe_data['instructions'], list) or len(recipe_data['instructions']) == 0:
            return jsonify({"error": "recipe_data.instructions must be non-empty array"}), 400

    # Get user_id from JWT token
    user_id, error = get_user_id_from_jwt()
    if error:
        return error

    try:
        # Insert post into Supabase
        post_data = {
            "user_id": user_id,
            "image_url": image_url if image_url else None,
            "caption": caption,
            "post_type": post_type,
        }

        if recipe_data:
            post_data["recipe_data"] = recipe_data

        response = supabase.table("posts").insert(post_data).execute()

        return jsonify(response.data[0]), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@posts_bp.route("/posts/upload-image", methods=["POST"])
def upload_post_image():
    """Upload image and return URL"""
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        file_data = file.read()

        # Check file size
        if len(file_data) > StorageService.MAX_FILE_SIZE:
            return jsonify({"error": "File too large (max 10MB)"}), 400

        image_url = StorageService.upload_post_image(file_data, file.filename)

        return jsonify({
            "message": "Image uploaded successfully",
            "image_url": image_url
        }), 200

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Upload failed"}), 500
