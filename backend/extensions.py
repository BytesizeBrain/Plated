from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables from .env file first
# This is the default file used in production/cloud deployments
load_dotenv()

# Override with env.development.local if it exists (for local development only)
# This file is git-ignored and won't exist in cloud deployments, so it's safe to check
# In cloud: this check will be False, so only .env will be used
# Locally: if this file exists, it will override .env values
dev_local_env = Path(__file__).parent / 'env.development.local'
if dev_local_env.exists():
    load_dotenv(dev_local_env, override=True)

# Initialize Flask app
app = Flask(__name__)

app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL', 'http://localhost:5173/')

# Set Flask's SECRET_KEY for session management (required for OAuth)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
if not app.config['SECRET_KEY']:
    raise ValueError("No SECRET_KEY set for Flask application. Did you forget to set it in the .env file?")

# Set JWT_SECRET (can be the same as SECRET_KEY or different)
app.config['JWT_SECRET'] = os.getenv('SECRET_KEY')  # Using same key for simplicity

google_client_id = os.getenv('CLIENT_ID')
google_client_secret = os.getenv('CLIENT_SECRET')
if not google_client_id or not google_client_secret:
    raise ValueError("No CLIENT_ID or CLIENT_SECRET set for Google OAuth. Did you forget to set it in the .env file?")
app.config['GOOGLE_CLIENT_ID'] = google_client_id
app.config['GOOGLE_CLIENT_SECRET'] = google_client_secret

# Configuring SQLAlchemy ORM to use database
database_url = os.getenv('DATABASE_URL', 'sqlite:///users.db')
app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize database
db = SQLAlchemy(app)