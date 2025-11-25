# Mock Login Fix - Auth Mode Issue

## 🎯 Problem

Mock Login redirects back to login page immediately.

**Root Cause:** `.env` file had `VITE_AUTH_MODE=oauth` instead of `mock`.

When using Mock Login with oauth mode:
1. Mock token created (not real JWT)
2. Register page calls API with mock token
3. Backend returns 401 (mock token invalid for real backend)
4. Axios interceptor catches 401 + oauth mode → redirects to /login

---

## ✅ Solution: Update .env File

**File:** `frontend/Plated/.env`

**Change FROM:**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_AUTH_MODE=oauth  ← Wrong for Mock Login
```

**Change TO:**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_AUTH_MODE=mock   ← Correct for Mock Login
```

---

## 🔄 Restart Frontend

After changing `.env`, restart Vite dev server:
```powershell
# In frontend terminal, press Ctrl+C
npm run dev
```

Vite must restart to load new environment variables.

---

## ✅ Test Mock Login

1. Navigate to `http://localhost:5173`
2. Click "Sign In"
3. Click "Continue with Mock Login (Testing)"
4. Should stay on Register page ✅
5. Complete registration form
6. Navigate to Feed ✅

---

## 📊 Auth Modes Explained

### `VITE_AUTH_MODE=mock`
- ✅ Mock Login works
- ✅ Bypasses backend authentication
- ✅ Uses fallback data for all APIs
- ✅ Perfect for local development
- ❌ Google OAuth redirects to production

### `VITE_AUTH_MODE=oauth`
- ❌ Mock Login fails (401 → redirects)
- ✅ Google OAuth works (if configured)
- ⚠️  Requires backend for all API calls
- ✅ For testing real authentication

---

## 🎬 Quick Commands

### For Mock Login Testing
```powershell
# Update .env
@"
VITE_API_BASE_URL=http://localhost:5000
VITE_AUTH_MODE=mock
"@ | Out-File -FilePath "frontend/Plated/.env" -Encoding UTF8 -NoNewline

# Restart frontend
cd frontend/Plated
# Press Ctrl+C
npm run dev
```

### For Google OAuth Testing
```powershell
# Update .env
@"
VITE_API_BASE_URL=http://localhost:5000
VITE_AUTH_MODE=oauth
"@ | Out-File -FilePath "frontend/Plated/.env" -Encoding UTF8 -NoNewline

# Restart frontend AND backend
# Backend must have FRONTEND_URL=http://localhost:5173
cd frontend/Plated
npm run dev
```

---

## ✅ Current Status

**Fixed:** Changed `VITE_AUTH_MODE` from `oauth` to `mock`

**Next Step:** Restart frontend dev server

**Then Test:**
1. http://localhost:5173
2. Mock Login
3. Should work! ✅

