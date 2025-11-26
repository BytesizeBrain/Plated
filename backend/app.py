from extensions import app, db
from flask_cors import CORS
from flask import jsonify
import os

from werkzeug.middleware.proxy_fix import ProxyFix
from routes.user_routes import users_bp
from routes.posts_routes import posts_bp
from routes.engagement_routes import engagement_bp
from routes.social_routes import social_bp
from routes.messages_routes import messages_bp   

# Configure ProxyFix for Nginx (only in production)
if os.getenv('FLASK_ENV') == 'production':
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# CORS
CORS(app, origins=[
    "http://localhost:5173",
    "http://platedwithfriends.life:5173",
    "http://platedwithfriends.life"
], supports_credentials=True)

# Register blueprints
app.register_blueprint(users_bp)   # user routes like /login, /profile, etc.
app.register_blueprint(posts_bp, url_prefix='/api')   # Chau's routes: /api/posts, /api/feed, /api/create_post, etc.
app.register_blueprint(engagement_bp, url_prefix='/api')
app.register_blueprint(social_bp, url_prefix='/api')
app.register_blueprint(messages_bp, url_prefix='/api')

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
