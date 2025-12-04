-- ============================================================================
-- GAMIFICATION ENHANCEMENT MIGRATION
-- Adds missing tables from PLATED_GAMIFICATION_SPEC.md
-- ============================================================================
-- This migration adds the "Cooked-It Chain", Daily Chaos Ingredient,
-- Skill Tracks, and Coin Transaction logging features.
--
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Create new query
-- 3. Paste this entire file
-- 4. Run the query
-- 5. Verify success with the verification queries at the bottom
-- ============================================================================

-- ============================================================================
-- RECIPE COMPLETION TRACKING (Cooked-It Chain)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_completion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    recipe_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    has_proof BOOLEAN DEFAULT FALSE,
    proof_image_url TEXT,
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_recipe_completion_recipe_id ON recipe_completion(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_completion_user_id ON recipe_completion(user_id);
CREATE INDEX IF NOT EXISTS idx_recipe_completion_created_at ON recipe_completion(created_at DESC);

COMMENT ON TABLE recipe_completion IS 'Tracks when users complete/cook recipes - forms the Cooked-It Chain';
COMMENT ON COLUMN recipe_completion.has_proof IS 'Whether user uploaded proof photo';

-- ============================================================================
-- COIN TRANSACTION LOGGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS coin_transaction (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,  -- positive = earned, negative = spent
    reason VARCHAR(255) NOT NULL,  -- e.g., 'recipe_completion', 'creator_bonus', 'shop_purchase'
    metadata JSONB,  -- e.g., {"recipe_id": "uuid", "multiplier": 2.0}
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_transaction_user_id ON coin_transaction(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transaction_created_at ON coin_transaction(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_transaction_reason ON coin_transaction(reason);

COMMENT ON TABLE coin_transaction IS 'Audit log for all coin movements - enables balance calculation and history';
COMMENT ON COLUMN coin_transaction.amount IS 'Positive for earnings, negative for spending';
COMMENT ON COLUMN coin_transaction.metadata IS 'Additional context (recipe_id, bonus type, etc.)';

-- ============================================================================
-- DAILY CHAOS INGREDIENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_ingredient (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE UNIQUE NOT NULL,
    ingredient VARCHAR(255) NOT NULL,  -- e.g., 'eggs', 'spinach', 'chicken'
    multiplier DECIMAL(3, 1) DEFAULT 2.0,  -- point multiplier (e.g., 2.0 = 2x coins)
    icon_emoji VARCHAR(10),  -- e.g., '🥚', '🥬'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_ingredient_date ON daily_ingredient(date DESC);

COMMENT ON TABLE daily_ingredient IS 'Daily featured ingredient with point multiplier';
COMMENT ON COLUMN daily_ingredient.multiplier IS 'Multiplier for recipes using this ingredient (2.0 = double coins)';

-- ============================================================================
-- RECIPE INGREDIENT TAGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_ingredient_tag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    ingredient VARCHAR(255) NOT NULL,  -- free-text tag: 'eggs', 'chicken', 'tomato'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recipe_ingredient_tag_recipe_id ON recipe_ingredient_tag(recipe_id);
CREATE INDEX IF NOT EXISTS idx_recipe_ingredient_tag_ingredient ON recipe_ingredient_tag(ingredient);

COMMENT ON TABLE recipe_ingredient_tag IS 'Maps recipes to ingredients for chaos ingredient matching';
COMMENT ON COLUMN recipe_ingredient_tag.ingredient IS 'Lowercase ingredient name for matching';

-- ============================================================================
-- SKILL TRACKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS skill_track (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,  -- 'microwave-master', '$5-dinners'
    name VARCHAR(255) NOT NULL,  -- 'Microwave Master'
    description TEXT,
    icon VARCHAR(255),  -- emoji or icon code: '🔥', '💰'
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skill_track_order ON skill_track(display_order);

COMMENT ON TABLE skill_track IS 'Themed recipe collections users can complete (e.g., "Microwave Master")';
COMMENT ON COLUMN skill_track.icon IS 'Emoji or icon identifier for display';

-- ============================================================================
-- SKILL TRACK RECIPES (Many-to-Many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS skill_track_recipe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    track_id UUID NOT NULL REFERENCES skill_track(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(track_id, recipe_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_track_recipe_track_id ON skill_track_recipe(track_id);
CREATE INDEX IF NOT EXISTS idx_skill_track_recipe_recipe_id ON skill_track_recipe(recipe_id);

COMMENT ON TABLE skill_track_recipe IS 'Maps recipes to skill tracks';

-- ============================================================================
-- SKILL TRACK PROGRESS
-- ============================================================================

CREATE TABLE IF NOT EXISTS skill_track_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    track_id UUID NOT NULL REFERENCES skill_track(id) ON DELETE CASCADE,
    completed_recipes INTEGER DEFAULT 0,  -- count of completed recipes in this track
    completed_at TIMESTAMPTZ,  -- when user finished entire track
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_track_progress_user_id ON skill_track_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_track_progress_track_id ON skill_track_progress(track_id);

COMMENT ON TABLE skill_track_progress IS 'Tracks user progress through skill tracks';
COMMENT ON COLUMN skill_track_progress.completed_at IS 'NULL if track not yet complete';

-- ============================================================================
-- FREEZE TOKENS (for streak protection)
-- ============================================================================

-- Add freeze_tokens column to user_gamification if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'user_gamification' AND column_name = 'freeze_tokens') THEN
    ALTER TABLE user_gamification ADD COLUMN freeze_tokens INTEGER DEFAULT 0;
  END IF;
END $$;

COMMENT ON COLUMN user_gamification.freeze_tokens IS 'Tokens that can protect streaks from breaking';

-- ============================================================================
-- SAMPLE DATA FOR TESTING
-- ============================================================================

-- Insert sample skill tracks
INSERT INTO skill_track (slug, name, description, icon, display_order) VALUES
('microwave-master', 'Microwave Master', 'Master the art of microwave cooking with quick and easy recipes', '🔥', 1),
('budget-chef', '$5 Dinners', 'Delicious meals that won''t break the bank', '💰', 2),
('veggie-hero', 'Veggie Hero', 'Plant-based recipes that will make you love vegetables', '🥬', 3),
('quick-bites', 'Quick Bites', 'Meals ready in under 15 minutes', '⚡', 4),
('comfort-classics', 'Comfort Classics', 'Heartwarming traditional favorites', '🏠', 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample daily ingredients for next 7 days
INSERT INTO daily_ingredient (date, ingredient, multiplier, icon_emoji) VALUES
(CURRENT_DATE, 'eggs', 2.0, '🥚'),
(CURRENT_DATE + INTERVAL '1 day', 'chicken', 2.0, '🍗'),
(CURRENT_DATE + INTERVAL '2 days', 'spinach', 2.5, '🥬'),
(CURRENT_DATE + INTERVAL '3 days', 'tomato', 2.0, '🍅'),
(CURRENT_DATE + INTERVAL '4 days', 'pasta', 1.5, '🍝'),
(CURRENT_DATE + INTERVAL '5 days', 'cheese', 2.0, '🧀'),
(CURRENT_DATE + INTERVAL '6 days', 'potato', 1.5, '🥔')
ON CONFLICT (date) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify all tables were created
SELECT
    table_name,
    CASE
        WHEN table_name IN (
            'recipe_completion',
            'coin_transaction',
            'daily_ingredient',
            'recipe_ingredient_tag',
            'skill_track',
            'skill_track_recipe',
            'skill_track_progress'
        ) THEN '✅ NEW'
        ELSE '📋 EXISTING'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'recipe_completion',
    'coin_transaction',
    'daily_ingredient',
    'recipe_ingredient_tag',
    'skill_track',
    'skill_track_recipe',
    'skill_track_progress',
    'user_gamification',
    'badges',
    'challenges'
)
ORDER BY table_name;

-- Verify sample data was inserted
SELECT 'skill_track' as table_name, COUNT(*) as row_count FROM skill_track
UNION ALL
SELECT 'daily_ingredient', COUNT(*) FROM daily_ingredient;

-- Show skill tracks
SELECT slug, name, icon FROM skill_track ORDER BY display_order;

-- Show daily ingredients
SELECT date, ingredient, multiplier, icon_emoji FROM daily_ingredient ORDER BY date;
