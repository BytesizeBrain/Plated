# Deployment Checklist - Fix Production Feed Issue

## 📋 Summary of Fixes to Deploy

The senior SWE reported: "feed page errors - /unread api doesn't exist"

**Fixes made (currently LOCAL only):**

### Backend Fixes
1. ✅ Added `/api/messages/unread` endpoint
2. ✅ Fixed posts blueprint to use `/api` prefix
3. ✅ Environment configuration for localhost

### Frontend Fixes
4. ✅ Updated API calls to use `/api/feed` and `/api/messages/unread`
5. ✅ Added data transformation layer
6. ✅ Fixed PostCard null safety
7. ✅ Environment configuration for localhost

---

## 🚀 Deployment Steps

### Step 1: Review Changes to Commit

**Files Modified (safe to commit):**
```bash
✅ backend/app.py                           # Added /api prefix to posts_bp
✅ backend/routes/user_routes.py            # Added /unread endpoint
✅ backend/extensions.py                    # Load env.development.local
✅ backend/supabase_client.py              # Load env.development.local
✅ frontend/Plated/src/utils/api.ts        # Fixed endpoints + transformation
✅ frontend/Plated/src/components/feed/PostCard.tsx  # Null safety
```

**Files NOT to commit (git-ignored):**
```bash
❌ backend/env.development.local            # Your local config
❌ frontend/Plated/.env                    # Your local config
```

### Step 2: Test Locally One More Time

```powershell
# Backend
cd backend
./venv/Scripts/Activate.ps1
python app.py

# Frontend (new terminal)
cd frontend/Plated
npm run dev

# Browser
http://localhost:5173
# Use Mock Login
# Test Feed page
# Verify: No white screen, posts load ✅
```

### Step 3: Check Git Status

```bash
cd C:\Users\DangT\Documents\GitHub\Plated-Testing-CC
git status
```

**Should show:**
```
Modified:
  backend/app.py
  backend/routes/user_routes.py
  backend/extensions.py
  backend/supabase_client.py
  frontend/Plated/src/utils/api.ts
  frontend/Plated/src/components/feed/PostCard.tsx
```

### Step 4: Commit Changes

```bash
git add backend/app.py
git add backend/routes/user_routes.py
git add backend/extensions.py
git add backend/supabase_client.py
git add frontend/Plated/src/utils/api.ts
git add frontend/Plated/src/components/feed/PostCard.tsx

git commit -m "Fix: Add missing /unread API endpoint and fix feed page loading

- Added /api/messages/unread endpoint (returns stub count: 0)
- Fixed posts blueprint to use /api prefix for consistency
- Updated frontend to call correct endpoints
- Added data transformation layer for backend response
- Fixed PostCard null safety for likes_count/views_count
- Added env.development.local loading for local dev

Fixes feed page white screen issue and 404 errors."
```

### Step 5: Push to Repository

```bash
git push origin main
```

Or if you're on a different branch:
```bash
git push origin your-branch-name
```

### Step 6: Deploy to AWS EC2

**SSH to your EC2 instance:**
```bash
ssh your-user@platedwithfriends.life
```

**Pull latest changes:**
```bash
cd /path/to/your/app
git pull origin main
```

**Restart backend:**
```bash
# Stop current backend
# Method depends on how you run it (pm2, systemd, etc.)
pm2 restart backend
# OR
sudo systemctl restart plated-backend
```

**Rebuild frontend (if needed):**
```bash
cd frontend/Plated
npm install  # if package.json changed
npm run build
```

**Restart frontend server (if applicable):**
```bash
pm2 restart frontend
# OR
sudo systemctl restart plated-frontend
```

### Step 7: Verify Production

1. Open browser to: `http://platedwithfriends.life:5173`
2. Use Google OAuth login
3. Navigate to Feed page
4. ✅ Should work without errors now!

**Check browser console:**
- Should NOT see 404 errors for `/unread`
- Should NOT see 404 errors for `/api/feed`
- Should see posts loading

---

## 🔍 Post-Deployment Verification

### Backend Health Check
```bash
curl http://platedwithfriends.life:5000/health
# Should return: {"status": "ok", "message": "Server is running"}
```

### Unread Endpoint Check
```bash
curl http://platedwithfriends.life:5000/api/messages/unread \
  -H "Authorization: Bearer YOUR_TOKEN"
# Should return: {"count": 0}
```

### Feed Endpoint Check
```bash
curl http://platedwithfriends.life:5000/api/feed
# Should return feed data (not 404)
```

---

## 🐛 Troubleshooting Production

### Issue: Still getting 404 on /unread
**Cause:** Backend not restarted after pulling changes

**Solution:**
```bash
ssh to EC2
pm2 restart backend
# OR
sudo systemctl restart plated-backend
```

### Issue: Feed still shows white screen
**Cause:** Frontend not rebuilt after pulling changes

**Solution:**
```bash
ssh to EC2
cd frontend/Plated
npm run build
pm2 restart frontend
```

### Issue: CORS errors in production
**Cause:** Backend CORS config might not include production URLs

**Check:** `backend/app.py` has production URL in CORS origins

---

## 📊 Before/After Comparison

### Before Deployment (Current Production - BROKEN)
```
❌ GET /unread → 404 Not Found
❌ GET /feed → 404 Not Found  
❌ Feed page → White screen
❌ Console errors about missing APIs
```

### After Deployment (With Fixes - WORKING)
```
✅ GET /api/messages/unread → 200 OK, {"count": 0}
✅ GET /api/feed → 200 OK, returns posts
✅ Feed page → Loads correctly
✅ No console errors
```

---

## ⚠️ Important Notes

### Environment Variables on Production

**Production EC2 should have its own `.env` or `env.development.local`:**
```bash
# On EC2 server
FRONTEND_URL=http://platedwithfriends.life:5173
VITE_API_BASE_URL=http://platedwithfriends.life:5000
# ... other production configs
```

**These are different from your local env files.**

### Google OAuth Configuration

**For production to work with Google OAuth:**
- Google Cloud Console must have:
  ```
  Authorized redirect URIs:
  - http://platedwithfriends.life:5000/authorize/google
  ```

**For local to work with Google OAuth:**
- Google Cloud Console must also have:
  ```
  - http://localhost:5000/authorize/google
  ```

Both can coexist in Google Cloud Console.

---

## ✅ Deployment Complete Checklist

After deployment, verify:

- [ ] Git changes pushed successfully
- [ ] EC2 pulled latest code
- [ ] Backend restarted on EC2
- [ ] Frontend rebuilt on EC2 (if needed)
- [ ] Production URL accessible: `http://platedwithfriends.life:5173`
- [ ] Google OAuth login works
- [ ] Feed page loads without white screen
- [ ] No 404 errors in browser console
- [ ] Senior SWE can test and verify fix

---

## 🎯 Summary

**Current Status:**
- ✅ Fixes work locally with Mock Login
- ❌ Fixes NOT on production yet
- ❌ Google OAuth still goes to broken production

**Next Steps:**
1. Commit and push fixes to git
2. Deploy to AWS EC2
3. Restart services on EC2
4. Test production with Google OAuth
5. ✅ Senior SWE's issue will be resolved!

**The senior SWE's issue WILL be fixed once you deploy these changes to production.** 🚀

