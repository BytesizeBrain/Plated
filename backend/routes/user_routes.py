import logging
import uuid
from flask import Blueprint, render_template, request, jsonify, redirect, url_for, g
from authlib.integrations.flask_client import OAuth
import jwt
import datetime
from functools import wraps
from extensions import app, db
from models.user_model import User, follow_requests, followers

# Configure logging to see debug messages
logging.basicConfig(level=logging.DEBUG)

oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=app.config['GOOGLE_CLIENT_ID'],
    client_secret=app.config['GOOGLE_CLIENT_SECRET'],
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# Declare this as a blueprint for user-related routes
users_bp = Blueprint('users', __name__)

def jwt_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization', None)
        if not auth_header:
            return jsonify({"error": "Authorization header is missing"}), 401 # TODO: Ensure frontend redirects to login page on 401 errors
        try:
            token = auth_header.split(" ")[1]
            payload = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
            if 'email' not in payload:
                return jsonify({"error": "Token missing email field"}), 401
            g.jwt = payload  # Attach jwt to request for use in the route

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            logging.error(f"Unexpected error during token validation: {e}")
            return jsonify({"error": "An error occurred during token validation"}), 500
        return f(*args, **kwargs)
    return decorated_function

@users_bp.route('/login')
def login():

    # Check if user is already logged in
    auth_header = request.headers.get('Authorization', None)
    if auth_header:
        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
            if payload['email']:
                logging.debug("User already logged in, redirecting to index")
                return redirect(url_for('main.index'))
        
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Invalid token"}), 401
        except Exception as e:
            logging.error(f"Unexpected error during token validation: {e}")
            return jsonify({"error": "An error occurred during token validation"}), 500

    # Otherwise, if not logged in, proceed with OAuth
    # Start OAuth flow by redirecting to Google's OAuth 2.0 server
    try:
        redirect_uri = url_for('users.authorize_google', _external=True)
        logging.debug(f"Redirect URI: {redirect_uri}")
        logging.debug("About to call google.authorize_redirect")
        return google.authorize_redirect(redirect_uri)
    except Exception as e:
        logging.error(f"Error during Google OAuth redirect: {e}")
        import traceback
        logging.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": "An error occurred during login. Please try again."}), 500

@users_bp.route('/authorize/google')
def authorize_google():
    try:
        # Get the token from Google
        token = google.authorize_access_token()
        if not token:
            logging.error("No token received from Google")
            return jsonify({"error": "Failed to receive token from Google."}), 400
    except Exception as e:
        logging.error(f"Error during Google OAuth token exchange: {e}")
        return jsonify({"error": "An error occurred during login. Please try again."}), 500

    try:
        # Get user information from google userinfo endpoint
        userinfo_endpoint = google.server_metadata['userinfo_endpoint']
        resp = google.get(userinfo_endpoint)
        user_info = resp.json()
    except Exception as e:
        logging.error(f"Error fetching user info from Google: {e}")
        return jsonify({"error": "An error occurred while fetching user information. Please try again."}), 500
    
    payload = {
        'email': user_info['email'],
        'exp': int((datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)).timestamp()),  # Token expires in 24 hours
        'display_name': user_info['name'],
    }

    # Check if user exists in DB, if not create new user
    user = User.query.filter_by(email=user_info['email']).first()
    if not user:
        logging.debug(f"New user: {user_info['email']}")

        # Add additional info to JWT payload
        payload['profile_pic'] = user_info.get('picture', "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")

    jwt_token = jwt.encode(payload, app.config['JWT_SECRET'], algorithm='HS256')
    
    return redirect(f"{app.config['FRONTEND_URL']}/register?token={jwt_token}") # Redirect users to the frontend ouath callback route with the JWT token

@users_bp.route('/api/user/register', methods=['POST'])
@jwt_required
def complete_profile():

    # Check if user already exists
    existing_user = User.query.filter_by(email=g.jwt['email']).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400
    
    # Validate input
    if 'display_name' not in request.json or not request.json['display_name']:
        return jsonify({"error": "Display name is required."}), 400  # UI should prevent this, this is just a fallback
    display_name = request.json['display_name']
    
    if 'username' not in request.json or not request.json['username']:
        return jsonify({"error": "Username is required."}), 400  # UI should prevent this, this is just a fallback
    username = request.json['username']

    profile_pic = request.json.get('profile_pic', "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg")

    # Check if username is already taken
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "Username already taken. Please choose another one."}), 400  # Ideally, the UI calls the GET /api/user/check_username with the username beforehand to avoid this, this is just a fallback
    
    # Generate UUID for new user
    new_id = str(uuid.uuid4())
    user = User.query.filter_by(id=new_id).first()
    while user:
        logging.warning("UUID collision detected, generating a new UUID.")
        new_id = str(uuid.uuid4())
        user = User.query.filter_by(id=new_id).first()

    new_user = User(id=new_id, email=g.jwt['email'], display_name=display_name, username=username, profile_pic=profile_pic)
    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        logging.error(f"Error creating new user: {e}")
        return jsonify({"error": "An error occurred while creating the user. Please try again."}), 500
    
    return jsonify({"message": "User registered successfully", "user_id": new_id}), 201

@users_bp.route('/api/user/profile', methods=['GET'])
@jwt_required
def get_profile():
    """Get the current user's profile information"""
    user = User.query.filter_by(email=g.jwt['email']).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "display_name": user.display_name,
        "profile_pic": user.profile_pic,
        "followers_count": user.followers.count(),
        "following_count": user.following.count(),
    }), 200

@users_bp.route('/api/user/update', methods=['PUT'])
@jwt_required
def update_user():
    
    user = User.query.filter_by(email=g.jwt['email']).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    updated = False

    if 'display_name' in request.json and request.json['display_name'] is not None:
        user.display_name = request.json['display_name']
        updated = True
    if 'profile_pic' in request.json and request.json['profile_pic'] is not None:
        user.profile_pic = request.json['profile_pic']
        updated = True

    # If there is a username in the request, ensure it is not taken by a user
    if 'username' in request.json and request.json['username'] is not None and not User.query.filter_by(username=request.json['username']).first():
        user.username = request.json['username']
        updated = True
    
    if updated:
        try:
            db.session.commit()
        except Exception as e:
            logging.error(f"Error updating user: {e}")
            return jsonify({"error": "An error occurred while updating the user. Please try again."}), 500
        return jsonify({"message": "User updated successfully"}), 200
    else:
        return jsonify({"message": "No valid fields to update"}), 400
    
@users_bp.route('/api/user/connections', methods=['GET'])
@jwt_required
def get_followers():
    """Get the current user's followers list"""
    user = User.query.filter_by(email=g.jwt['email']).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    followers = [{
        "username": follower.username,
        "display_name": follower.display_name,
        "profile_pic": follower.profile_pic
    } for follower in user.followers]

    following = [{
        "username": followed.username,
        "display_name": followed.display_name,
        "profile_pic": followed.profile_pic
    } for followed in user.following]

    return jsonify({
        "followers": followers,
        "following": following
    }), 200

# API to be used during registration and name changes to check if a username is already taken
@users_bp.route('/api/user/check_username', methods=['GET'])
def check_username():

    username = request.args.get('username', None)
    if not username:
        return jsonify({"error": "Username parameter is required"}), 400
    
    user = User.query.filter_by(username=username).first()
    if user:
        return jsonify({"exists": True}), 200
    else:
        return jsonify({"exists": False}), 200

# --- FOLLOW REQUESTS API ---
@users_bp.route('/api/user/follow-request', methods=['POST'])
@jwt_required
def send_follow_request():
    data = request.get_json()
    if not data or 'target_username' not in data:
        return jsonify({'error': 'target_username is required'}), 400
    target = User.query.filter_by(username=data['target_username']).first()
    if not target:
        return jsonify({'error': 'Target user not found'}), 404
    user = User.query.filter_by(email=g.jwt['email']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    # Prevent duplicate requests or self-request
    if user.id == target.id:
        return jsonify({'error': 'Cannot follow yourself'}), 400
    # Check if already following
    if target in user.following:
        return jsonify({'error': 'Already following this user'}), 400
    # Check if request already exists
    exists = db.session.execute(
        follow_requests.select().where(
            (follow_requests.c.requester_id == user.id) & (follow_requests.c.target_id == target.id)
        )
    ).first()
    if exists:
        return jsonify({'error': 'Follow request already sent'}), 400
    # Insert follow request
    db.session.execute(follow_requests.insert().values(requester_id=user.id, target_id=target.id))
    db.session.commit()
    return jsonify({'message': 'Follow request sent'}), 201


# Get received follow requests (pending)
@users_bp.route('/api/user/follow-requests/received', methods=['GET'])
@jwt_required
def get_received_follow_requests():
    user = User.query.filter_by(email=g.jwt['email']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    # Find all users who have sent a request to this user
    results = db.session.execute(
        follow_requests.select().where(follow_requests.c.target_id == user.id)
    ).fetchall()
    requester_ids = [row.requester_id for row in results]
    requesters = User.query.filter(User.id.in_(requester_ids)).all() if requester_ids else []
    return jsonify([
        {
            'username': u.username,
            'display_name': u.display_name,
            'profile_pic': u.profile_pic
        } for u in requesters
    ]), 200


# Get sent follow requests (pending)
@users_bp.route('/api/user/follow-requests/sent', methods=['GET'])
@jwt_required
def get_sent_follow_requests():
    user = User.query.filter_by(email=g.jwt['email']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    results = db.session.execute(
        follow_requests.select().where(follow_requests.c.requester_id == user.id)
    ).fetchall()
    target_ids = [row.target_id for row in results]
    targets = User.query.filter(User.id.in_(target_ids)).all() if target_ids else []
    return jsonify([
        {
            'username': u.username,
            'display_name': u.display_name,
            'profile_pic': u.profile_pic
        } for u in targets
    ]), 200


# Accept a follow request
@users_bp.route('/api/user/follow-request/accept', methods=['POST'])
@jwt_required
def accept_follow_request():
    data = request.get_json()
    if not data or 'requester_username' not in data:
        return jsonify({'error': 'requester_username is required'}), 400
    user = User.query.filter_by(email=g.jwt['email']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    requester = User.query.filter_by(username=data['requester_username']).first()
    if not requester:
        return jsonify({'error': 'Requester user not found'}), 404
    # Check if request exists
    exists = db.session.execute(
        follow_requests.select().where(
            (follow_requests.c.requester_id == requester.id) & (follow_requests.c.target_id == user.id)
        )
    ).first()
    if not exists:
        return jsonify({'error': 'No such follow request'}), 404
    # Add to followers
    db.session.execute(followers.insert().values(follower_id=requester.id, followed_id=user.id))
    # Remove request
    db.session.execute(
        follow_requests.delete().where(
            (follow_requests.c.requester_id == requester.id) & (follow_requests.c.target_id == user.id)
        )
    )
    db.session.commit()
    return jsonify({'message': 'Follow request accepted'}), 200


# Reject a follow request
@users_bp.route('/api/user/follow-request/reject', methods=['POST'])
@jwt_required
def reject_follow_request():
    data = request.get_json()
    if not data or 'requester_username' not in data:
        return jsonify({'error': 'requester_username is required'}), 400
    user = User.query.filter_by(email=g.jwt['email']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    requester = User.query.filter_by(username=data['requester_username']).first()
    if not requester:
        return jsonify({'error': 'Requester user not found'}), 404
    # Check if request exists
    exists = db.session.execute(
        follow_requests.select().where(
            (follow_requests.c.requester_id == requester.id) & (follow_requests.c.target_id == user.id)
        )
    ).first()
    if not exists:
        return jsonify({'error': 'No such follow request'}), 404
    # Remove request
    db.session.execute(
        follow_requests.delete().where(
            (follow_requests.c.requester_id == requester.id) & (follow_requests.c.target_id == user.id)
        )
    )
    db.session.commit()
    return jsonify({'message': 'Follow request rejected'}), 200


# Cancel a sent follow request (optional)
@users_bp.route('/api/user/follow-request/cancel', methods=['POST'])
@jwt_required
def cancel_follow_request():
    data = request.get_json()
    if not data or 'target_username' not in data:
        return jsonify({'error': 'target_username is required'}), 400
    user = User.query.filter_by(email=g.jwt['email']).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    target = User.query.filter_by(username=data['target_username']).first()
    if not target:
        return jsonify({'error': 'Target user not found'}), 404
    # Check if request exists
    exists = db.session.execute(
        follow_requests.select().where(
            (follow_requests.c.requester_id == user.id) & (follow_requests.c.target_id == target.id)
        )
    ).first()
    if not exists:
        return jsonify({'error': 'No such follow request'}), 404
    # Remove request
    db.session.execute(
        follow_requests.delete().where(
            (follow_requests.c.requester_id == user.id) & (follow_requests.c.target_id == target.id)
        )
    )
    db.session.commit()
    return jsonify({'message': 'Follow request cancelled'}), 200

def get_user_id_by_email(email):
    """Helper function to get a user's id by email. Returns None if not found."""
    user = User.query.filter_by(email=email).first()
    return user.id if user else None