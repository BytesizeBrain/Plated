#!/usr/bin/env python3
"""
Check current Supabase schema and verify gamification tables.
This script connects to Supabase and lists all tables in the public schema.
"""

import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from supabase_client import supabase
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
load_dotenv('env.development.local', override=True)

def check_schema():
    """Check current Supabase schema"""
    print("=" * 80)
    print("SUPABASE SCHEMA CHECK")
    print("=" * 80)

    # Check connection
    print("\n🔌 Checking Supabase connection...")
    supabase_url = os.getenv('SUPABASE_URL')
    has_key = bool(os.getenv('SUPABASE_ANON_KEY'))

    print(f"   URL: {supabase_url}")
    print(f"   Key configured: {has_key}")

    if not supabase_url or not has_key:
        print("\n❌ ERROR: Supabase credentials not found in environment")
        return

    print("\n✅ Supabase client initialized\n")

    # List of gamification tables we're looking for
    gamification_tables = {
        # Existing tables
        'user_gamification': 'Basic user stats (XP, level, coins, streak)',
        'badges': 'Available badges',
        'user_badges': 'User earned badges',
        'challenges': 'Available challenges',
        'user_challenges': 'User challenge progress',

        # New tables from spec
        'recipe_completion': '🆕 Recipe completion tracking (Cooked-It Chain)',
        'coin_transaction': '🆕 Coin transaction log',
        'daily_ingredient': '🆕 Daily Chaos Ingredient',
        'recipe_ingredient_tag': '🆕 Recipe ingredient mapping',
        'skill_track': '🆕 Skill track definitions',
        'skill_track_recipe': '🆕 Skill track recipe mapping',
        'skill_track_progress': '🆕 User skill track progress',
    }

    print("📋 CHECKING GAMIFICATION TABLES")
    print("-" * 80)

    existing_tables = []
    missing_tables = []

    for table_name, description in gamification_tables.items():
        try:
            # Try to query the table (limit 0 to avoid fetching data)
            result = supabase.table(table_name).select("*").limit(0).execute()
            status = "✅ EXISTS"
            existing_tables.append(table_name)
        except Exception as e:
            status = "❌ MISSING"
            missing_tables.append(table_name)

        print(f"{status:12} | {table_name:30} | {description}")

    print("\n" + "=" * 80)
    print(f"SUMMARY: {len(existing_tables)}/{len(gamification_tables)} tables exist")
    print("=" * 80)

    if missing_tables:
        print(f"\n⚠️  MISSING TABLES ({len(missing_tables)}):")
        for table in missing_tables:
            print(f"   - {table}")
        print("\n📝 To create missing tables:")
        print("   1. Open Supabase Dashboard → SQL Editor")
        print("   2. Open file: docs/database/gamification_enhancement_migration.sql")
        print("   3. Paste and run the SQL")
    else:
        print("\n✅ All gamification tables exist!")

    # Check for sample data in existing tables
    if 'skill_track' in existing_tables:
        print("\n" + "=" * 80)
        print("SAMPLE DATA CHECK")
        print("=" * 80)

        try:
            tracks = supabase.table('skill_track').select('slug, name, icon').execute()
            print(f"\n🎯 Skill Tracks ({len(tracks.data)} total):")
            for track in tracks.data[:5]:
                print(f"   {track.get('icon', '📦')} {track['name']} ({track['slug']})")
            if len(tracks.data) > 5:
                print(f"   ... and {len(tracks.data) - 5} more")
        except Exception as e:
            print(f"   ⚠️  Could not fetch skill tracks: {e}")

        try:
            daily = supabase.table('daily_ingredient').select('date, ingredient, multiplier, icon_emoji').order('date').execute()
            print(f"\n🌶️  Daily Ingredients ({len(daily.data)} total):")
            for ing in daily.data[:7]:
                print(f"   {ing['date']}: {ing.get('icon_emoji', '🍽️')} {ing['ingredient']} ({ing['multiplier']}x)")
        except Exception as e:
            print(f"   ⚠️  Could not fetch daily ingredients: {e}")

    # Check user_gamification structure
    if 'user_gamification' in existing_tables:
        print("\n" + "=" * 80)
        print("USER_GAMIFICATION COLUMNS")
        print("=" * 80)

        # We can't directly query column info, but we can try to select all columns
        try:
            result = supabase.table('user_gamification').select('*').limit(1).execute()
            if result.data:
                columns = list(result.data[0].keys())
                print(f"✅ Columns found ({len(columns)}):")
                for col in sorted(columns):
                    print(f"   - {col}")

                # Check for freeze_tokens
                if 'freeze_tokens' not in columns:
                    print("\n⚠️  NOTE: 'freeze_tokens' column missing")
                    print("   This will be added by the migration script")
            else:
                print("ℹ️  No data in user_gamification yet (table structure unknown)")
        except Exception as e:
            print(f"   ⚠️  Could not check columns: {e}")

    print("\n" + "=" * 80)

if __name__ == "__main__":
    try:
        check_schema()
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
