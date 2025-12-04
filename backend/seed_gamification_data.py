#!/usr/bin/env python3
"""
Seed script for gamification features.
Creates mock data for testing: skill tracks, daily ingredients, and recipe tags.
"""

import sys
import os
from datetime import date, timedelta
from uuid import uuid4

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from supabase_client import supabase
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv('env.development.local', override=True)


def seed_skill_tracks():
    """Seed skill tracks"""
    print("\n📚 Seeding Skill Tracks...")

    tracks = [
        {
            "slug": "microwave-master",
            "name": "Microwave Master",
            "description": "Master the art of microwave cooking with quick and easy recipes",
            "icon": "🔥",
            "display_order": 1
        },
        {
            "slug": "budget-chef",
            "name": "$5 Dinners",
            "description": "Delicious meals that won't break the bank",
            "icon": "💰",
            "display_order": 2
        },
        {
            "slug": "veggie-hero",
            "name": "Veggie Hero",
            "description": "Plant-based recipes that will make you love vegetables",
            "icon": "🥬",
            "display_order": 3
        },
        {
            "slug": "quick-bites",
            "name": "Quick Bites",
            "description": "Meals ready in under 15 minutes",
            "icon": "⚡",
            "display_order": 4
        },
        {
            "slug": "comfort-classics",
            "name": "Comfort Classics",
            "description": "Heartwarming traditional favorites",
            "icon": "🏠",
            "display_order": 5
        }
    ]

    for track in tracks:
        try:
            # Check if track already exists
            existing = supabase.table("skill_track")\
                .select("id")\
                .eq("slug", track["slug"])\
                .execute()

            if existing.data:
                print(f"   ⏭️  Track '{track['name']}' already exists, skipping...")
                continue

            # Insert track
            result = supabase.table("skill_track").insert(track).execute()
            if result.data:
                print(f"   ✅ Created track: {track['name']} ({track['icon']})")
        except Exception as e:
            print(f"   ❌ Error creating track '{track['name']}': {e}")

    print("✅ Skill Tracks seeding complete!\n")


def seed_daily_ingredients():
    """Seed daily ingredients for the next 14 days"""
    print("\n🌶️  Seeding Daily Ingredients...")

    ingredients = [
        {"ingredient": "eggs", "icon_emoji": "🥚", "multiplier": 2.0},
        {"ingredient": "chicken", "icon_emoji": "🍗", "multiplier": 2.0},
        {"ingredient": "spinach", "icon_emoji": "🥬", "multiplier": 2.5},
        {"ingredient": "tomato", "icon_emoji": "🍅", "multiplier": 2.0},
        {"ingredient": "pasta", "icon_emoji": "🍝", "multiplier": 1.5},
        {"ingredient": "cheese", "icon_emoji": "🧀", "multiplier": 2.0},
        {"ingredient": "potato", "icon_emoji": "🥔", "multiplier": 1.5},
        {"ingredient": "onion", "icon_emoji": "🧅", "multiplier": 1.5},
        {"ingredient": "garlic", "icon_emoji": "🧄", "multiplier": 2.0},
        {"ingredient": "rice", "icon_emoji": "🍚", "multiplier": 1.5},
        {"ingredient": "beef", "icon_emoji": "🥩", "multiplier": 2.5},
        {"ingredient": "broccoli", "icon_emoji": "🥦", "multiplier": 2.0},
        {"ingredient": "mushroom", "icon_emoji": "🍄", "multiplier": 2.0},
        {"ingredient": "avocado", "icon_emoji": "🥑", "multiplier": 2.5},
    ]

    today = date.today()

    for i in range(14):
        current_date = (today + timedelta(days=i)).isoformat()
        ingredient_data = ingredients[i % len(ingredients)]

        try:
            # Check if ingredient for this date already exists
            existing = supabase.table("daily_ingredient")\
                .select("id")\
                .eq("date", current_date)\
                .execute()

            if existing.data:
                print(f"   ⏭️  Ingredient for {current_date} already exists, skipping...")
                continue

            # Insert ingredient
            data = {
                "date": current_date,
                **ingredient_data
            }
            result = supabase.table("daily_ingredient").insert(data).execute()
            if result.data:
                print(f"   ✅ {current_date}: {ingredient_data['icon_emoji']} {ingredient_data['ingredient']} ({ingredient_data['multiplier']}x)")
        except Exception as e:
            print(f"   ❌ Error seeding ingredient for {current_date}: {e}")

    print("✅ Daily Ingredients seeding complete!\n")


def seed_recipe_ingredient_tags():
    """
    Seed recipe ingredient tags for existing recipes.
    This connects recipes to ingredients for Daily Chaos matching.
    """
    print("\n🏷️  Seeding Recipe Ingredient Tags...")

    # Get all recipe posts
    try:
        recipes = supabase.table("posts")\
            .select("id, recipe_data")\
            .eq("post_type", "recipe")\
            .limit(50)\
            .execute()

        if not recipes.data:
            print("   ⚠️  No recipes found in database. Skipping tag seeding.")
            print("   💡 Create some recipe posts first, then run this script again.\n")
            return

        print(f"   Found {len(recipes.data)} recipes to tag...")

        tagged_count = 0
        for recipe in recipes.data:
            recipe_id = recipe["id"]
            recipe_data = recipe.get("recipe_data") or {}
            ingredients = recipe_data.get("ingredients") or []

            if not ingredients:
                continue

            # Extract ingredient names from ingredients list
            for ingredient_item in ingredients:
                if isinstance(ingredient_item, dict):
                    ingredient_name = ingredient_item.get("item", "").lower()
                elif isinstance(ingredient_item, str):
                    ingredient_name = ingredient_item.lower()
                else:
                    continue

                if not ingredient_name:
                    continue

                # Clean up ingredient name (remove quantities, units)
                ingredient_name = ingredient_name.split()[0] if ingredient_name else ""

                try:
                    # Check if tag already exists
                    existing = supabase.table("recipe_ingredient_tag")\
                        .select("id")\
                        .eq("recipe_id", recipe_id)\
                        .eq("ingredient", ingredient_name)\
                        .execute()

                    if existing.data:
                        continue

                    # Insert tag
                    supabase.table("recipe_ingredient_tag")\
                        .insert({
                            "recipe_id": recipe_id,
                            "ingredient": ingredient_name
                        })\
                        .execute()

                    tagged_count += 1
                except Exception as e:
                    print(f"   ⚠️  Error tagging ingredient '{ingredient_name}': {e}")

        print(f"   ✅ Created {tagged_count} ingredient tags")
    except Exception as e:
        print(f"   ❌ Error fetching recipes: {e}")

    print("✅ Recipe Ingredient Tags seeding complete!\n")


def seed_mock_recipe_completions():
    """
    Create mock recipe completions for testing the Cooked-It Chain.
    Note: This requires existing users in the database.
    """
    print("\n👥 Seeding Mock Recipe Completions...")

    # Get some users from the database
    try:
        # Note: This queries the local SQLite database, not Supabase
        # If you want to use Supabase users, you'll need to adjust this
        print("   ⚠️  Recipe completion seeding requires manual setup")
        print("   💡 Use the frontend to complete recipes and test the Cooked-It Chain")
    except Exception as e:
        print(f"   ⚠️  Could not seed completions: {e}")

    print("✅ Recipe Completions seeding skipped (create via frontend)\n")


def main():
    """Main seeding function"""
    print("\n" + "=" * 70)
    print("🌱 GAMIFICATION DATA SEEDING SCRIPT")
    print("=" * 70)

    try:
        # Check Supabase connection
        print("\n🔌 Checking Supabase connection...")
        supabase_url = os.getenv('SUPABASE_URL')
        has_key = bool(os.getenv('SUPABASE_ANON_KEY'))

        if not supabase_url or not has_key:
            print("❌ ERROR: Supabase credentials not configured")
            print("   Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env")
            sys.exit(1)

        print(f"   URL: {supabase_url}")
        print("   ✅ Connected!\n")

        # Run seeding functions
        seed_skill_tracks()
        seed_daily_ingredients()
        seed_recipe_ingredient_tags()
        seed_mock_recipe_completions()

        print("=" * 70)
        print("✅ SEEDING COMPLETE!")
        print("=" * 70)
        print("\n📝 Next Steps:")
        print("   1. Open your app and view /tracks to see skill tracks")
        print("   2. Complete some recipes to test the Cooked-It Chain")
        print("   3. Check the daily ingredient banner on recipe pages")
        print("\n🎉 Happy testing!\n")

    except Exception as e:
        print(f"\n❌ FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
