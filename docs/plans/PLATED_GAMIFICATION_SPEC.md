# Plated Gamification MVP – Implementation Spec

**Target**: Ship in ~2 days using existing stack.

## Overview

This document outlines the complete architecture and implementation guide for adding gamification features to the Plated with Friends platform. It includes database models, API endpoints, TypeScript types, React components, and a suggested implementation roadmap.

---

## Focus Features

1. **Cooked-It Chain** – Per-recipe completion leaderboard with avatars
2. **Daily Chaos Ingredient** – 2x points multiplier on recipes using today's featured ingredient
3. **Skill Tracks** – Progressive achievement system (e.g., "Microwave Master", "$5 Dinners")
4. **(Optional) Questlines** – Creator-authored challenges requiring followers

---

## Tech Stack

- **Frontend**: React 18 + TypeScript, Vite, Zustand, CSS Modules, React Router v6, Axios
- **Backend**: Flask (Python), Supabase (PostgreSQL + Realtime), Google OAuth + JWT, Supabase Storage
- **Auth**: JWT tokens in `Authorization: Bearer <token>` header
- **Database**: Supabase PostgreSQL with direct SQL/RPC calls via Supabase Python client
- **Client Library**: `supabase-py` for backend database access

---

# Part 1: Data Model (Supabase SQL)

## Setup

Initialize Supabase in your Flask app:

```python
# config.py or app initialization
from supabase import create_client, Client
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
```

---

## 1.1 Cooked-It Chain

### `recipe_completion` Table

Records when a user cooks a recipe. This forms the basis of the "Cooked-It Chain" – a visible list of who has completed each recipe.

Run this SQL in your Supabase dashboard (SQL Editor):

```sql
CREATE TABLE recipe_completion (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipe_id BIGINT NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    has_proof BOOLEAN DEFAULT FALSE,
    proof_image_url TEXT,
    UNIQUE(user_id, recipe_id)
);

CREATE INDEX idx_recipe_completion_recipe_id ON recipe_completion(recipe_id);
CREATE INDEX idx_recipe_completion_user_id ON recipe_completion(user_id);
```

**Key Details:**
- `user_id` is UUID (Supabase auth.users format)
- `recipe_id` references your `recipe` table
- `UNIQUE` constraint prevents double-completing
- Indexes for fast lookups on common queries
- `created_at` auto-timestamps for chain ordering

---

## 1.2 Coins / Currency System

### `coin_transaction` Table

A transaction log for all coin movements. This allows auditing and easier balance calculations.

```sql
CREATE TABLE coin_transaction (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,           -- + earn, - spend
    reason VARCHAR(255) NOT NULL,      -- e.g., "recipe_completion", "creator_bonus"
    metadata JSONB,                    -- e.g., {"recipe_id": 42}
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coin_transaction_user_id ON coin_transaction(user_id);
CREATE INDEX idx_coin_transaction_created_at ON coin_transaction(created_at DESC);
```

**Balance Calculation:**
Query balance on-the-fly in your backend:
```python
response = supabase.table("coin_transaction")\
    .select("amount")\
    .eq("user_id", user_id)\
    .execute()

balance = sum(row["amount"] for row in response.data)
```

---

## 1.3 Daily Chaos Ingredient

### `daily_ingredient` Table

A simple lookup for today's featured ingredient and its point multiplier.

```sql
CREATE TABLE daily_ingredient (
    id BIGSERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    ingredient VARCHAR(255) NOT NULL,  -- e.g., "eggs", "spinach"
    multiplier DECIMAL(3, 1) DEFAULT 2.0  -- point multiplier
);

CREATE INDEX idx_daily_ingredient_date ON daily_ingredient(date DESC);
```

**For MVP:** Manually seed 5–7 days of data via Supabase dashboard or INSERT statements.

### `recipe_ingredient_tag` Table

Maps recipes to ingredients so we can check if a recipe qualifies for today's chaos bonus.

```sql
CREATE TABLE recipe_ingredient_tag (
    id BIGSERIAL PRIMARY KEY,
    recipe_id BIGINT NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    ingredient VARCHAR(255) NOT NULL  -- free-text tag: "eggs", "tomato", etc.
);

CREATE INDEX idx_recipe_ingredient_tag_recipe_id ON recipe_ingredient_tag(recipe_id);
CREATE INDEX idx_recipe_ingredient_tag_ingredient ON recipe_ingredient_tag(ingredient);
```

**Note:** For demo purposes, seed this with mock data. In production, could derive from structured recipe data.

---

## 1.4 Skill Tracks

Tracks allow users to earn badges by completing themed recipe collections.

### `skill_track` Table

Metadata for each track (e.g., "Microwave Master", "$5 Dinners").

```sql
CREATE TABLE skill_track (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,  -- "microwave-master", "$5-dinners"
    name VARCHAR(255) NOT NULL,         -- "Microwave Master"
    description TEXT,                   -- "Master the art of the microwave"
    icon VARCHAR(255),                  -- emoji or icon code: "🔥", "microwave"
    "order" INTEGER DEFAULT 0           -- display order
);
```

### `skill_track_recipe` Table

Many-to-many mapping of recipes to tracks.

```sql
CREATE TABLE skill_track_recipe (
    id BIGSERIAL PRIMARY KEY,
    track_id BIGINT NOT NULL REFERENCES skill_track(id) ON DELETE CASCADE,
    recipe_id BIGINT NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    UNIQUE(track_id, recipe_id)
);

CREATE INDEX idx_skill_track_recipe_track_id ON skill_track_recipe(track_id);
CREATE INDEX idx_skill_track_recipe_recipe_id ON skill_track_recipe(recipe_id);
```

### `skill_track_progress` Table

Tracks user progress within each skill track.

```sql
CREATE TABLE skill_track_progress (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    track_id BIGINT NOT NULL REFERENCES skill_track(id) ON DELETE CASCADE,
    completed_recipes INTEGER DEFAULT 0,    -- count of recipes in this track
    completed_at TIMESTAMP,                 -- when user finished the track
    UNIQUE(user_id, track_id)
);

CREATE INDEX idx_skill_track_progress_user_id ON skill_track_progress(user_id);
CREATE INDEX idx_skill_track_progress_track_id ON skill_track_progress(track_id);
```

**Update Strategy:** Increment `completed_recipes` when a `recipe_completion` is created for a recipe in this track.

---

## 1.5 (Optional) Questlines + Follow Gating

For a more advanced 2-day MVP, include basic questline infrastructure.

### `user_follow` Table

Social graph for follow relationships.

```sql
CREATE TABLE user_follow (
    id BIGSERIAL PRIMARY KEY,
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    followee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(follower_id, followee_id),
    CHECK (follower_id != followee_id)  -- can't follow yourself
);

CREATE INDEX idx_user_follow_follower ON user_follow(follower_id);
CREATE INDEX idx_user_follow_followee ON user_follow(followee_id);
```

### `questline` Table

Creator-authored challenges.

```sql
CREATE TABLE questline (
    id BIGSERIAL PRIMARY KEY,
    creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cover_image_url TEXT,               -- Supabase Storage URL
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_questline_creator_id ON questline(creator_id);
```

### `questline_step` Table

Sequential recipes within a questline.

```sql
CREATE TABLE questline_step (
    id BIGSERIAL PRIMARY KEY,
    questline_id BIGINT NOT NULL REFERENCES questline(id) ON DELETE CASCADE,
    recipe_id BIGINT NOT NULL REFERENCES recipe(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL         -- 1, 2, 3, ...
);

CREATE INDEX idx_questline_step_questline_id ON questline_step(questline_id);
```

### `questline_enrollment` Table

Tracks user progress through questlines.

```sql
CREATE TABLE questline_enrollment (
    id BIGSERIAL PRIMARY KEY,
    questline_id BIGINT NOT NULL REFERENCES questline(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'in_progress',  -- "in_progress" | "completed"
    current_step INTEGER DEFAULT 0,            -- index of last completed step
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    UNIQUE(questline_id, user_id)
);

CREATE INDEX idx_questline_enrollment_user_id ON questline_enrollment(user_id);
CREATE INDEX idx_questline_enrollment_questline_id ON questline_enrollment(questline_id);
```

---

# Part 2: Backend Endpoints (Flask)

## Setup

Initialize Supabase in your Flask app:

```python
# config.py
import os
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # For admin operations

# Use service key for admin operations (backend only)
supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# For client-side operations (use anon key)
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
```

Create a new Blueprint for gamification routes:

```python
# routes/gamification.py

from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from datetime import date, datetime
from config import supabase_admin
import uuid

gamification_bp = Blueprint("gamification", __name__, url_prefix="/api/gamification")
```

Register in your Flask app:

```python
# app.py
from routes.gamification import gamification_bp

app.register_blueprint(gamification_bp)
```

---

## 2.1 Complete a Recipe (Cooked-It + Rewards)

**Endpoint:** `POST /api/gamification/recipes/<recipe_id>/complete`

**Logic:**
1. Check if user already completed this recipe (idempotent)
2. Create `RecipeCompletion` record
3. Award base coins + check for Daily Chaos bonus
4. Award creator bonus if applicable
5. Update skill track progress
6. Check if any skill track is now complete

```python
@gamification_bp.post("/recipes/<int:recipe_id>/complete")
@login_required
def complete_recipe(recipe_id):
    """
    User marks a recipe as cooked.
    Returns: {reward, creator_bonus, chaos_bonus}
    """
    user_id = current_user.id

    try:
        # Check if already completed (idempotent)
        existing = supabase_admin.table("recipe_completion")\
            .select("id")\
            .eq("user_id", user_id)\
            .eq("recipe_id", recipe_id)\
            .execute()

        if existing.data:
            return jsonify({"message": "Already completed", "reward": 0}), 200

        # Create completion record
        supabase_admin.table("recipe_completion")\
            .insert({
                "user_id": user_id,
                "recipe_id": recipe_id,
                "has_proof": False
            })\
            .execute()

        # Calculate reward
        base_reward = 10
        bonus = 0

        # Check Daily Chaos Ingredient
        today = date.today().isoformat()
        daily_response = supabase_admin.table("daily_ingredient")\
            .select("*")\
            .eq("date", today)\
            .execute()

        creator_bonus = 0

        if daily_response.data:
            daily = daily_response.data[0]
            ingredient = daily["ingredient"]

            # Check if recipe uses this ingredient
            tag_response = supabase_admin.table("recipe_ingredient_tag")\
                .select("id")\
                .eq("recipe_id", recipe_id)\
                .ilike("ingredient", f"%{ingredient}%")\
                .execute()

            if tag_response.data:
                multiplier = daily["multiplier"]
                bonus = int(base_reward * (multiplier - 1))

        total_reward = base_reward + bonus

        # Award coins to user
        supabase_admin.table("coin_transaction")\
            .insert({
                "user_id": user_id,
                "amount": total_reward,
                "reason": "recipe_completion",
                "metadata": {"recipe_id": recipe_id}
            })\
            .execute()

        # Get recipe details for creator bonus
        recipe_response = supabase_admin.table("recipe")\
            .select("creator_id")\
            .eq("id", recipe_id)\
            .execute()

        if recipe_response.data:
            recipe = recipe_response.data[0]
            if recipe["creator_id"] and recipe["creator_id"] != user_id:
                creator_bonus = 5
                supabase_admin.table("coin_transaction")\
                    .insert({
                        "user_id": recipe["creator_id"],
                        "amount": creator_bonus,
                        "reason": "creator_completion_bonus",
                        "metadata": {
                            "recipe_id": recipe_id,
                            "from_user_id": user_id
                        }
                    })\
                    .execute()

        # Update skill track progress
        tracks_response = supabase_admin.table("skill_track_recipe")\
            .select("track_id")\
            .eq("recipe_id", recipe_id)\
            .execute()

        TRACK_COMPLETION_THRESHOLD = 5

        for track_link in tracks_response.data:
            track_id = track_link["track_id"]

            # Get or create progress
            progress_response = supabase_admin.table("skill_track_progress")\
                .select("*")\
                .eq("user_id", user_id)\
                .eq("track_id", track_id)\
                .execute()

            if not progress_response.data:
                # Create new progress entry
                supabase_admin.table("skill_track_progress")\
                    .insert({
                        "user_id": user_id,
                        "track_id": track_id,
                        "completed_recipes": 1
                    })\
                    .execute()
            else:
                # Increment progress
                progress = progress_response.data[0]
                new_count = progress["completed_recipes"] + 1

                supabase_admin.table("skill_track_progress")\
                    .update({"completed_recipes": new_count})\
                    .eq("user_id", user_id)\
                    .eq("track_id", track_id)\
                    .execute()

                # Check if track is complete
                if new_count == TRACK_COMPLETION_THRESHOLD:
                    supabase_admin.table("skill_track_progress")\
                        .update({"completed_at": datetime.utcnow().isoformat()})\
                        .eq("user_id", user_id)\
                        .eq("track_id", track_id)\
                        .execute()

                    # Award track completion bonus
                    supabase_admin.table("coin_transaction")\
                        .insert({
                            "user_id": user_id,
                            "amount": 50,
                            "reason": "skill_track_completed",
                            "metadata": {"track_id": track_id}
                        })\
                        .execute()

        return jsonify({
            "reward": total_reward,
            "creator_bonus": creator_bonus,
            "chaos_bonus": bonus
        }), 201

    except Exception as e:
        print(f"Error completing recipe: {e}")
        return jsonify({"error": "Failed to complete recipe"}), 500
```

---

## 2.2 Get Recipe Completions (Cooked-It Chain)

**Endpoint:** `GET /api/gamification/recipes/<recipe_id>/completions`

Returns the list of users who have cooked this recipe, in order.

```python
@gamification_bp.get("/recipes/<int:recipe_id>/completions")
def get_recipe_completions(recipe_id):
    """
    Get the "Cooked-It Chain" – users who completed this recipe.
    Returns: {count, users, recipeId}
    """
    try:
        # Get completions with user details (requires a join via Supabase views or RPC)
        # Option 1: Fetch completions and then fetch user data
        completions_response = supabase_admin.table("recipe_completion")\
            .select("user_id, created_at")\
            .eq("recipe_id", recipe_id)\
            .order("created_at", desc=False)\
            .limit(50)\
            .execute()

        data = []
        for completion in completions_response.data:
            user_id = completion["user_id"]
            # Fetch user profile (adjust based on your user table schema)
            user_response = supabase_admin.table("profiles")\
                .select("id, username, avatar_url")\
                .eq("id", user_id)\
                .execute()

            if user_response.data:
                user = user_response.data[0]
                data.append({
                    "userId": user["id"],
                    "username": user["username"],
                    "avatarUrl": user.get("avatar_url"),
                    "createdAt": completion["created_at"]
                })

        return jsonify({
            "count": len(data),
            "users": data,
            "recipeId": recipe_id
        }), 200

    except Exception as e:
        print(f"Error fetching completions: {e}")
        return jsonify({"error": "Failed to fetch completions"}), 500
```

---

## 2.3 Get Daily Chaos Ingredient

**Endpoint:** `GET /api/gamification/daily-ingredient`

Returns today's featured ingredient and multiplier, or `{active: false}` if none exists.

```python
@gamification_bp.get("/daily-ingredient")
def get_daily_ingredient():
    """
    Get today's Chaos Ingredient, if available.
    Returns: {active, ingredient, multiplier, date} or {active: false}
    """
    try:
        today = date.today().isoformat()
        response = supabase_admin.table("daily_ingredient")\
            .select("*")\
            .eq("date", today)\
            .execute()

        if not response.data:
            return jsonify({"active": False}), 200

        daily = response.data[0]
        return jsonify({
            "active": True,
            "ingredient": daily["ingredient"],
            "multiplier": daily["multiplier"],
            "date": daily["date"]
        }), 200

    except Exception as e:
        print(f"Error fetching daily ingredient: {e}")
        return jsonify({"error": "Failed to fetch daily ingredient"}), 500
```

---

## 2.4 Get Skill Tracks + User Progress

**Endpoint:** `GET /api/gamification/skill-tracks`

Returns all skill tracks with the current user's progress.

```python
@gamification_bp.get("/skill-tracks")
@login_required
def get_skill_tracks():
    """
    Get all skill tracks and current user's progress on each.
    Returns: array of {id, slug, name, description, icon, totalRecipes, completedRecipes, completedAt}
    """
    try:
        user_id = current_user.id

        # Get all tracks
        tracks_response = supabase_admin.table("skill_track")\
            .select("*")\
            .order("order", desc=False)\
            .execute()

        # Get user's progress
        progress_response = supabase_admin.table("skill_track_progress")\
            .select("*")\
            .eq("user_id", user_id)\
            .execute()

        progress_map = {p["track_id"]: p for p in progress_response.data}

        data = []
        for track in tracks_response.data:
            track_id = track["id"]

            # Count total recipes in track
            recipe_count_response = supabase_admin.table("skill_track_recipe")\
                .select("id", count="exact")\
                .eq("track_id", track_id)\
                .execute()

            total_recipes = recipe_count_response.count or 0

            progress = progress_map.get(track_id)
            data.append({
                "id": track_id,
                "slug": track["slug"],
                "name": track["name"],
                "description": track.get("description"),
                "icon": track.get("icon"),
                "totalRecipes": total_recipes,
                "completedRecipes": progress["completed_recipes"] if progress else 0,
                "completedAt": progress["completed_at"] if (progress and progress.get("completed_at")) else None
            })

        return jsonify(data), 200

    except Exception as e:
        print(f"Error fetching skill tracks: {e}")
        return jsonify({"error": "Failed to fetch skill tracks"}), 500
```

---

## 2.5 (Optional) Join Questline

**Endpoint:** `POST /api/gamification/questlines/<questline_id>/join`

Enrolls user in a questline (must follow creator).

```python
@gamification_bp.post("/questlines/<int:questline_id>/join")
@login_required
def join_questline(questline_id):
    """
    Enroll in a questline. User must follow the creator.
    Returns: {status: "in_progress" | "completed"}
    """
    try:
        user_id = current_user.id

        # Get questline
        quest_response = supabase_admin.table("questline")\
            .select("creator_id")\
            .eq("id", questline_id)\
            .execute()

        if not quest_response.data:
            return jsonify({"error": "Questline not found"}), 404

        creator_id = quest_response.data[0]["creator_id"]

        # Check if user follows creator
        follow_response = supabase_admin.table("user_follow")\
            .select("id")\
            .eq("follower_id", user_id)\
            .eq("followee_id", creator_id)\
            .execute()

        if not follow_response.data:
            return jsonify({"error": "Must follow creator to join"}), 403

        # Check if already enrolled
        enrollment_response = supabase_admin.table("questline_enrollment")\
            .select("status")\
            .eq("questline_id", questline_id)\
            .eq("user_id", user_id)\
            .execute()

        if enrollment_response.data:
            return jsonify({"status": enrollment_response.data[0]["status"]}), 200

        # Create enrollment
        supabase_admin.table("questline_enrollment")\
            .insert({
                "questline_id": questline_id,
                "user_id": user_id,
                "status": "in_progress",
                "current_step": 0
            })\
            .execute()

        return jsonify({"status": "in_progress"}), 201

    except Exception as e:
        print(f"Error joining questline: {e}")
        return jsonify({"error": "Failed to join questline"}), 500
```

**Note:** Quest progress can be updated in `complete_recipe()` by checking if the recipe is the next step in any active quest.

---

# Part 3: Frontend Types (TypeScript)

## File: `src/types/gamification.ts`

```typescript
// User in the Cooked-It chain
export interface RecipeCompletionUser {
  userId: number;
  username: string;
  avatarUrl?: string;
  createdAt: string;
}

// Response for recipe completions endpoint
export interface RecipeCompletionResponse {
  count: number;
  users: RecipeCompletionUser[];
  recipeId: number;
}

// Daily Chaos Ingredient
export interface DailyIngredient {
  active: boolean;
  ingredient?: string;
  multiplier?: number;
  date?: string;
}

// Skill track as sent from backend
export interface SkillTrackClient {
  id: number;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  totalRecipes: number;
  completedRecipes: number;
  completedAt?: string | null;
}

// Complete reward response
export interface CompleteRecipeResponse {
  reward: number;
  creator_bonus: number;
  chaos_bonus: number;
}
```

---

# Part 4: Zustand Store (Gamification State)

## File: `src/stores/useGamificationStore.ts`

```typescript
import create from "zustand";
import axios from "axios";
import {
  DailyIngredient,
  SkillTrackClient,
  RecipeCompletionResponse,
  CompleteRecipeResponse,
} from "../types/gamification";

interface GamificationState {
  // State
  dailyIngredient: DailyIngredient | null;
  skillTracks: SkillTrackClient[];
  completionsByRecipe: Record<number, RecipeCompletionResponse>;
  isLoading: boolean;

  // Actions
  fetchDailyIngredient: () => Promise<void>;
  fetchSkillTracks: () => Promise<void>;
  fetchRecipeCompletions: (recipeId: number) => Promise<void>;
  completeRecipe: (recipeId: number) => Promise<CompleteRecipeResponse>;
}

export const useGamificationStore = create<GamificationState>((set, get) => ({
  dailyIngredient: null,
  skillTracks: [],
  completionsByRecipe: {},
  isLoading: false,

  async fetchDailyIngredient() {
    try {
      set({ isLoading: true });
      const res = await axios.get<DailyIngredient>(
        "/api/gamification/daily-ingredient"
      );
      set({ dailyIngredient: res.data });
    } catch (error) {
      console.error("Error fetching daily ingredient:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  async fetchSkillTracks() {
    try {
      set({ isLoading: true });
      const res = await axios.get<SkillTrackClient[]>(
        "/api/gamification/skill-tracks"
      );
      set({ skillTracks: res.data });
    } catch (error) {
      console.error("Error fetching skill tracks:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  async fetchRecipeCompletions(recipeId) {
    try {
      set({ isLoading: true });
      const res = await axios.get<RecipeCompletionResponse>(
        `/api/gamification/recipes/${recipeId}/completions`
      );
      set((state) => ({
        completionsByRecipe: {
          ...state.completionsByRecipe,
          [recipeId]: res.data,
        },
      }));
    } catch (error) {
      console.error(`Error fetching completions for recipe ${recipeId}:`, error);
    } finally {
      set({ isLoading: false });
    }
  },

  async completeRecipe(recipeId) {
    try {
      set({ isLoading: true });
      const res = await axios.post<CompleteRecipeResponse>(
        `/api/gamification/recipes/${recipeId}/complete`
      );
      
      // Refresh data
      await Promise.all([
        get().fetchRecipeCompletions(recipeId),
        get().fetchSkillTracks(),
      ]);

      return res.data;
    } catch (error) {
      console.error(`Error completing recipe ${recipeId}:`, error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
```

**Setup Axios Interceptor** (if not already done):

```typescript
// src/api/axiosConfig.ts
import axios from "axios";

export function setupAxios() {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("authToken"); // or wherever you store JWT
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

// Call this in your app initialization:
// setupAxios();
```

---

# Part 5: React Components + Styling

## 5.1 Recipe Actions Component (Cooked-It Chain)

**File:** `src/components/RecipeDetail/RecipeActions.tsx`

```typescript
import React, { useEffect, useState } from "react";
import { useGamificationStore } from "../../stores/useGamificationStore";
import styles from "./RecipeActions.module.css";

interface Props {
  recipeId: number;
  ingredients: string[]; // List of ingredient strings from the recipe
}

export const RecipeActions: React.FC<Props> = ({ recipeId, ingredients }) => {
  const {
    completeRecipe,
    fetchRecipeCompletions,
    fetchDailyIngredient,
    completionsByRecipe,
    dailyIngredient,
  } = useGamificationStore();

  const [isCompleting, setIsCompleting] = useState(false);
  const [showRewardToast, setShowRewardToast] = useState(false);
  const [rewardAmount, setRewardAmount] = useState(0);

  const completionData = completionsByRecipe[recipeId];

  useEffect(() => {
    fetchDailyIngredient();
    fetchRecipeCompletions(recipeId);
  }, [recipeId, fetchRecipeCompletions, fetchDailyIngredient]);

  // Check if this recipe uses today's chaos ingredient
  const isChaosRecipe =
    dailyIngredient?.active &&
    dailyIngredient.ingredient &&
    ingredients
      .map((i) => i.toLowerCase())
      .includes(dailyIngredient.ingredient.toLowerCase());

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const response = await completeRecipe(recipeId);
      setRewardAmount(response.reward);
      setShowRewardToast(true);
      setTimeout(() => setShowRewardToast(false), 3000);
    } catch (error) {
      console.error("Failed to complete recipe:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={styles.container}>
      {isChaosRecipe && dailyIngredient && (
        <div className={styles.chaosBanner}>
          ⚡ Uses today&apos;s Chaos Ingredient:{" "}
          <strong>{dailyIngredient.ingredient}</strong> –{" "}
          <span className={styles.multiplier}>
            {dailyIngredient.multiplier}x coins
          </span>
        </div>
      )}

      <button
        className={styles.cookedButton}
        onClick={handleComplete}
        disabled={isCompleting}
      >
        {isCompleting ? "Submitting..." : "I cooked this 🎉"}
      </button>

      {showRewardToast && (
        <div className={styles.rewardToast}>
          +{rewardAmount} coins! 🏆
        </div>
      )}

      {completionData && (
        <div className={styles.chain}>
          <span className={styles.count}>
            {completionData.count} people cooked this
          </span>
          <div className={styles.avatars}>
            {completionData.users.map((u) => (
              <div key={u.userId} className={styles.avatarWrapper}>
                <img
                  src={u.avatarUrl || "/default-avatar.png"}
                  alt={u.username}
                  title={u.username}
                  className={styles.avatar}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

**File:** `src/components/RecipeDetail/RecipeActions.module.css`

```css
.container {
  margin-top: 1rem;
}

.chaosBanner {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.1));
  border-left: 4px solid #ffd700;
  font-weight: 500;
}

.multiplier {
  font-weight: 700;
  color: #ff6b35;
}

.cookedButton {
  padding: 0.8rem 1.5rem;
  border-radius: 24px;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.cookedButton:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
}

.cookedButton:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.rewardToast {
  margin-top: 0.5rem;
  padding: 0.75rem 1rem;
  background: #4caf50;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chain {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.count {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.avatars {
  display: flex;
  align-items: center;
}

.avatarWrapper {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-left: -8px;
  border: 2.5px solid white;
  background: #f0f0f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatarWrapper:first-child {
  margin-left: 0;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
```

---

## 5.2 Skill Tracks Overview Page

**File:** `src/pages/SkillTracksPage.tsx`

```typescript
import React, { useEffect } from "react";
import { useGamificationStore } from "../stores/useGamificationStore";
import styles from "./SkillTracksPage.module.css";

export const SkillTracksPage: React.FC = () => {
  const { skillTracks, fetchSkillTracks, isLoading } = useGamificationStore();

  useEffect(() => {
    fetchSkillTracks();
  }, [fetchSkillTracks]);

  if (isLoading && skillTracks.length === 0) {
    return <div className={styles.container}><p>Loading tracks...</p></div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Skill Tracks</h1>
      <p className={styles.subtitle}>Complete recipe collections to unlock badges</p>

      <div className={styles.grid}>
        {skillTracks.map((track) => {
          const progress =
            track.totalRecipes === 0
              ? 0
              : Math.round((track.completedRecipes / track.totalRecipes) * 100);

          const isComplete = track.completedAt !== null && track.completedAt !== undefined;

          return (
            <div key={track.id} className={`${styles.card} ${isComplete ? styles.completed : ""}`}>
              <div className={styles.header}>
                <span className={styles.icon}>{track.icon ?? "🍳"}</span>
                <div className={styles.headerText}>
                  <h2>{track.name}</h2>
                  {track.description && <p>{track.description}</p>}
                </div>
              </div>

              <div className={styles.progressSection}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className={styles.progressLabel}>
                  {track.completedRecipes}/{track.totalRecipes} recipes
                </span>
              </div>

              {isComplete && (
                <div className={styles.badge}>
                  ✅ Completed
                </div>
              )}
            </div>
          );
        })}
      </div>

      {skillTracks.length === 0 && !isLoading && (
        <p className={styles.empty}>No skill tracks available yet.</p>
      )}
    </div>
  );
};
```

**File:** `src/pages/SkillTracksPage.module.css`

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
}

.subtitle {
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.card {
  padding: 1.5rem;
  border-radius: 12px;
  border: 2px solid #e0e0e0;
  background: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  transform: translateY(-4px);
}

.card.completed {
  border-color: #4caf50;
  background: rgba(76, 175, 80, 0.05);
}

.header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.headerText h2 {
  font-size: 1.5rem;
  margin: 0 0 0.25rem 0;
  color: #1a1a1a;
}

.headerText p {
  font-size: 0.9rem;
  color: #888;
  margin: 0;
}

.progressSection {
  margin-bottom: 1rem;
}

.progressBar {
  height: 8px;
  border-radius: 4px;
  background: #e0e0e0;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progressFill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.4s ease;
}

.progressLabel {
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
}

.badge {
  display: inline-block;
  padding: 0.5rem 0.75rem;
  background: #4caf50;
  color: white;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
}

.empty {
  text-align: center;
  color: #999;
  padding: 2rem;
}
```

---

## 5.3 Integrate RecipeActions into Recipe Detail Page

In your existing recipe detail page, simply import and use the component:

```typescript
// pages/RecipeDetailPage.tsx
import { RecipeActions } from "../components/RecipeDetail/RecipeActions";

export const RecipeDetailPage: React.FC<{recipeId: number}> = ({ recipeId }) => {
  // ... your existing recipe fetching logic
  const recipe = /* fetch recipe data */;

  return (
    <div>
      {/* Existing recipe content */}
      <h1>{recipe.name}</h1>
      <img src={recipe.image} alt={recipe.name} />
      <p>{recipe.description}</p>

      {/* New gamification section */}
      <RecipeActions 
        recipeId={recipeId} 
        ingredients={recipe.ingredients}
      />
    </div>
  );
};
```

---

## 5.4 Add Skill Tracks to Navigation

Add a route and link:

```typescript
// src/App.tsx or your router setup
import { SkillTracksPage } from "./pages/SkillTracksPage";

const router = createBrowserRouter([
  // ... existing routes
  {
    path: "/tracks",
    element: <SkillTracksPage />,
  },
]);
```

In your navigation:

```tsx
<nav>
  {/* ... other nav items */}
  <Link to="/tracks">Skill Tracks</Link>
</nav>
```

---

# Part 6: 2-Day Implementation Roadmap

## Day 1: Backend + Store Setup

### Morning (2-3 hours)
- [ ] Create all SQLAlchemy models
  - `RecipeCompletion`, `CoinTransaction`, `DailyIngredient`, `RecipeIngredientTag`
  - `SkillTrack`, `SkillTrackRecipe`, `SkillTrackProgress`
- [ ] Run migrations to create tables
- [ ] Seed mock data:
  - 3–5 skill tracks (e.g., "Microwave Master", "Budget Chef")
  - 5–10 recipes with ingredient tags
  - 5 days of daily ingredients

### Afternoon (2-3 hours)
- [ ] Implement Flask endpoints:
  - `POST /api/gamification/recipes/:id/complete`
  - `GET /api/gamification/recipes/:id/completions`
  - `GET /api/gamification/daily-ingredient`
  - `GET /api/gamification/skill-tracks`
- [ ] Test endpoints with Postman or curl
- [ ] Create Zustand store (`useGamificationStore`)
- [ ] Set up Axios interceptor for JWT

---

## Day 2: Frontend + UI + Polish

### Morning (2-3 hours)
- [ ] Build `RecipeActions` component
- [ ] Wire into existing recipe detail page
- [ ] Implement `SkillTracksPage`
- [ ] Add route + navigation link for `/tracks`

### Afternoon (2-3 hours)
- [ ] Test flow end-to-end:
  - Fetch daily ingredient
  - Complete a recipe
  - Check reward toast appears
  - Verify skill track progress updates
  - Verify coin rewards in transaction history (if UI exists)
- [ ] Polish CSS:
  - Responsive design for mobile
  - Hover/active states
  - Loading states
- [ ] (Optional) Implement questline models + basic join endpoint

### Final Stretch (30 min)
- [ ] Add global "Today's Chaos Ingredient" banner in header
- [ ] Seed additional test data if needed
- [ ] Document any custom configuration (e.g., `TRACK_COMPLETION_THRESHOLD`)

---

# Part 7: Optional Enhancements (Post-MVP)

These can be added after the 2-day sprint:

1. **Coin Display on Profile**
   - Show user's total coins: `SUM(coin_transaction.amount WHERE user_id = X)`
   - Display coin history (recent transactions)

2. **Creator Stats**
   - Show creators how many times their recipes were cooked
   - Total creator bonus coins earned

3. **Leaderboards**
   - Global: Most coins earned this month
   - Per-track: Best performers in each skill track

4. **Questlines UI**
   - List all available questlines
   - Show enrollment + progress if user is enrolled
   - Implement visual quest steps

5. **Follow System**
   - Add follow button on creator profiles
   - Show follower count

6. **Achievements / Badges**
   - Award special one-time badges for milestones
   - (E.g., "First 10 Recipes", "Track Master" for completing 3 tracks)

---

# Summary

This spec provides everything needed for Claude Code or another agent to:
1. Create Supabase SQL tables via the dashboard or SQL editor
2. Build Flask route handlers with Supabase client calls
3. Create TypeScript types and Zustand store
4. Implement React components with CSS Modules
5. Integrate into existing Plated with Friends codebase

Hand this document to your codegen agent along with:
- Your existing project structure/files (if you want it adapted to your style)
- Any API route naming conventions
- Your preferred file organization
- Your Supabase `profiles` table schema (used for user data lookups)

The MVP can ship in ~2 days with the core features. Optional questlines can be added if time permits.
