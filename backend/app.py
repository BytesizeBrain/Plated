# from extensions import app, db
# from flask_cors import CORS
# from supabase import create_

##### Chau's part ######
from flask import Flask, request, jsonify
from supabase import create_client
import os 
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)

@app.route("/")
@app.route("/home")
def home():
    return "Flask and Supabase backend is running."

#Get all recipes
@app.route("/recipes", methods=["GET"])
def get_recipes():
    respones = supabase.table("recipes").select("*").execute()
    return jsonify(response.data)

#Create a new recipe
@app.route("/recipes", methods=["POST"])
def create_recipe():
    data = request.get_json()
    response = supabase.table("recipes").insert(data).execute()
    return jsonify(response.data)

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

