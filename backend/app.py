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
from routes.gamification_routes import gamification_bp
from routes.squad_routes import squad_bp
from routes.proof_routes import proof_bp
from routes.ingredient_prices_routes import ingredient_prices_bp

# Configure ProxyFix for Nginx (only in production)
if os.getenv('FLASK_ENV') == 'production':
    app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)

# CORS - Allow localhost on multiple ports for development
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://platedwithfriends.life:5173",
    "http://platedwithfriends.life"
], supports_credentials=True)

# Register blueprints
app.register_blueprint(users_bp)   # user routes like /login, /profile, etc.
app.register_blueprint(posts_bp, url_prefix='/api')   # Chau's routes: /api/posts, /api/feed, /api/create_post, etc.
app.register_blueprint(engagement_bp, url_prefix='/api')
app.register_blueprint(social_bp, url_prefix='/api')
app.register_blueprint(messages_bp, url_prefix='/api')
app.register_blueprint(gamification_bp, url_prefix='/api')
app.register_blueprint(squad_bp, url_prefix='/api')
app.register_blueprint(proof_bp, url_prefix='/api')
app.register_blueprint(ingredient_prices_bp, url_prefix='/api')  # Ingredient prices routes

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
            "ingredient_prices": "/api/ingredient-prices/ingredient",
            "estimate_cost": "/api/ingredient-prices/estimate"
        }
    }, 200

if __name__ == '__main__':
    with app.app_context():
        # Only create tables for local SQLite development
        # Supabase/PostgreSQL tables are managed separately
        database_url = os.getenv('DATABASE_URL', '')
        if not database_url.startswith('postgresql'):
            db.create_all()
    # In production, disable Flask debug mode. deploy.sh starts this module via
    # `python3 backend/app.py`, so we derive debug from environment flags.
    env_mode = os.getenv('ENV', '').lower()
    flask_env = os.getenv('FLASK_ENV', '').lower()
    is_production = env_mode == 'production' or flask_env == 'production'

    app.run(debug=not is_production, host='0.0.0.0')
