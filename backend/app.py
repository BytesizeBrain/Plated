from extensions import app, db
from flask_cors import CORS


# Configure CORS to allow requests from both local and production frontend
CORS(app, origins=[
    "http://localhost:5173",
    "http://platedwithfriends.life:5173",
    "http://platedwithfriends.life"
], supports_credentials=True)

# Import blueprints after app and db are initialized
from routes.user_routes import users_bp

# Registering Blueprints (Routes)
app.register_blueprint(users_bp)

if __name__ == '__main__':
    # Create a db and tables if they don't exist
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0')