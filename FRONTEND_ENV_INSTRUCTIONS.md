# Frontend .env File Setup

## ✅ Fixes Applied:

1. ✅ **PostCard.tsx** - Added null checks for `likes_count` and `views_count`
2. ✅ **api.ts** - Fixed endpoint from `/feed` to `/api/feed`  
3. ✅ **api.ts** - Added data transformation to convert backend format to frontend format

## ⚠️ Manual Action Required:

**Create `.env` file in `frontend/Plated/` directory:**

### Step 1: Create the file

```powershell
cd frontend/Plated
New-Item .env -ItemType File
```

### Step 2: Add this content to `frontend/Plated/.env`:

```env
# Local Development Environment Variables
VITE_API_BASE_URL=http://localhost:5000
VITE_AUTH_MODE=oauth
```

### Step 3: Restart frontend dev server

```powershell
# Stop current frontend (Ctrl+C in terminal)
# Then restart:
npm run dev
```

---

## What Each Fix Does:

### Fix 1: PostCard null safety
**Before:** `post.likes_count.toLocaleString()` → crashes if undefined  
**After:** `(post.likes_count || 0).toLocaleString()` → defaults to 0

### Fix 2: API endpoint correction
**Before:** Calling `/feed`  
**After:** Calling `/api/feed` (matches backend blueprint prefix)

### Fix 3: Data transformation
Backend returns:
```json
{
  "caption": "Yummy Banh Cuon",
  "image_url": "...",
  "user": {...}
}
```

Frontend transforms to:
```json
{
  "title": "Yummy Banh Cuon",
  "description": "Yummy Banh Cuon",
  "media_url": "...",
  "likes_count": 0,
  "comments_count": 0,
  "views_count": 0,
  "is_liked": false,
  "is_saved": false,
  "user": {...}
}
```

---

## Testing

After creating `.env` and restarting frontend:

1. ✅ Navigate to Profile page
2. ✅ Click "Go to Feed"
3. ✅ Should see posts from backend without white screen
4. ✅ Console should show: "✅ Feed Posts: Using real API data"
5. ✅ No more CORS errors (will use localhost:5000 instead of platedwithfriends.life)

---

## Current Status

- ✅ Backend running on `localhost:5000`
- ✅ Backend `/api/feed` endpoint working
- ✅ Frontend code fixed
- ⏸️ **Waiting for .env file creation** → Then restart frontend

