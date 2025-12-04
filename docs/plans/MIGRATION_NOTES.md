# Supabase Migration Notes

## What Changed

The `PLATED_GAMIFICATION_SPEC.md` has been completely refactored to use **Supabase directly** instead of SQLAlchemy ORM.

### Key Differences

#### 1. **Data Models**
- **Before**: Python class definitions with SQLAlchemy decorators
- **After**: Pure SQL table definitions to run in Supabase SQL Editor

**Example:**
```python
# Old (SQLAlchemy)
class RecipeCompletion(db.Model):
    __tablename__ = "recipe_completion"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    # ...

# New (Supabase SQL)
CREATE TABLE recipe_completion (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    # ...
);
```

#### 2. **Flask Routes**
- **Before**: ORM query methods (`.query.filter_by()`, `.first()`, etc.)
- **After**: Supabase Python client calls (`.table().select().eq().execute()`)

**Example:**
```python
# Old (SQLAlchemy)
existing = RecipeCompletion.query.filter_by(
    user_id=user_id, recipe_id=recipe_id
).first()

# New (Supabase)
existing = supabase_admin.table("recipe_completion")\
    .select("id")\
    .eq("user_id", user_id)\
    .eq("recipe_id", recipe_id)\
    .execute()

if existing.data:
    # record exists
```

#### 3. **Configuration**
- **Before**: SQLAlchemy connection string in app config
- **After**: Supabase credentials (URL + Service Key for admin operations)

```python
# config.py
from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
```

#### 4. **Data Types**
- User IDs are now **UUID** (Supabase auth.users format) instead of Integer
- Timestamps use ISO 8601 string format instead of Python datetime objects
- JSON storage uses native JSONB type

---

## Implementation Checklist

### Backend Setup
- [ ] Install `supabase-py`: `pip install supabase`
- [ ] Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` to `.env`
- [ ] Copy SQL from Part 1 into Supabase SQL Editor and run all `CREATE TABLE` statements
- [ ] Copy Flask routes from Part 2 into `routes/gamification.py`
- [ ] Update imports in `app.py` to register the blueprint

### Frontend Setup
- [ ] Copy types from Part 3 into `src/types/gamification.ts`
- [ ] Copy Zustand store from Part 4 into `src/stores/useGamificationStore.ts`
- [ ] Implement components from Part 5 into your React app
- [ ] Add route for `/tracks` page to your router

### Seeding Data
- [ ] Create 3-5 skill tracks in the `skill_track` table
- [ ] Add 5-10 recipes to `skill_track_recipe` (maps recipes to tracks)
- [ ] Add ingredient tags to `recipe_ingredient_tag` (for chaos ingredient matching)
- [ ] Insert 5 days of daily ingredients into `daily_ingredient`

---

## Important Notes

### UUID vs Integer
Supabase uses **UUID** for `auth.users.id`. Make sure your code handles UUIDs, not integers:
```python
# ✅ Correct
user_id: str  # UUID as string

# ❌ Wrong
user_id: int  # Will not match Supabase auth.users
```

### User Profiles Table
The code assumes a `profiles` table exists with user metadata:
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username VARCHAR(255),
    avatar_url TEXT,
    -- other fields
);
```

If your user data is structured differently, adjust the `get_recipe_completions` endpoint to fetch from your actual user table.

### Timestamp Format
Supabase returns timestamps as ISO 8601 strings. The frontend expects:
```typescript
"createdAt": "2025-12-03T10:30:45.123456"
```

No conversion needed in Flask—just return `response.data` directly.

### Error Handling
All endpoints now include try-except blocks. The errors are logged to stdout. For production, consider:
- Logging to a service (Sentry, LogRocket)
- Returning more granular error messages
- Adding rate limiting

---

## Running the Seed Script

To populate demo data quickly:

```python
# scripts/seed_gamification.py
from supabase import create_client
import os

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

# Seed skill tracks
supabase.table("skill_track").insert([
    {"slug": "microwave-master", "name": "Microwave Master", "icon": "🔥", "order": 0},
    {"slug": "5-dollar-chef", "name": "$5 Dinners", "icon": "💰", "order": 1},
    {"slug": "veggie-hero", "name": "Veggie Hero", "icon": "🥬", "order": 2},
]).execute()

# Seed daily ingredients
from datetime import date, timedelta
today = date.today()
for i in range(5):
    current_date = (today + timedelta(days=i)).isoformat()
    supabase.table("daily_ingredient").insert({
        "date": current_date,
        "ingredient": ["eggs", "spinach", "tomato", "garlic", "onion"][i],
        "multiplier": 2.0
    }).execute()

print("✅ Seed complete!")
```

Run with:
```bash
python scripts/seed_gamification.py
```

---

## Testing the Endpoints

Use `curl` or Postman to test:

```bash
# Complete a recipe
curl -X POST "http://localhost:5000/api/gamification/recipes/1/complete" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get daily ingredient
curl "http://localhost:5000/api/gamification/daily-ingredient"

# Get skill tracks
curl "http://localhost:5000/api/gamification/skill-tracks" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Performance Considerations

### Indexes
The SQL includes indexes on:
- `recipe_id` (for quick lookups by recipe)
- `user_id` (for quick lookups by user)
- `track_id` (for skill track queries)
- `created_at DESC` (for ordering completions)

These are created automatically in the `CREATE TABLE` statements.

### N+1 Queries
The `get_recipe_completions` endpoint fetches user profiles one-by-one. For large completion lists, consider:
- Using a Supabase view to join `recipe_completion` and `profiles`
- Batching profile fetches with `.select()` filters

### Realtime (Optional)
Supabase supports realtime subscriptions. You could emit notifications when:
- A recipe is completed
- A skill track is finished
- A daily ingredient changes

Example (frontend):
```typescript
supabase
  .channel('recipe_completions')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'recipe_completion' },
    (payload) => console.log('New completion!', payload)
  )
  .subscribe()
```

---

## Next Steps

1. **Run the SQL** in Supabase dashboard to create tables
2. **Update Flask app** with new routes and config
3. **Seed mock data** using the script above
4. **Test endpoints** with curl/Postman
5. **Implement frontend** components
6. **Deploy to production** (remember to use service key only in backend, anon key in frontend)

---

## Troubleshooting

### "Cannot find column user_id of type UUID"
- Your Supabase auth setup may use a different ID type. Check `auth.users` schema.
- Update the SQL if needed.

### "Row-level security (RLS) denied this operation"
- Supabase RLS policies may block inserts. Either:
  - Disable RLS for testing (not recommended for production)
  - Add proper RLS policies for your service key
  - Use a role with admin privileges

### "Connection refused"
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set correctly
- Check Supabase project is running

### Frontend Axios 401 Unauthorized
- Ensure JWT token is being passed correctly in the `Authorization: Bearer` header
- Check that your Supabase JWT is valid and not expired

---

Happy shipping! 🚀
