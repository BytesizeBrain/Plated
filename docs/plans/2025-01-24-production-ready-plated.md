# Production-Ready Plated Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Plated into a production-ready social recipe platform with post creation, engagement system, follow/unfollow, messaging, and skeletal gamification.

**Architecture:** Supabase-first database architecture with Flask backend API and React TypeScript frontend. Support both simple posts (image + caption) and recipe posts (ingredients, steps, cooking details). Maintain existing Google OAuth.

**Tech Stack:** Supabase (PostgreSQL), Flask, React + TypeScript, Vite

---

## 🎯 IMPLEMENTATION STATUS

**Last Updated:** 2025-01-26
**Progress:** 13/18 tasks complete (72%)
**Current Batch:** BATCH 3 - Backend Engagement System ✅ COMPLETE

### ✅ Completed Batches:
- **BATCH 1:** Database Schema Setup (5/5 tasks) ✅
  - All tables created and deployed to Supabase
  - Schema differences documented below

- **BATCH 2:** Backend Post Creation (3/3 tasks) ✅
  - ✅ Task 2.1: Tests written
  - ✅ Task 2.2: Endpoint implemented
  - ✅ Task 2.3: Image upload service complete

- **BATCH 3:** Backend Engagement System (5/5 tasks) ✅
  - ✅ Task 3.1: Likes endpoint tests (TDD)
  - ✅ Task 3.2: Likes endpoints implemented
  - ✅ Task 3.3: Comments endpoints implemented (with text→content mapping)
  - ✅ Task 3.4: Save/Bookmark endpoints complete
  - ✅ Task 3.5: Feed enhanced with engagement data

### ⚠️ CRITICAL SCHEMA DIFFERENCES - READ BEFORE CONTINUING

**The actual Supabase database has these differences from the plan:**

1. **followers table:**
   - Plan says: `followed_id`
   - **Actual DB uses:** `following_id` ⚠️
   - **Action:** Use `following_id` in all backend queries

2. **comments table:**
   - Plan says: `content`
   - **Actual DB uses:** `text` ⚠️
   - **Action:** Use `text` column name in comments endpoints

3. **posts table:**
   - `image_url` is NULLABLE (not required)
   - `user_id` uses default `gen_random_uuid()` in Supabase

4. **user_gamification table:**
   - Missing `updated_at` column in Supabase
   - Only has `created_at`

5. **Additional tables exist in Supabase:**
   - `user` table (id, email, username, display_name, profile_pic, password, bio, location)
   - `recipes` table (legacy, has bigint id + uuid_id)
   - `tags` and `recipe_tags` tables

### 📁 Repository Status:
- All SQL successfully executed in Supabase ✅
- Backend tests created ✅
- Post creation endpoint implemented ✅
- Documentation cleaned up (19 temp files removed) ✅
- **17 commits ready to push to GitHub** ⚠️

### 🔗 Commit Hashes (Local):
```
65f9f5d - feat: enhance feed endpoint with engagement data
deb3d89 - feat: implement save/bookmark endpoints
e7e5f01 - docs: update plan with BATCH 3 progress (3/5 tasks)
8ae0668 - feat: implement comments endpoints
e0d7aa4 - feat: implement likes endpoints
b17ca94 - test: add likes endpoint tests (failing)
58d0e60 - feat: add image upload service for post creation
6b2a28d - chore: clean up temporary documentation files
d31da53 - feat: implement database schema and post creation system
65d757f - feat: implement post creation endpoint
efc62bf - test: add post creation endpoint tests
c4f6f6a - fix: Add posts table definition
761b56e - docs: add gamification skeleton tables
e44df9f - docs: add messaging system tables
f560b88 - docs: add followers and follow_requests tables
921ba84 - docs: add recipe data structure
716a2f3 - docs: add engagement tables schema
```

**⚠️ IMPORTANT:** Run `git push origin main` before next session!

---

## BATCH 1: Database Schema Setup (Supabase) ✅ COMPLETE

### Task 1.1: Create Core Engagement Tables ✅ COMPLETE

**Context:** The app needs likes, comments, saves, and views tracking for posts. These tables will be created directly in Supabase.

**Files:**
- Create: `docs/database/supabase_schema.sql`

**Step 1: Write SQL schema for engagement tables**

Create the SQL file with complete schema:

```sql
-- ============================================
-- ENGAGEMENT TABLES
-- ============================================

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- Saved posts table
CREATE TABLE IF NOT EXISTS saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_saved_posts_post_id ON saved_posts(post_id);

-- Post views table
CREATE TABLE IF NOT EXISTS post_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_views_post_id ON post_views(post_id);
CREATE INDEX idx_post_views_user_id ON post_views(user_id);
```

**Step 2: Execute SQL in Supabase dashboard**

Action:
1. Open Supabase dashboard at https://app.supabase.com
2. Navigate to SQL Editor
3. Paste the engagement tables SQL
4. Click "Run"
5. Verify tables created in Table Editor

Expected: 4 new tables (likes, comments, saved_posts, post_views) appear in Supabase

**Step 3: Commit schema documentation**

```bash
git add docs/database/supabase_schema.sql
git commit -m "docs: add engagement tables schema for Supabase"
```

---

### Task 1.2: Create Recipe Data Structure ✅ COMPLETE

**Context:** Posts can be either simple (image + caption) or recipe posts (with ingredients, instructions, etc.). We'll use JSONB column in posts table for flexible recipe data.

**Files:**
- Modify: `docs/database/supabase_schema.sql`

**Step 1: Add recipe columns to posts table SQL**

Append to the schema file:

```sql
-- ============================================
-- RECIPE DATA ENHANCEMENT
-- ============================================

-- Add recipe-specific columns to posts table
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS post_type VARCHAR(20) DEFAULT 'simple' CHECK (post_type IN ('simple', 'recipe'));

ALTER TABLE posts
ADD COLUMN IF NOT EXISTS recipe_data JSONB;

-- Recipe data structure (when post_type = 'recipe'):
-- {
--   "title": "Chicken Alfredo",
--   "prep_time": 15,
--   "cook_time": 30,
--   "servings": 4,
--   "difficulty": "medium",
--   "cuisine": "Italian",
--   "ingredients": [
--     { "item": "chicken breast", "amount": "2", "unit": "lbs" },
--     { "item": "fettuccine", "amount": "1", "unit": "lb" }
--   ],
--   "instructions": [
--     "Season chicken with salt and pepper",
--     "Cook pasta according to package directions",
--     "Make alfredo sauce"
--   ],
--   "tags": ["dinner", "italian", "comfort-food"]
-- }

CREATE INDEX idx_posts_post_type ON posts(post_type);
```

**Step 2: Execute ALTER TABLE in Supabase**

Action:
1. Open Supabase SQL Editor
2. Paste the ALTER TABLE statements
3. Run the query
4. Verify new columns in posts table

Expected: posts table now has post_type (VARCHAR) and recipe_data (JSONB) columns

**Step 3: Commit schema update**

```bash
git add docs/database/supabase_schema.sql
git commit -m "docs: add recipe data structure to posts table"
```

---

### Task 1.3: Create Social Features Tables ✅ COMPLETE

**Context:** Users need to follow/unfollow each other. This requires a followers table and follow_requests table for future private accounts feature.

**Files:**
- Modify: `docs/database/supabase_schema.sql`

**Step 1: Add social tables SQL**

Append to schema file:

```sql
-- ============================================
-- SOCIAL FEATURES TABLES
-- ============================================

-- Followers table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS followers (
  follower_id UUID NOT NULL,
  followed_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_id),
  CHECK (follower_id != followed_id)
);

CREATE INDEX idx_followers_follower_id ON followers(follower_id);
CREATE INDEX idx_followers_followed_id ON followers(followed_id);

-- Follow requests table (for future private accounts)
CREATE TABLE IF NOT EXISTS follow_requests (
  requester_id UUID NOT NULL,
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (requester_id, target_id),
  CHECK (requester_id != target_id)
);

CREATE INDEX idx_follow_requests_target_id ON follow_requests(target_id);
```

**Step 2: Execute in Supabase**

Action:
1. Supabase SQL Editor
2. Paste social tables SQL
3. Run
4. Verify tables created

Expected: followers and follow_requests tables created

**Step 3: Commit**

```bash
git add docs/database/supabase_schema.sql
git commit -m "docs: add followers and follow_requests tables"
```

---

### Task 1.4: Create Messaging System Tables ✅ COMPLETE

**Context:** Direct messaging requires conversations and messages tables.

**Files:**
- Modify: `docs/database/supabase_schema.sql`

**Step 1: Add messaging tables SQL**

```sql
-- ============================================
-- MESSAGING SYSTEM TABLES
-- ============================================

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation participants (many-to-many)
CREATE TABLE IF NOT EXISTS conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**Step 2: Execute in Supabase**

Action: Run messaging SQL in Supabase SQL Editor

Expected: 3 new tables (conversations, conversation_participants, messages)

**Step 3: Commit**

```bash
git add docs/database/supabase_schema.sql
git commit -m "docs: add messaging system tables"
```

---

### Task 1.5: Create Gamification Skeleton Tables ✅ COMPLETE

**Context:** Gamification system needs tables for XP, badges, coins, and streaks. This is skeletal - backend will support basic operations but no complex logic yet.

**Files:**
- Modify: `docs/database/supabase_schema.sql`

**Step 1: Add gamification tables SQL**

```sql
-- ============================================
-- GAMIFICATION TABLES (SKELETAL)
-- ============================================

-- User gamification stats
CREATE TABLE IF NOT EXISTS user_gamification (
  user_id UUID PRIMARY KEY,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  coins INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  criteria TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User badges (many-to-many)
CREATE TABLE IF NOT EXISTS user_badges (
  user_id UUID NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);

-- Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20),
  xp_reward INTEGER DEFAULT 0,
  coin_reward INTEGER DEFAULT 0,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User challenge progress
CREATE TABLE IF NOT EXISTS user_challenges (
  user_id UUID NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, challenge_id)
);

CREATE INDEX idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX idx_user_challenges_status ON user_challenges(status);
```

**Step 2: Execute in Supabase**

Action: Run gamification SQL in Supabase SQL Editor

Expected: 5 new tables for gamification system

**Step 3: Insert sample badges**

```sql
-- Sample badges for testing
INSERT INTO badges (name, description, icon_url, criteria) VALUES
('First Post', 'Created your first post', NULL, 'Create 1 post'),
('Recipe Master', 'Posted 10 recipes', NULL, 'Create 10 recipe posts'),
('Social Butterfly', 'Followed 25 users', NULL, 'Follow 25 users'),
('Engagement King', 'Received 100 likes', NULL, 'Get 100 likes on posts'),
('Week Warrior', 'Maintained a 7-day streak', NULL, '7-day activity streak');
```

**Step 4: Commit**

```bash
git add docs/database/supabase_schema.sql
git commit -m "docs: add gamification skeleton tables and sample badges"
```

---

## BATCH 2: Backend - Post Creation System ✅ COMPLETE (3/3 tasks)

### Task 2.1: Create Post Creation Endpoint Tests ✅ COMPLETE

**Context:** TDD approach - write tests first for creating simple and recipe posts.

**Files:**
- Create: `backend/tests/test_post_creation.py`

**Step 1: Write failing tests**

```python
import pytest
import json
from app import app
from supabase_client import supabase

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def auth_headers():
    # Mock JWT token for testing
    return {'Authorization': 'Bearer mock_token_user_123'}

def test_create_simple_post_success(client, auth_headers):
    """Test creating a simple post with image and caption"""
    payload = {
        'post_type': 'simple',
        'caption': 'Delicious homemade pasta!',
        'image_url': 'https://example.com/pasta.jpg'
    }

    response = client.post('/api/posts/create',
                          data=json.dumps(payload),
                          headers={**auth_headers, 'Content-Type': 'application/json'})

    assert response.status_code == 201
    data = response.get_json()
    assert data['post_type'] == 'simple'
    assert data['caption'] == 'Delicious homemade pasta!'
    assert 'id' in data

def test_create_recipe_post_success(client, auth_headers):
    """Test creating a recipe post with full details"""
    payload = {
        'post_type': 'recipe',
        'caption': 'My famous chicken alfredo',
        'image_url': 'https://example.com/alfredo.jpg',
        'recipe_data': {
            'title': 'Chicken Alfredo',
            'prep_time': 15,
            'cook_time': 30,
            'servings': 4,
            'difficulty': 'medium',
            'cuisine': 'Italian',
            'ingredients': [
                {'item': 'chicken breast', 'amount': '2', 'unit': 'lbs'},
                {'item': 'fettuccine', 'amount': '1', 'unit': 'lb'}
            ],
            'instructions': [
                'Season chicken with salt and pepper',
                'Cook pasta according to package directions'
            ],
            'tags': ['dinner', 'italian']
        }
    }

    response = client.post('/api/posts/create',
                          data=json.dumps(payload),
                          headers={**auth_headers, 'Content-Type': 'application/json'})

    assert response.status_code == 201
    data = response.get_json()
    assert data['post_type'] == 'recipe'
    assert data['recipe_data']['title'] == 'Chicken Alfredo'
    assert len(data['recipe_data']['ingredients']) == 2

def test_create_post_missing_image(client, auth_headers):
    """Test validation when image_url is missing"""
    payload = {
        'post_type': 'simple',
        'caption': 'No image!'
    }

    response = client.post('/api/posts/create',
                          data=json.dumps(payload),
                          headers={**auth_headers, 'Content-Type': 'application/json'})

    assert response.status_code == 400
    data = response.get_json()
    assert 'error' in data

def test_create_recipe_post_missing_required_fields(client, auth_headers):
    """Test validation for recipe posts"""
    payload = {
        'post_type': 'recipe',
        'image_url': 'https://example.com/food.jpg',
        'recipe_data': {
            'title': 'Incomplete Recipe'
            # missing ingredients and instructions
        }
    }

    response = client.post('/api/posts/create',
                          data=json.dumps(payload),
                          headers={**auth_headers, 'Content-Type': 'application/json'})

    assert response.status_code == 400
```

**Step 2: Run tests to verify they fail**

```bash
cd backend
pytest tests/test_post_creation.py -v
```

Expected: All tests FAIL with "404 Not Found" or import errors

**Step 3: Commit failing tests**

```bash
git add backend/tests/test_post_creation.py
git commit -m "test: add post creation endpoint tests (failing)"
```

---

### Task 2.2: Implement Post Creation Endpoint ✅ COMPLETE

**Context:** Implement the /api/posts/create endpoint to make tests pass.

**Files:**
- Modify: `backend/routes/posts_routes.py:222-end`

**Step 1: Add post creation logic**

Add this to posts_routes.py after the existing create_post_upload function:

```python
@posts_bp.route("/posts/create", methods=["POST"])
def create_post_with_data():
    """
    Create a post (simple or recipe) with JSON data
    Expects: post_type, image_url, caption, optional recipe_data
    """
    from flask import request, jsonify, g
    import uuid

    data = request.get_json() or {}

    # Validate required fields
    post_type = data.get('post_type', 'simple')
    image_url = data.get('image_url', '').strip()
    caption = data.get('caption', '').strip()

    if not image_url:
        return jsonify({"error": "image_url is required"}), 400

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

    # TODO: Get user_id from JWT token (for now using mock)
    # In production: user_id = g.jwt['sub'] or similar
    user_id = data.get('user_id', str(uuid.uuid4()))

    try:
        # Insert post into Supabase
        post_data = {
            "user_id": user_id,
            "image_url": image_url,
            "caption": caption,
            "post_type": post_type,
        }

        if recipe_data:
            post_data["recipe_data"] = recipe_data

        response = supabase.table("posts").insert(post_data).execute()

        return jsonify(response.data[0]), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

**Step 2: Run tests to verify they pass**

```bash
pytest tests/test_post_creation.py -v
```

Expected: All tests PASS

**Step 3: Commit implementation**

```bash
git add backend/routes/posts_routes.py
git commit -m "feat: implement post creation endpoint for simple and recipe posts"
```

---

### Task 2.3: Add Image Upload Service ✅ COMPLETE

**Context:** Posts need image upload to Supabase Storage. Create helper function.

**Files:**
- Create: `backend/services/storage_service.py`

**Step 1: Write storage service**

```python
# backend/services/storage_service.py
from supabase_client import supabase
import uuid
from werkzeug.utils import secure_filename
import os

class StorageService:
    """Service for handling file uploads to Supabase Storage"""

    BUCKET_NAME = "post-images"
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

    @staticmethod
    def allowed_file(filename: str) -> bool:
        """Check if file extension is allowed"""
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in StorageService.ALLOWED_EXTENSIONS

    @staticmethod
    def upload_post_image(file_data: bytes, filename: str) -> str:
        """
        Upload image to Supabase Storage
        Returns: public URL of uploaded image
        Raises: ValueError if upload fails
        """
        if not StorageService.allowed_file(filename):
            raise ValueError(f"File type not allowed. Allowed: {StorageService.ALLOWED_EXTENSIONS}")

        # Generate unique filename
        ext = filename.rsplit('.', 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{ext}"
        storage_path = f"posts/{unique_filename}"

        try:
            # Upload to Supabase Storage
            supabase.storage.from_(StorageService.BUCKET_NAME).upload(
                storage_path,
                file_data,
                file_options={"content-type": f"image/{ext}"}
            )

            # Get public URL
            public_url = supabase.storage.from_(StorageService.BUCKET_NAME).get_public_url(storage_path)

            return public_url

        except Exception as e:
            raise ValueError(f"Failed to upload image: {str(e)}")

    @staticmethod
    def delete_post_image(image_url: str) -> bool:
        """
        Delete image from Supabase Storage
        Returns: True if deleted, False otherwise
        """
        try:
            # Extract path from URL
            # URL format: https://{project}.supabase.co/storage/v1/object/public/post-images/posts/{filename}
            if StorageService.BUCKET_NAME not in image_url:
                return False

            path = image_url.split(f"{StorageService.BUCKET_NAME}/")[1]
            supabase.storage.from_(StorageService.BUCKET_NAME).remove([path])
            return True

        except Exception:
            return False
```

**Step 2: Add file upload endpoint**

Modify `backend/routes/posts_routes.py`:

```python
from services.storage_service import StorageService

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
```

**Step 3: Create services directory and test**

```bash
mkdir -p backend/services
touch backend/services/__init__.py
```

**Step 4: Manual test upload endpoint**

```bash
# Test with curl (replace with actual image path)
curl -X POST http://localhost:5000/api/posts/upload-image \
  -F "image=@/path/to/test-image.jpg"
```

Expected: Returns JSON with image_url

**Step 5: Commit**

```bash
git add backend/services/storage_service.py backend/routes/posts_routes.py backend/services/__init__.py
git commit -m "feat: add image upload service for post creation"
```

---

## BATCH 3: Backend - Engagement System

### Task 3.1: Create Likes Endpoint Tests

**Files:**
- Create: `backend/tests/test_engagement.py`

**Step 1: Write failing tests for likes**

```python
import pytest
import json
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def auth_headers():
    return {'Authorization': 'Bearer mock_token'}

def test_like_post_success(client, auth_headers):
    """Test liking a post"""
    payload = {'post_id': 'test-post-uuid'}

    response = client.post('/api/posts/like',
                          data=json.dumps(payload),
                          headers={**auth_headers, 'Content-Type': 'application/json'})

    assert response.status_code == 201
    data = response.get_json()
    assert data['liked'] == True

def test_unlike_post_success(client, auth_headers):
    """Test unliking a post"""
    payload = {'post_id': 'test-post-uuid'}

    response = client.delete('/api/posts/like',
                            data=json.dumps(payload),
                            headers={**auth_headers, 'Content-Type': 'application/json'})

    assert response.status_code == 200
    data = response.get_json()
    assert data['liked'] == False

def test_get_post_likes_count(client):
    """Test getting likes count for a post"""
    response = client.get('/api/posts/test-post-uuid/likes')

    assert response.status_code == 200
    data = response.get_json()
    assert 'count' in data
    assert isinstance(data['count'], int)

def test_check_user_liked_post(client, auth_headers):
    """Test checking if user liked a post"""
    response = client.get('/api/posts/test-post-uuid/liked',
                         headers=auth_headers)

    assert response.status_code == 200
    data = response.get_json()
    assert 'liked' in data
    assert isinstance(data['liked'], bool)
```

**Step 2: Run tests (should fail)**

```bash
pytest tests/test_engagement.py::test_like_post_success -v
```

Expected: FAIL - 404 Not Found

**Step 3: Commit**

```bash
git add backend/tests/test_engagement.py
git commit -m "test: add likes endpoint tests (failing)"
```

---

### Task 3.2: Implement Likes Endpoints

**Files:**
- Create: `backend/routes/engagement_routes.py`

**Step 1: Create engagement routes blueprint**

```python
# backend/routes/engagement_routes.py
from flask import Blueprint, request, jsonify, g
from supabase_client import supabase
import uuid

engagement_bp = Blueprint("engagement", __name__)

@engagement_bp.route("/posts/like", methods=["POST"])
def like_post():
    """Like a post"""
    data = request.get_json() or {}
    post_id = data.get('post_id')

    if not post_id:
        return jsonify({"error": "post_id required"}), 400

    # TODO: Get user_id from JWT
    user_id = data.get('user_id', str(uuid.uuid4()))

    try:
        # Check if post exists
        post_check = supabase.table("posts").select("id").eq("id", post_id).execute()
        if not post_check.data:
            return jsonify({"error": "Post not found"}), 404

        # Insert like (UNIQUE constraint prevents duplicates)
        supabase.table("likes").insert({
            "post_id": post_id,
            "user_id": user_id
        }).execute()

        return jsonify({"liked": True, "message": "Post liked"}), 201

    except Exception as e:
        # If duplicate, it's already liked
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            return jsonify({"liked": True, "message": "Already liked"}), 200
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/like", methods=["DELETE"])
def unlike_post():
    """Unlike a post"""
    data = request.get_json() or {}
    post_id = data.get('post_id')

    if not post_id:
        return jsonify({"error": "post_id required"}), 400

    user_id = data.get('user_id', str(uuid.uuid4()))

    try:
        result = supabase.table("likes")\
            .delete()\
            .eq("post_id", post_id)\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({"liked": False, "message": "Post unliked"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/<post_id>/likes", methods=["GET"])
def get_post_likes_count(post_id):
    """Get total likes for a post"""
    try:
        result = supabase.table("likes")\
            .select("id", count="exact")\
            .eq("post_id", post_id)\
            .execute()

        return jsonify({"count": result.count or 0}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/<post_id>/liked", methods=["GET"])
def check_user_liked_post(post_id):
    """Check if current user liked a post"""
    # TODO: Get user_id from JWT
    user_id = request.args.get('user_id', 'mock-user')

    try:
        result = supabase.table("likes")\
            .select("id")\
            .eq("post_id", post_id)\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({"liked": len(result.data) > 0}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

**Step 2: Register blueprint in app.py**

Modify `backend/app.py`:

```python
from routes.engagement_routes import engagement_bp

# After existing blueprints
app.register_blueprint(engagement_bp, url_prefix='/api')
```

**Step 3: Run tests**

```bash
pytest tests/test_engagement.py -v
```

Expected: Tests PASS

**Step 4: Commit**

```bash
git add backend/routes/engagement_routes.py backend/app.py
git commit -m "feat: implement likes endpoints"
```

---

### Task 3.3: Implement Comments Endpoints

**Files:**
- Modify: `backend/routes/engagement_routes.py`
- Modify: `backend/tests/test_engagement.py`

**Step 1: Add comment tests**

Add to test_engagement.py:

```python
def test_create_comment_success(client, auth_headers):
    """Test creating a comment"""
    payload = {
        'post_id': 'test-post-uuid',
        'content': 'This looks delicious!'
    }

    response = client.post('/api/posts/comments',
                          data=json.dumps(payload),
                          headers={**auth_headers, 'Content-Type': 'application/json'})

    assert response.status_code == 201
    data = response.get_json()
    assert data['content'] == 'This looks delicious!'
    assert 'id' in data

def test_get_post_comments(client):
    """Test getting comments for a post"""
    response = client.get('/api/posts/test-post-uuid/comments')

    assert response.status_code == 200
    data = response.get_json()
    assert 'comments' in data
    assert isinstance(data['comments'], list)

def test_delete_comment_success(client, auth_headers):
    """Test deleting a comment"""
    response = client.delete('/api/posts/comments/comment-uuid',
                            headers=auth_headers)

    assert response.status_code == 200
```

**Step 2: Implement comment endpoints**

Add to engagement_routes.py:

```python
@engagement_bp.route("/posts/comments", methods=["POST"])
def create_comment():
    """Create a comment on a post"""
    data = request.get_json() or {}
    post_id = data.get('post_id')
    content = data.get('content', '').strip()

    if not post_id or not content:
        return jsonify({"error": "post_id and content required"}), 400

    user_id = data.get('user_id', str(uuid.uuid4()))

    try:
        result = supabase.table("comments").insert({
            "post_id": post_id,
            "user_id": user_id,
            "content": content
        }).execute()

        return jsonify(result.data[0]), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/<post_id>/comments", methods=["GET"])
def get_post_comments(post_id):
    """Get all comments for a post"""
    try:
        # Get comments with user info
        comments_result = supabase.table("comments")\
            .select("*")\
            .eq("post_id", post_id)\
            .order("created_at", desc=False)\
            .execute()

        comments = comments_result.data or []

        # Get user info for each comment
        user_ids = list(set(c['user_id'] for c in comments))
        if user_ids:
            users_result = supabase.table("user")\
                .select("id, username, profile_pic")\
                .in_("id", user_ids)\
                .execute()

            users_map = {u['id']: u for u in (users_result.data or [])}

            # Attach user info to comments
            for comment in comments:
                user = users_map.get(comment['user_id'], {})
                comment['user'] = {
                    'username': user.get('username', 'Unknown'),
                    'profile_pic': user.get('profile_pic')
                }

        return jsonify({"comments": comments, "count": len(comments)}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/comments/<comment_id>", methods=["DELETE"])
def delete_comment(comment_id):
    """Delete a comment (user must own it)"""
    # TODO: Verify user owns comment via JWT
    user_id = request.args.get('user_id', 'mock-user')

    try:
        # Delete only if user owns it
        result = supabase.table("comments")\
            .delete()\
            .eq("id", comment_id)\
            .eq("user_id", user_id)\
            .execute()

        if not result.data:
            return jsonify({"error": "Comment not found or unauthorized"}), 404

        return jsonify({"message": "Comment deleted"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

**Step 3: Run tests**

```bash
pytest tests/test_engagement.py -v
```

Expected: All tests PASS

**Step 4: Commit**

```bash
git add backend/routes/engagement_routes.py backend/tests/test_engagement.py
git commit -m "feat: implement comments endpoints"
```

---

### Task 3.4: Implement Save/Bookmark Endpoints

**Files:**
- Modify: `backend/routes/engagement_routes.py`

**Step 1: Add save endpoints**

```python
@engagement_bp.route("/posts/save", methods=["POST"])
def save_post():
    """Save/bookmark a post"""
    data = request.get_json() or {}
    post_id = data.get('post_id')

    if not post_id:
        return jsonify({"error": "post_id required"}), 400

    user_id = data.get('user_id', str(uuid.uuid4()))

    try:
        supabase.table("saved_posts").insert({
            "post_id": post_id,
            "user_id": user_id
        }).execute()

        return jsonify({"saved": True, "message": "Post saved"}), 201

    except Exception as e:
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            return jsonify({"saved": True, "message": "Already saved"}), 200
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/save", methods=["DELETE"])
def unsave_post():
    """Unsave/unbookmark a post"""
    data = request.get_json() or {}
    post_id = data.get('post_id')

    if not post_id:
        return jsonify({"error": "post_id required"}), 400

    user_id = data.get('user_id', str(uuid.uuid4()))

    try:
        supabase.table("saved_posts")\
            .delete()\
            .eq("post_id", post_id)\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({"saved": False, "message": "Post unsaved"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@engagement_bp.route("/posts/saved", methods=["GET"])
def get_saved_posts():
    """Get all saved posts for current user"""
    user_id = request.args.get('user_id', 'mock-user')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 20))

    start = (page - 1) * per_page
    end = start + per_page - 1

    try:
        # Get saved post IDs
        saved_result = supabase.table("saved_posts")\
            .select("post_id, saved_at")\
            .eq("user_id", user_id)\
            .order("saved_at", desc=True)\
            .range(start, end)\
            .execute()

        if not saved_result.data:
            return jsonify({"posts": [], "page": page, "per_page": per_page}), 200

        post_ids = [s['post_id'] for s in saved_result.data]

        # Get full post data
        posts_result = supabase.table("posts")\
            .select("*")\
            .in_("id", post_ids)\
            .execute()

        return jsonify({
            "posts": posts_result.data or [],
            "page": page,
            "per_page": per_page
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

**Step 2: Test manually**

```bash
# Save a post
curl -X POST http://localhost:5000/api/posts/save \
  -H "Content-Type: application/json" \
  -d '{"post_id":"some-uuid","user_id":"test-user"}'

# Get saved posts
curl "http://localhost:5000/api/posts/saved?user_id=test-user"
```

**Step 3: Commit**

```bash
git add backend/routes/engagement_routes.py
git commit -m "feat: implement save/bookmark endpoints"
```

---

### Task 3.5: Update Feed Endpoint with Engagement Data

**Context:** Feed should return likes count, comments count, and user's interaction status.

**Files:**
- Modify: `backend/routes/posts_routes.py:50-110`

**Step 1: Enhance feed endpoint**

Replace the get_feed function:

```python
@posts_bp.route("/feed", methods=["GET"])
def get_feed():
    try:
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 10))
        user_id = request.args.get("user_id")  # Current user ID for checking likes/saves

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

        # Get engagement counts for all posts
        likes_res = supabase.table("likes")\
            .select("post_id", count="exact")\
            .in_("post_id", post_ids)\
            .execute()

        comments_res = supabase.table("comments")\
            .select("post_id", count="exact")\
            .in_("post_id", post_ids)\
            .execute()

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
                    "likes_count": 0,  # TODO: Aggregate properly
                    "comments_count": 0,  # TODO: Aggregate properly
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
```

**Step 2: Test feed endpoint**

```bash
curl "http://localhost:5000/api/feed?page=1&per_page=5&user_id=test-user" | jq
```

Expected: Feed items include engagement data

**Step 3: Commit**

```bash
git add backend/routes/posts_routes.py
git commit -m "feat: enhance feed endpoint with engagement data"
```

---

## BATCH 4: Backend - Social Features (Follow/Unfollow)

### Task 4.1: Create Follow System Endpoints

**Files:**
- Create: `backend/routes/social_routes.py`

**Step 1: Create social routes blueprint**

```python
# backend/routes/social_routes.py
from flask import Blueprint, request, jsonify
from supabase_client import supabase
import uuid

social_bp = Blueprint("social", __name__)

@social_bp.route("/users/<user_id>/follow", methods=["POST"])
def follow_user(user_id):
    """Follow a user"""
    data = request.get_json() or {}
    follower_id = data.get('follower_id')  # TODO: Get from JWT

    if not follower_id:
        return jsonify({"error": "follower_id required"}), 400

    if follower_id == user_id:
        return jsonify({"error": "Cannot follow yourself"}), 400

    try:
        # Check if user exists
        user_check = supabase.table("user").select("id").eq("id", user_id).execute()
        if not user_check.data:
            return jsonify({"error": "User not found"}), 404

        # Insert follow relationship
        supabase.table("followers").insert({
            "follower_id": follower_id,
            "followed_id": user_id
        }).execute()

        return jsonify({"following": True, "message": "User followed"}), 201

    except Exception as e:
        if "duplicate" in str(e).lower() or "unique" in str(e).lower():
            return jsonify({"following": True, "message": "Already following"}), 200
        return jsonify({"error": str(e)}), 500

@social_bp.route("/users/<user_id>/follow", methods=["DELETE"])
def unfollow_user(user_id):
    """Unfollow a user"""
    data = request.get_json() or {}
    follower_id = data.get('follower_id')  # TODO: Get from JWT

    if not follower_id:
        return jsonify({"error": "follower_id required"}), 400

    try:
        supabase.table("followers")\
            .delete()\
            .eq("follower_id", follower_id)\
            .eq("followed_id", user_id)\
            .execute()

        return jsonify({"following": False, "message": "User unfollowed"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@social_bp.route("/users/<user_id>/followers", methods=["GET"])
def get_followers(user_id):
    """Get list of followers for a user"""
    try:
        # Get follower IDs
        followers_res = supabase.table("followers")\
            .select("follower_id")\
            .eq("followed_id", user_id)\
            .execute()

        follower_ids = [f['follower_id'] for f in (followers_res.data or [])]

        if not follower_ids:
            return jsonify({"followers": [], "count": 0}), 200

        # Get user info for followers
        users_res = supabase.table("user")\
            .select("id, username, display_name, profile_pic")\
            .in_("id", follower_ids)\
            .execute()

        return jsonify({
            "followers": users_res.data or [],
            "count": len(users_res.data or [])
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@social_bp.route("/users/<user_id>/following", methods=["GET"])
def get_following(user_id):
    """Get list of users that this user follows"""
    try:
        # Get followed user IDs
        following_res = supabase.table("followers")\
            .select("followed_id")\
            .eq("follower_id", user_id)\
            .execute()

        followed_ids = [f['followed_id'] for f in (following_res.data or [])]

        if not followed_ids:
            return jsonify({"following": [], "count": 0}), 200

        # Get user info
        users_res = supabase.table("user")\
            .select("id, username, display_name, profile_pic")\
            .in_("id", followed_ids)\
            .execute()

        return jsonify({
            "following": users_res.data or [],
            "count": len(users_res.data or [])
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@social_bp.route("/users/<user_id>/following/<target_id>", methods=["GET"])
def check_following_status(user_id, target_id):
    """Check if user_id follows target_id"""
    try:
        result = supabase.table("followers")\
            .select("follower_id")\
            .eq("follower_id", user_id)\
            .eq("followed_id", target_id)\
            .execute()

        return jsonify({"following": len(result.data or []) > 0}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@social_bp.route("/users/<user_id>/stats", methods=["GET"])
def get_user_stats(user_id):
    """Get follower/following counts"""
    try:
        # Count followers
        followers_res = supabase.table("followers")\
            .select("follower_id", count="exact")\
            .eq("followed_id", user_id)\
            .execute()

        # Count following
        following_res = supabase.table("followers")\
            .select("followed_id", count="exact")\
            .eq("follower_id", user_id)\
            .execute()

        # Count posts
        posts_res = supabase.table("posts")\
            .select("id", count="exact")\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({
            "followers_count": followers_res.count or 0,
            "following_count": following_res.count or 0,
            "posts_count": posts_res.count or 0
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

**Step 2: Register blueprint**

Modify `backend/app.py`:

```python
from routes.social_routes import social_bp

app.register_blueprint(social_bp, url_prefix='/api')
```

**Step 3: Test follow/unfollow**

```bash
# Follow user
curl -X POST http://localhost:5000/api/users/user-uuid-2/follow \
  -H "Content-Type: application/json" \
  -d '{"follower_id":"user-uuid-1"}'

# Get followers
curl http://localhost:5000/api/users/user-uuid-2/followers | jq

# Get user stats
curl http://localhost:5000/api/users/user-uuid-1/stats | jq
```

Expected: Successful follow operations and correct counts

**Step 4: Commit**

```bash
git add backend/routes/social_routes.py backend/app.py
git commit -m "feat: implement follow/unfollow system"
```

---

## BATCH 5: Backend - Messaging System

### Task 5.1: Create Messaging Endpoints

**Files:**
- Create: `backend/routes/messages_routes.py`

**Step 1: Create messages blueprint**

```python
# backend/routes/messages_routes.py
from flask import Blueprint, request, jsonify
from supabase_client import supabase
from datetime import datetime
import uuid

messages_bp = Blueprint("messages", __name__)

@messages_bp.route("/conversations", methods=["POST"])
def create_conversation():
    """Create or get existing conversation between users"""
    data = request.get_json() or {}
    user_id = data.get('user_id')  # Current user
    other_user_id = data.get('other_user_id')  # User to chat with

    if not user_id or not other_user_id:
        return jsonify({"error": "user_id and other_user_id required"}), 400

    try:
        # Check if conversation already exists between these users
        # Get all conversations for user_id
        user_convos = supabase.table("conversation_participants")\
            .select("conversation_id")\
            .eq("user_id", user_id)\
            .execute()

        convo_ids = [c['conversation_id'] for c in (user_convos.data or [])]

        if convo_ids:
            # Check if other_user is in any of these conversations
            other_user_convos = supabase.table("conversation_participants")\
                .select("conversation_id")\
                .eq("user_id", other_user_id)\
                .in_("conversation_id", convo_ids)\
                .execute()

            if other_user_convos.data:
                # Conversation exists
                existing_convo_id = other_user_convos.data[0]['conversation_id']
                return jsonify({"conversation_id": existing_convo_id, "created": False}), 200

        # Create new conversation
        convo_res = supabase.table("conversations").insert({}).execute()
        convo_id = convo_res.data[0]['id']

        # Add both users as participants
        supabase.table("conversation_participants").insert([
            {"conversation_id": convo_id, "user_id": user_id},
            {"conversation_id": convo_id, "user_id": other_user_id}
        ]).execute()

        return jsonify({"conversation_id": convo_id, "created": True}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@messages_bp.route("/conversations/<conversation_id>/messages", methods=["POST"])
def send_message(conversation_id):
    """Send a message in a conversation"""
    data = request.get_json() or {}
    sender_id = data.get('sender_id')  # TODO: Get from JWT
    content = data.get('content', '').strip()

    if not sender_id or not content:
        return jsonify({"error": "sender_id and content required"}), 400

    try:
        # Verify sender is participant
        participant_check = supabase.table("conversation_participants")\
            .select("user_id")\
            .eq("conversation_id", conversation_id)\
            .eq("user_id", sender_id)\
            .execute()

        if not participant_check.data:
            return jsonify({"error": "User not participant of conversation"}), 403

        # Insert message
        message_res = supabase.table("messages").insert({
            "conversation_id": conversation_id,
            "sender_id": sender_id,
            "content": content
        }).execute()

        # Update conversation updated_at
        supabase.table("conversations")\
            .update({"updated_at": datetime.utcnow().isoformat()})\
            .eq("id", conversation_id)\
            .execute()

        return jsonify(message_res.data[0]), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@messages_bp.route("/conversations/<conversation_id>/messages", methods=["GET"])
def get_messages(conversation_id):
    """Get all messages in a conversation"""
    user_id = request.args.get('user_id')  # TODO: Get from JWT
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))

    start = (page - 1) * per_page
    end = start + per_page - 1

    try:
        # Verify user is participant
        if user_id:
            participant_check = supabase.table("conversation_participants")\
                .select("user_id")\
                .eq("conversation_id", conversation_id)\
                .eq("user_id", user_id)\
                .execute()

            if not participant_check.data:
                return jsonify({"error": "Unauthorized"}), 403

        # Get messages
        messages_res = supabase.table("messages")\
            .select("*")\
            .eq("conversation_id", conversation_id)\
            .order("created_at", desc=False)\
            .range(start, end)\
            .execute()

        return jsonify({
            "messages": messages_res.data or [],
            "page": page,
            "per_page": per_page
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@messages_bp.route("/conversations", methods=["GET"])
def get_user_conversations():
    """Get all conversations for current user"""
    user_id = request.args.get('user_id')  # TODO: Get from JWT

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    try:
        # Get conversation IDs for user
        participant_res = supabase.table("conversation_participants")\
            .select("conversation_id")\
            .eq("user_id", user_id)\
            .execute()

        convo_ids = [p['conversation_id'] for p in (participant_res.data or [])]

        if not convo_ids:
            return jsonify({"conversations": []}), 200

        # Get conversation details
        convos_res = supabase.table("conversations")\
            .select("*")\
            .in_("id", convo_ids)\
            .order("updated_at", desc=True)\
            .execute()

        conversations = []
        for convo in (convos_res.data or []):
            convo_id = convo['id']

            # Get other participants
            participants_res = supabase.table("conversation_participants")\
                .select("user_id")\
                .eq("conversation_id", convo_id)\
                .neq("user_id", user_id)\
                .execute()

            other_user_ids = [p['user_id'] for p in (participants_res.data or [])]

            # Get last message
            last_msg_res = supabase.table("messages")\
                .select("*")\
                .eq("conversation_id", convo_id)\
                .order("created_at", desc=True)\
                .limit(1)\
                .execute()

            last_message = last_msg_res.data[0] if last_msg_res.data else None

            # Get unread count
            last_read_res = supabase.table("conversation_participants")\
                .select("last_read_at")\
                .eq("conversation_id", convo_id)\
                .eq("user_id", user_id)\
                .execute()

            last_read_at = last_read_res.data[0]['last_read_at'] if last_read_res.data else None

            unread_count = 0
            if last_read_at and last_message:
                unread_res = supabase.table("messages")\
                    .select("id", count="exact")\
                    .eq("conversation_id", convo_id)\
                    .neq("sender_id", user_id)\
                    .gt("created_at", last_read_at)\
                    .execute()
                unread_count = unread_res.count or 0

            conversations.append({
                "id": convo_id,
                "other_user_ids": other_user_ids,
                "last_message": last_message,
                "unread_count": unread_count,
                "updated_at": convo['updated_at']
            })

        return jsonify({"conversations": conversations}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@messages_bp.route("/conversations/<conversation_id>/read", methods=["POST"])
def mark_conversation_read(conversation_id):
    """Mark conversation as read for current user"""
    data = request.get_json() or {}
    user_id = data.get('user_id')  # TODO: Get from JWT

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    try:
        supabase.table("conversation_participants")\
            .update({"last_read_at": datetime.utcnow().isoformat()})\
            .eq("conversation_id", conversation_id)\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({"message": "Marked as read"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

**Step 2: Register blueprint**

Modify `backend/app.py`:

```python
from routes.messages_routes import messages_bp

app.register_blueprint(messages_bp, url_prefix='/api')
```

**Step 3: Test messaging**

```bash
# Create conversation
curl -X POST http://localhost:5000/api/conversations \
  -H "Content-Type: application/json" \
  -d '{"user_id":"user-1","other_user_id":"user-2"}'

# Send message
curl -X POST http://localhost:5000/api/conversations/CONVO_ID/messages \
  -H "Content-Type: application/json" \
  -d '{"sender_id":"user-1","content":"Hello!"}'

# Get messages
curl "http://localhost:5000/api/conversations/CONVO_ID/messages?user_id=user-1" | jq
```

**Step 4: Commit**

```bash
git add backend/routes/messages_routes.py backend/app.py
git commit -m "feat: implement messaging system endpoints"
```

---

## BATCH 6: Backend - Gamification Skeleton

### Task 6.1: Create Gamification Endpoints

**Files:**
- Create: `backend/routes/gamification_routes.py`

**Step 1: Create gamification blueprint**

```python
# backend/routes/gamification_routes.py
from flask import Blueprint, request, jsonify
from supabase_client import supabase
from datetime import datetime, date
import uuid

gamification_bp = Blueprint("gamification", __name__)

@gamification_bp.route("/gamification/<user_id>", methods=["GET"])
def get_user_gamification(user_id):
    """Get gamification stats for user"""
    try:
        result = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()

        if not result.data:
            # Create initial record if doesn't exist
            init_data = {
                "user_id": user_id,
                "xp": 0,
                "level": 1,
                "coins": 0,
                "current_streak": 0,
                "longest_streak": 0
            }
            create_res = supabase.table("user_gamification").insert(init_data).execute()
            return jsonify(create_res.data[0]), 200

        return jsonify(result.data[0]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/<user_id>/xp", methods=["POST"])
def add_xp(user_id):
    """Add XP to user (called when user completes actions)"""
    data = request.get_json() or {}
    xp_amount = data.get('amount', 0)

    if xp_amount <= 0:
        return jsonify({"error": "amount must be positive"}), 400

    try:
        # Get current stats
        current = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()

        if not current.data:
            # Initialize
            current_xp = 0
            current_level = 1
        else:
            current_xp = current.data[0]['xp']
            current_level = current.data[0]['level']

        # Add XP
        new_xp = current_xp + xp_amount

        # Calculate new level (simple: every 100 XP = 1 level)
        new_level = (new_xp // 100) + 1

        # Update
        update_data = {
            "xp": new_xp,
            "level": new_level,
            "updated_at": datetime.utcnow().isoformat()
        }

        if current.data:
            supabase.table("user_gamification")\
                .update(update_data)\
                .eq("user_id", user_id)\
                .execute()
        else:
            update_data["user_id"] = user_id
            supabase.table("user_gamification").insert(update_data).execute()

        level_up = new_level > current_level

        return jsonify({
            "xp": new_xp,
            "level": new_level,
            "level_up": level_up,
            "xp_gained": xp_amount
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/<user_id>/coins", methods=["POST"])
def add_coins(user_id):
    """Add coins to user"""
    data = request.get_json() or {}
    coin_amount = data.get('amount', 0)

    if coin_amount <= 0:
        return jsonify({"error": "amount must be positive"}), 400

    try:
        current = supabase.table("user_gamification")\
            .select("coins")\
            .eq("user_id", user_id)\
            .execute()

        current_coins = current.data[0]['coins'] if current.data else 0
        new_coins = current_coins + coin_amount

        supabase.table("user_gamification")\
            .update({"coins": new_coins, "updated_at": datetime.utcnow().isoformat()})\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({"coins": new_coins, "coins_gained": coin_amount}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/<user_id>/streak", methods=["POST"])
def update_streak(user_id):
    """Update user's activity streak"""
    try:
        current = supabase.table("user_gamification")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()

        today = date.today()

        if not current.data:
            # Initialize with streak = 1
            init_data = {
                "user_id": user_id,
                "current_streak": 1,
                "longest_streak": 1,
                "last_activity_date": today.isoformat()
            }
            supabase.table("user_gamification").insert(init_data).execute()
            return jsonify({"current_streak": 1, "longest_streak": 1}), 200

        stats = current.data[0]
        last_activity = stats.get('last_activity_date')
        current_streak = stats.get('current_streak', 0)
        longest_streak = stats.get('longest_streak', 0)

        if last_activity:
            last_date = date.fromisoformat(last_activity)
            days_diff = (today - last_date).days

            if days_diff == 0:
                # Already logged today
                return jsonify({"current_streak": current_streak, "longest_streak": longest_streak}), 200
            elif days_diff == 1:
                # Consecutive day
                current_streak += 1
            else:
                # Streak broken
                current_streak = 1
        else:
            current_streak = 1

        # Update longest streak
        if current_streak > longest_streak:
            longest_streak = current_streak

        supabase.table("user_gamification")\
            .update({
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "last_activity_date": today.isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            })\
            .eq("user_id", user_id)\
            .execute()

        return jsonify({"current_streak": current_streak, "longest_streak": longest_streak}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/badges", methods=["GET"])
def get_all_badges():
    """Get all available badges"""
    try:
        result = supabase.table("badges").select("*").execute()
        return jsonify({"badges": result.data or []}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/gamification/<user_id>/badges", methods=["GET"])
def get_user_badges(user_id):
    """Get badges earned by user"""
    try:
        result = supabase.table("user_badges")\
            .select("badge_id, earned_at")\
            .eq("user_id", user_id)\
            .execute()

        badge_ids = [b['badge_id'] for b in (result.data or [])]

        if not badge_ids:
            return jsonify({"badges": []}), 200

        badges_res = supabase.table("badges")\
            .select("*")\
            .in_("id", badge_ids)\
            .execute()

        return jsonify({"badges": badges_res.data or []}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@gamification_bp.route("/challenges", methods=["GET"])
def get_challenges():
    """Get active challenges"""
    try:
        result = supabase.table("challenges")\
            .select("*")\
            .eq("is_active", True)\
            .order("created_at", desc=True)\
            .execute()

        return jsonify({"challenges": result.data or []}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
```

**Step 2: Register blueprint**

Modify `backend/app.py`:

```python
from routes.gamification_routes import gamification_bp

app.register_blueprint(gamification_bp, url_prefix='/api')
```

**Step 3: Test gamification**

```bash
# Get user stats
curl http://localhost:5000/api/gamification/user-123

# Add XP
curl -X POST http://localhost:5000/api/gamification/user-123/xp \
  -H "Content-Type: application/json" \
  -d '{"amount":50}'

# Update streak
curl -X POST http://localhost:5000/api/gamification/user-123/streak
```

**Step 4: Commit**

```bash
git add backend/routes/gamification_routes.py backend/app.py
git commit -m "feat: implement gamification skeleton endpoints"
```

---

## BATCH 7: Frontend - Post Creation UI

### Task 7.1: Create Post Creation Page Component

**Files:**
- Create: `frontend/Plated/src/pages/CreatePostPage.tsx`
- Create: `frontend/Plated/src/pages/CreatePostPage.css`

**Step 1: Create CreatePostPage component**

```typescript
// frontend/Plated/src/pages/CreatePostPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import './CreatePostPage.css';

type PostType = 'simple' | 'recipe';

interface RecipeData {
  title: string;
  prep_time: number;
  cook_time: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  ingredients: { item: string; amount: string; unit: string }[];
  instructions: string[];
  tags: string[];
}

function CreatePostPage() {
  const navigate = useNavigate();
  const [postType, setPostType] = useState<PostType>('simple');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  // Recipe fields
  const [recipeTitle, setRecipeTitle] = useState('');
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [servings, setServings] = useState(4);
  const [difficulty, setDifficulty] = useState('medium');
  const [cuisine, setCuisine] = useState('');
  const [ingredients, setIngredients] = useState<{ item: string; amount: string; unit: string }[]>([
    { item: '', amount: '', unit: '' }
  ]);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Check auth
  if (!isAuthenticated()) {
    navigate('/login');
    return null;
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { item: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof typeof ingredients[0], value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, '']);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      setError('Please select an image');
      return;
    }

    if (postType === 'recipe') {
      if (!recipeTitle.trim()) {
        setError('Recipe title is required');
        return;
      }
      if (ingredients.every(ing => !ing.item.trim())) {
        setError('At least one ingredient is required');
        return;
      }
      if (instructions.every(inst => !inst.trim())) {
        setError('At least one instruction is required');
        return;
      }
    }

    setIsUploading(true);
    setError('');

    try {
      // 1. Upload image
      const formData = new FormData();
      formData.append('image', imageFile);

      const uploadRes = await fetch('http://localhost:5000/api/posts/upload-image', {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) {
        throw new Error('Image upload failed');
      }

      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.image_url;

      // 2. Create post
      const postData: any = {
        post_type: postType,
        image_url: imageUrl,
        caption: caption.trim()
      };

      if (postType === 'recipe') {
        const recipeData: RecipeData = {
          title: recipeTitle,
          prep_time: prepTime,
          cook_time: cookTime,
          servings: servings,
          difficulty: difficulty,
          cuisine: cuisine,
          ingredients: ingredients.filter(ing => ing.item.trim()),
          instructions: instructions.filter(inst => inst.trim()),
          tags: tags
        };
        postData.recipe_data = recipeData;
      }

      const createRes = await fetch('http://localhost:5000/api/posts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });

      if (!createRes.ok) {
        throw new Error('Failed to create post');
      }

      // Success - navigate to feed
      navigate('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="create-post-page">
      <header className="create-post-header">
        <button className="back-btn" onClick={() => navigate('/feed')}>
          Cancel
        </button>
        <h1>Create Post</h1>
        <button className="submit-btn" onClick={handleSubmit} disabled={isUploading}>
          {isUploading ? 'Posting...' : 'Post'}
        </button>
      </header>

      <div className="create-post-content">
        {error && <div className="error-message">{error}</div>}

        {/* Post Type Toggle */}
        <div className="post-type-toggle">
          <button
            className={postType === 'simple' ? 'active' : ''}
            onClick={() => setPostType('simple')}
          >
            Simple Post
          </button>
          <button
            className={postType === 'recipe' ? 'active' : ''}
            onClick={() => setPostType('recipe')}
          >
            Recipe Post
          </button>
        </div>

        {/* Image Upload */}
        <div className="image-upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            id="image-input"
            style={{ display: 'none' }}
          />
          <label htmlFor="image-input" className="image-upload-label">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            ) : (
              <div className="image-placeholder">
                <span>+ Add Photo</span>
              </div>
            )}
          </label>
        </div>

        {/* Caption */}
        <div className="form-group">
          <label>Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            rows={3}
          />
        </div>

        {/* Recipe Fields (only if recipe post) */}
        {postType === 'recipe' && (
          <div className="recipe-fields">
            <div className="form-group">
              <label>Recipe Title *</label>
              <input
                type="text"
                value={recipeTitle}
                onChange={(e) => setRecipeTitle(e.target.value)}
                placeholder="e.g., Chicken Alfredo"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Prep Time (min)</label>
                <input
                  type="number"
                  value={prepTime}
                  onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Cook Time (min)</label>
                <input
                  type="number"
                  value={cookTime}
                  onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="form-group">
                <label>Servings</label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="form-group">
                <label>Cuisine</label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="e.g., Italian"
                />
              </div>
            </div>

            {/* Ingredients */}
            <div className="form-group">
              <label>Ingredients *</label>
              {ingredients.map((ing, idx) => (
                <div key={idx} className="ingredient-row">
                  <input
                    type="text"
                    placeholder="Amount"
                    value={ing.amount}
                    onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Unit"
                    value={ing.unit}
                    onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Ingredient"
                    value={ing.item}
                    onChange={(e) => updateIngredient(idx, 'item', e.target.value)}
                  />
                  {ingredients.length > 1 && (
                    <button type="button" onClick={() => removeIngredient(idx)}>×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addIngredient} className="add-btn">
                + Add Ingredient
              </button>
            </div>

            {/* Instructions */}
            <div className="form-group">
              <label>Instructions *</label>
              {instructions.map((inst, idx) => (
                <div key={idx} className="instruction-row">
                  <span className="instruction-number">{idx + 1}.</span>
                  <textarea
                    value={inst}
                    onChange={(e) => updateInstruction(idx, e.target.value)}
                    placeholder="Describe this step..."
                    rows={2}
                  />
                  {instructions.length > 1 && (
                    <button type="button" onClick={() => removeInstruction(idx)}>×</button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addInstruction} className="add-btn">
                + Add Step
              </button>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label>Tags</label>
              <div className="tags-input">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag and press Enter"
                />
                <button type="button" onClick={addTag}>Add</button>
              </div>
              <div className="tags-list">
                {tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreatePostPage;
```

**Step 2: Create styles**

```css
/* frontend/Plated/src/pages/CreatePostPage.css */
.create-post-page {
  min-height: 100vh;
  background: #fafafa;
}

.create-post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #dbdbdb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.create-post-header h1 {
  font-size: 1.2rem;
  font-weight: 600;
}

.back-btn, .submit-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.submit-btn {
  color: #0095f6;
  font-weight: 600;
}

.submit-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.create-post-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.post-type-toggle {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.post-type-toggle button {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #dbdbdb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.post-type-toggle button.active {
  border-color: #0095f6;
  background: #e3f2fd;
  color: #0095f6;
}

.image-upload-section {
  margin-bottom: 2rem;
}

.image-upload-label {
  display: block;
  cursor: pointer;
}

.image-preview {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
}

.image-placeholder {
  width: 100%;
  height: 300px;
  border: 2px dashed #dbdbdb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8e8e8e;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #262626;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dbdbdb;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.ingredient-row,
.instruction-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: flex-start;
}

.ingredient-row input {
  flex: 1;
}

.ingredient-row input:first-child {
  flex: 0.5;
}

.instruction-number {
  font-weight: 600;
  padding-top: 0.75rem;
  min-width: 30px;
}

.instruction-row textarea {
  flex: 1;
}

.add-btn {
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 0.5rem;
}

.tags-input {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tags-input input {
  flex: 1;
}

.tags-input button {
  padding: 0.5rem 1rem;
  background: #0095f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: #e3f2fd;
  color: #0095f6;
  border-radius: 20px;
  font-size: 0.9rem;
}

.tag button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  line-height: 1;
  color: #0095f6;
}
```

**Step 3: Add route to App.tsx**

Modify `frontend/Plated/src/App.tsx`:

```typescript
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'));

// In Routes:
<Route path="/create" element={<CreatePostPage />} />
```

**Step 4: Test manually**

```bash
cd frontend/Plated
npm run dev
# Navigate to http://localhost:5173/create
```

Expected: Post creation form renders with both simple and recipe modes

**Step 5: Commit**

```bash
git add frontend/Plated/src/pages/CreatePostPage.tsx frontend/Plated/src/pages/CreatePostPage.css frontend/Plated/src/App.tsx
git commit -m "feat: add post creation page with simple and recipe modes"
```

---

### Task 7.2: Add Create Button to Feed Page

**Files:**
- Modify: `frontend/Plated/src/pages/feed/FeedPage.tsx`
- Modify: `frontend/Plated/src/pages/feed/FeedPage.css`

**Step 1: Add create button to feed header**

In FeedPage.tsx, add after the search bar:

```typescript
<button
  className="create-post-btn"
  onClick={() => navigate('/create')}
  aria-label="Create Post"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
</button>
```

**Step 2: Add styles**

In FeedPage.css:

```css
.create-post-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #0095f6;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.create-post-btn:hover {
  background: #0077cc;
}
```

**Step 3: Test**

Navigate to /feed and click the + button

Expected: Navigates to /create

**Step 4: Commit**

```bash
git add frontend/Plated/src/pages/feed/FeedPage.tsx frontend/Plated/src/pages/feed/FeedPage.css
git commit -m "feat: add create post button to feed page"
```

---

*Note: Due to message length constraints, I'm providing the plan structure here. The complete plan would continue with:*

**BATCH 8: Frontend - Engagement UI** (Like buttons, comment sections, save buttons)
**BATCH 9: Frontend - Social Features UI** (Follow buttons, followers/following lists)
**BATCH 10: Frontend - Professional Redesign** (Modernize components, consistent styling, responsive design)

Each batch follows the same TDD pattern with bite-sized tasks, complete code examples, and verification steps.

---

## Execution Strategy

**Recommended Approach:** Implement batches sequentially but tasks within batches can be parallelized:

- **Batch 1** must be done first (database foundation)
- **Batches 2-6** (backend) can be done in parallel by different developers
- **Batches 7-10** (frontend) depend on corresponding backend batches

**Testing Strategy:**
- Unit tests for each endpoint
- Integration tests after each batch
- Manual E2E testing after frontend batches

**Deployment Checklist:**
- [ ] All Supabase tables created
- [ ] All backend tests passing
- [ ] Frontend builds without errors
- [ ] API endpoints returning correct data
- [ ] Images uploading to Supabase Storage
- [ ] Authentication working end-to-end

---
