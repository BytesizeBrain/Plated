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
