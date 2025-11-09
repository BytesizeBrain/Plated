# from extensions import app, db
from flask_cors import CORS
# from supabase import create_

##### Chau's part ######
from flask import Flask, request, jsonify
from supabase import create_client
import os 
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
# SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
# supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

app = Flask(__name__)

@app.route("/")
@app.route("/home")
def home():
    return "Flask and Supabase backend is running."

@app.route("/posts", methods=["POST"])
def create_post_temp():
    data = request.get_json()
    user_id = data.get("user_id")
    image_url = data.get("image_url")
    caption = data.get("caption")

    if not user_id:

        return jsonify({"Error": "Missing user_id"}), 400

    try:
        response = supabase.table("posts").insert({
            "user_id": user_id,
            "image_url": image_url,
            "caption": caption
        }).execute()

        return jsonify(response.data), 201
    except Exception as e:
        return jsonify({"Error": str(e)}), 500

# Get all posts --> will replace it with the /feed route
# @app.route("/getPosts", methods=["GET"])
# def get_all_posts():
#     try:
#         response = supabase.table("posts").select("*").order("created_at", desc=True).execute()
#         return jsonify(response.data), 200
#     except Exception as e:
        return jsonify({"Error": str(e)}), 500

@app.route("/feed", methods=["GET"])
def get_feed():
    try: 
        page = int(request.args.get("page", 1)) #if no page provide, assume 1
        per_page = int(request.args.get("per_page", 10)) #default: 10 posts per page
        
        start = (page - 1) * per_page
        end = (start + per_page) - 1

        #Get all posts with newest post coming first
        posts_res = (
            supabase.table("posts")
            .select("id, user_id", "image_url", "created_at", "caption")
            .order("created_at", desc=True)
            .range(start, end)
            .execute()
        )

        posts = posts_res.data or []

        # Get all UNIQUE user IDs in the posts
        user_ids = list({p.get("user_id") for p in posts if p.get("user_id")})
        
        if not user_ids:
            return jsonify({
                "Feed": []
            }), 200

        #Fetch user info for those IDs
        users_res = (
            supabase.table("user")
            .select("id, username, profile_pic")
            .in_("id", user_ids)
            .execute()
        )

        users_by_id = {u["id"]: u for u in users_res.data}

        # Combine post + user info
        feed = []
        for post in posts:
            user = users_by_id.get(post["user_id"])
            feed.append({
                "id": post["id"], 
                "image_url": post["image_url"], 
                "caption": post["caption"], 
                "created_at": post["created_at"], 
                "user": {
                    "id": post["user_id"],
                    "username": user["username"] if user else "Unknown",
                    "profile_pic": user["profile_pic"] if user else None, 
                }
            })

        #Return response
        return jsonify({
            "page": page, 
            "per_page": per_page, 
            "feed": feed
        }), 200
    
    except Exception as e:
        return jsonify({
            "Error": str(e)
        }), 500



# Get posts from one user. View a user's profile and their posts
@app.route("/posts/user/<user_id>", methods=["GET"])
def get_user_posts(user_id):
    try:
        response = supabase.table("posts").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({"Error": str(e)}), 500

# Let user view one specific post (retrieve one specific post)
@app.route("/posts/<post_id>", methods=["GET"])
def get_post(post_id):
    try:
        res = supabase.table("posts").select("*").eq("id", post_id).execute()
        if not res.data:
            return jsonify({
                "Error": "Post not found."
            }), 404
        
        return jsonify(res.data[0]), 200
    except Exception as e:
        return jsonify({
            "Error": str(e)
        }), 500

# Delete the post (if the requester is the creator)
@app.route("/posts/<post_id>", methods=["DELETE"])
def delete_post(post_id):
    try:
        # Will use this space to check if the user owns the post later

        #Delete one post (if that post exists)
        res = supabase.table("posts").delete().eq("id", post_id).execute()
        if res.count == 0:
            return jsonify({
                "Error": "Post not found"
            }), 404
        return jsonify({
            "Message": "Delete post successfully."
        }), 200
    
    except Exception as e:
        return jsonify({
            "Error": str(e)
        }), 500




#Get all recipes
@app.route("/getRecipes", methods=["GET"])
def get_recipes():
    response = supabase.table("recipes").select("*").execute()
    return jsonify(response.data)

#Create a new recipe
@app.route("/post", methods=["POST"])
def create_recipe():
    data = request.get_json()
    response = supabase.table("recipes").insert(data).execute()
    return jsonify(response.data)

@app.route("/create_post", methods=["POST"])
def create_post(): #old name: upload_image()
    if "image" not in request.files:
        return jsonify({"Error": "No image provided"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"Error": "No selected file"}), 400

    #Optional: get user_id from request JSON or headers

    # user_id = request.form.get("user_id") # could be from auth token
    # user_id = str(uuid.uuid4())
    user_id = request.form.get("user_id")
    caption = request.form.get("caption", "")

    try:
        # Make unique filename
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        storage_path = f"uploads/{unique_name}"    
        #Convert FileStorage into bytes
        file_data = file.read()

        #Upload file to supabase storage
        file_name = file.filename
        # storage_path = f"uploads/{file_name}"

        # Upload to "post-images" bucket
        res = supabase.storage.from_("post-images").upload(storage_path, file_data)
        
        # Get public URL
        public_URL = supabase.storage.from_("post-images").get_public_url(storage_path)

        # Insert into posts table
        supabase.table("posts").insert({
            "user_id": user_id,
            "image_url": public_URL,
            "caption": caption
        }).execute()

        # Now store the URL in your "posts" table
        # return jsonify({"image_url": public_URL}), 200
        return jsonify({
            "Message": "Post created successful",
            "Caption": caption,
            "File_name": file_name,
            "Image_url": public_URL
        }), 200

    except Exception as e:
        return jsonify({"Error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)

##### End of Chau's part #########


# Configure CORS to allow requests from both local and production frontend
# CORS(app, origins=[
#     "http://localhost:5173",
#     "http://platedwithfriends.life:5173",
#     "http://platedwithfriends.life"
# ], supports_credentials=True)

# # Import blueprints after app and db are initialized
# from routes.user_routes import users_bp

# # Registering Blueprints (Routes)
# app.register_blueprint(users_bp)

# if __name__ == '__main__':
#     # Create a db and tables if they don't exist
#     with app.app_context():
#         db.create_all()
#     app.run(debug=True, host='0.0.0.0')

