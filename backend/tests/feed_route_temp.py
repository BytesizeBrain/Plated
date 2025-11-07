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
            supabase.table("users")
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
                    "username": user["username"] if user else "Unknown"
                    "profile-pic": user["profile_pic"] if user else None, 
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
