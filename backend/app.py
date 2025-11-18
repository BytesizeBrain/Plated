from extensions import app, db
from flask_cors import CORS
from flask import jsonify

from routes.user_routes import users_bp
from routes.posts_routes import posts_bp   

# CORS
CORS(app, origins=[
    "http://localhost:5173",
    "http://platedwithfriends.life:5173",
    "http://platedwithfriends.life"
], supports_credentials=True)

# Register blueprints
app.register_blueprint(users_bp)   # user routes like /login, /profile, etc.
app.register_blueprint(posts_bp)   # Chau's routes: /posts, /feed, /create_post, etc.

@app.route('/health')
def health():
    return jsonify({"status": "ok", "message": "Server is running"}), 200

@app.route('/')
def index():
    return {
        "status": "ok",
        "message": "Plated Backend API is running",
        "endpoints": {
            "health": "/health",
            "profile": "/profile",
            "posts": "/posts",
            "feed": "/feed",
        }
    }, 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # for SQLAlchemy user tables (local dev)
    app.run(debug=True, host='0.0.0.0')
