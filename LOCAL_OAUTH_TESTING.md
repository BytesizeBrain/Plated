# Local OAuth Testing Guide (No Code Changes Required)

## 🎯 Problem
Google OAuth redirects you to EC2 production URL after login, preventing local testing.

## ✅ Solution 1: Use Mock Login (RECOMMENDED for Local Dev)

### Why Mock Login?
- ✅ No OAuth redirect issues
- ✅ Stays on localhost
- ✅ Tests all features (feed, posts, profile, etc.)
- ✅ Faster development workflow
- ✅ No Google Cloud Console configuration needed

### How to Use Mock Login
1. **Start services:**
   ```powershell
   # Terminal 1: Backend
   cd backend
   ./venv/Scripts/Activate.ps1
   python app.py
   
   # Terminal 2: Frontend
   cd frontend/Plated
   npm run dev
   ```

2. **Access local app:**
   ```
   http://localhost:5173
   ```

3. **Login flow:**
   - Click "Sign In"
   - Click "**Continue with Mock Login (Testing)**"
   - Complete registration if needed
   - ✅ You're now on localhost and can test everything!

4. **Test feed page:**
   - Navigate to Profile
   - Click "Go to Feed"
   - ✅ Should work without white screen

---

## ✅ Solution 2: Configure Google OAuth for Localhost

### If You Must Test Real Google OAuth Locally

**Prerequisites:**
- Access to Google Cloud Console
- Project with OAuth credentials

### Step 1: Add Localhost Redirect URI

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your project
3. Click on your OAuth 2.0 Client ID
4. Under "Authorized redirect URIs", add:
   ```
   http://localhost:5000/authorize/google
   ```
5. Click "Save"

### Step 2: Verify Backend Configuration

Check `backend/env.development.local`:
```bash
FRONTEND_URL=http://localhost:5173  ← Should be localhost, not production URL
```

### Step 3: Restart Backend
**CRITICAL:** Backend must restart to load env changes
```powershell
# Stop backend (Ctrl+C)
cd backend
./venv/Scripts/Activate.ps1
python app.py
```

### Step 4: Test OAuth Flow
1. Navigate to `http://localhost:5173`
2. Click "Sign In"
3. Click "Continue with Google"
4. Complete Google login
5. Should redirect back to `http://localhost:5173/register` or `/profile`

---

## 🐛 Troubleshooting

### Issue: Still Redirects to Production After OAuth
**Cause:** Backend not restarted after env change

**Solution:**
```powershell
# Stop backend completely (Ctrl+C)
cd backend
./venv/Scripts/Activate.ps1
python app.py
```

Verify in terminal output that it loads env.development.local.

### Issue: Google OAuth Error "redirect_uri_mismatch"
**Cause:** Localhost not added to Google Cloud Console

**Solution:**
Add `http://localhost:5000/authorize/google` to authorized redirect URIs in Google Cloud Console.

### Issue: Mock Login Not Working
**Cause:** Frontend not using correct API URL

**Solution:**
1. Verify `frontend/Plated/.env` exists
2. Contains: `VITE_API_BASE_URL=http://localhost:5000`
3. Restart frontend: `npm run dev`

---

## 📊 Comparison: Mock Login vs Google OAuth

| Feature | Mock Login | Google OAuth |
|---------|-----------|--------------|
| **Local Testing** | ✅ Perfect | ⚠️ Needs setup |
| **Speed** | ✅ Instant | ❌ Slower |
| **Configuration** | ✅ None needed | ❌ Google Cloud setup |
| **Stays on Localhost** | ✅ Yes | ⚠️ Needs env config |
| **Tests Feed/Posts** | ✅ Yes | ✅ Yes |
| **Tests OAuth Flow** | ❌ No | ✅ Yes |

**Recommendation:** Use Mock Login for 95% of local development. Only test real OAuth before deploying to production.

---

## ✅ Current Configuration Status

### Backend Configuration
**File:** `backend/env.development.local` (git-ignored ✅)
```
✅ FRONTEND_URL=http://localhost:5173
✅ VITE_API_BASE_URL=http://localhost:5000
✅ Google OAuth credentials configured
```

### Frontend Configuration  
**File:** `frontend/Plated/.env` (git-ignored ✅)
```
✅ VITE_API_BASE_URL=http://localhost:5000
✅ VITE_AUTH_MODE=oauth
```

**Files git-ignored:** Neither file will be committed to cloud ✅

---

## 🎬 Quick Start (Recommended Workflow)

### Daily Development (Use Mock Login)
```powershell
# Start backend
cd backend; ./venv/Scripts/Activate.ps1; python app.py

# Start frontend (new terminal)
cd frontend/Plated; npm run dev

# Browser: http://localhost:5173
# Login: Use "Mock Login (Testing)" button
```

### Pre-Deployment (Test Real OAuth)
```powershell
# Same setup, but:
# 1. Verify Google Cloud Console has localhost redirect
# 2. Restart backend after any env changes
# 3. Use "Continue with Google" button
```

---

## 📝 Environment Variable Management

### What Gets Committed to Git
```
✅ backend/requirements.txt
✅ backend/app.py
✅ backend/routes/*.py
✅ frontend/Plated/src/**
✅ vite.config.ts
```

### What Stays Local (Git-Ignored)
```
❌ backend/env.development.local  ← Your local config
❌ backend/.env                    ← Not used
❌ frontend/Plated/.env           ← Your local config
```

### What's on EC2 Production
```
Production has its own env.development.local or .env with:
FRONTEND_URL=http://platedwithfriends.life:5173
```

**Your local changes to env.development.local won't affect production** ✅

---

## 🔐 OAuth Redirect URI Reference

### Development
```
http://localhost:5000/authorize/google
```

### Production  
```
http://platedwithfriends.life:5000/authorize/google
OR
https://platedwithfriends.life/authorize/google (if SSL configured)
```

Both can be registered in Google Cloud Console simultaneously.

---

## ✅ Summary

**For Local Development:**
1. ✅ Use Mock Login (easiest)
2. ✅ Access via `http://localhost:5173`
3. ✅ Restart backend after env changes
4. ✅ No code file changes needed

**Your env.development.local files:**
- ✅ Already git-ignored
- ✅ Won't affect production
- ✅ Already configured for localhost

**Just restart backend and use Mock Login!** 🚀

