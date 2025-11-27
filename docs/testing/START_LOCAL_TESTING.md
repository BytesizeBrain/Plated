# 🚀 Local Testing Guide - Plated Application

This guide will help you run both frontend and backend servers for local testing with the mock sign-in feature.

## 📋 Prerequisites

Make sure you have:
- ✅ Node.js (v18+) installed
- ✅ Python (v3.8+) installed
- ✅ Dependencies installed (see below if not done)

---

## 🔧 Step 1: Install Dependencies (First Time Only)

### Backend Dependencies

```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### Frontend Dependencies

```powershell
# Navigate to frontend directory (from project root)
cd frontend/Plated

# Install dependencies
npm install
```

---

## 🎮 Step 2: Start Both Servers

### Option A: Use PowerShell Script (Recommended - Automated)

From the project root directory:

```powershell
.\setup-all.ps1
```

This will automatically:
1. Start the backend server on port 5000
2. Start the frontend server on port 5173
3. Open your browser to http://localhost:5173

### Option B: Manual Start (Two Separate Terminals)

#### Terminal 1: Start Backend

```powershell
# From project root
cd backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Set environment variable for dev mode
$env:ENV="dev"

# Start Flask backend
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

#### Terminal 2: Start Frontend

```powershell
# From project root (in a NEW terminal)
cd frontend/Plated

# Start Vite development server
npm run dev
```

You should see:
```
  VITE v7.1.7  ready in 342 ms

  ➜  Local:   http://localhost:5173/
```

---

## 🔐 Step 3: Using Mock Sign-In for Testing

### Understanding Authentication Modes

The application supports two authentication modes:

1. **OAuth Mode** (Default - requires Google OAuth)
   - Uses real Google OAuth authentication
   - Requires backend to be running
   - Best for production-like testing

2. **Mock Mode** (Testing only - no backend auth needed)
   - Uses mock authentication
   - Works without Google OAuth
   - Best for UI testing

### Using Mock Sign-In (OAuth Mode with Dev Endpoint)

1. **Open the application:**
   - Navigate to http://localhost:5173
   - Click "Get Started" or "Sign In"

2. **Click "Continue with Mock Login (Testing)":**
   - This uses the backend's `/dev/login` endpoint
   - Creates a proper JWT token for testing
   - Works with full backend integration

3. **Complete your profile:**
   - Enter a username (at least 3 characters)
   - Enter a display name
   - Optionally add a profile picture URL
   - Click "Complete Registration"

4. **You're in!**
   - You'll be redirected to your profile
   - Full app functionality is now available

### Alternative: Using Dev Login API Directly

If you want to programmatically get a dev token:

```bash
# Using curl
curl -X POST http://localhost:5000/dev/login -H "Content-Type: application/json" -d '{"email":"test@plated.local"}'

# Using PowerShell
Invoke-RestMethod -Uri http://localhost:5000/dev/login -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@plated.local"}'
```

---

## 🐛 Troubleshooting

### Issue: Mock login button reloads the page

**Solution:** Make sure both frontend AND backend servers are running. The mock login now uses the backend's dev endpoint.

**Check:**
1. Backend is running on http://localhost:5000
2. Frontend is running on http://localhost:5173
3. Test backend health: Open http://localhost:5000/health in your browser

### Issue: "Authorization header is missing" error

**Cause:** The token isn't being sent properly.

**Solution:**
1. Clear your browser's localStorage (F12 → Application → Local Storage → Clear All)
2. Refresh the page and try logging in again

### Issue: Backend won't start

**Common causes:**
- Port 5000 is already in use
- Virtual environment not activated
- Missing dependencies

**Solutions:**
```powershell
# Check if port 5000 is in use
netstat -ano | findstr :5000

# If in use, kill the process or change the port in app.py

# Reinstall dependencies
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt --force-reinstall
```

### Issue: Frontend won't start

**Common causes:**
- Port 5173 is already in use
- Missing node_modules

**Solutions:**
```powershell
# Check if port 5173 is in use
netstat -ano | findstr :5173

# Reinstall dependencies
cd frontend/Plated
rm -rf node_modules
npm install
```

### Issue: CORS errors in browser console

**Cause:** Frontend can't connect to backend due to CORS restrictions.

**Solution:**
1. Make sure backend is running on port 5000
2. Check that `app.py` has CORS enabled for `http://localhost:5173`
3. Try clearing browser cache and reloading

### Issue: "User not found" after registration

**Cause:** Database might need to be reset.

**Solution:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1

# Check database
python check_db.py

# If needed, recreate database (this will delete all data)
rm instance/users.db
python app.py
```

---

## 📊 Testing Features

Once logged in with mock authentication, you can test:

### ✅ Feed Features
- View posts
- Like/unlike posts
- Comment on posts
- Save posts
- Filter posts

### ✅ Profile Features
- View your profile
- Edit display name
- Update profile picture
- View followers/following

### ✅ Messages (if implemented)
- View conversations
- Send messages
- Mark as read

### ✅ Challenges (if implemented)
- View available challenges
- Start challenges
- Track progress

---

## 🔍 Checking Server Status

### Backend Health Check

Open in browser or run:
```powershell
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

### Frontend Dev Server

If running, you should be able to access:
- Main app: http://localhost:5173
- Any page will show the React app with hot reload

---

## 📝 Environment Variables Reference

### Backend (.env or env.development.local)

```
ENV=dev                          # Enables dev endpoints like /dev/login
SECRET_KEY=your-secret-key       # Flask session secret
JWT_SECRET=your-jwt-secret       # JWT token secret
CLIENT_ID=google-client-id       # Google OAuth (optional for dev)
CLIENT_SECRET=google-secret      # Google OAuth (optional for dev)
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.development.local)

```
VITE_AUTH_MODE=oauth             # Use 'oauth' for backend auth, 'mock' for pure frontend
VITE_API_BASE_URL=http://localhost:5000
VITE_API_FALLBACK_PORT=5000
```

---

## 🎯 Quick Start Checklist

- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] Can access http://localhost:5000/health (shows OK status)
- [ ] Can access http://localhost:5173 (shows landing page)
- [ ] Mock login works and redirects to register page
- [ ] Can complete registration with username
- [ ] Redirected to profile page after registration

---

## 💡 Development Tips

1. **Use Browser DevTools (F12):**
   - Check Console for errors
   - Check Network tab for API calls
   - Check Application tab to see localStorage tokens

2. **Backend Logs:**
   - Watch the backend terminal for API call logs
   - Debug mode shows all requests and errors

3. **Frontend Hot Reload:**
   - Vite automatically reloads when you save files
   - No need to refresh browser manually

4. **Database Inspection:**
   ```powershell
   cd backend
   python check_db.py
   ```

5. **Test Different Users:**
   - Delete `backend/instance/users.db` to reset
   - Use different emails in dev login: `test1@plated.local`, `test2@plated.local`, etc.

---

## 🚀 Ready to Test!

Once both servers are running:

1. Open http://localhost:5173
2. Click "Get Started"
3. Click "Continue with Mock Login (Testing)"
4. Complete your profile
5. Start testing the app!

**Happy Testing! 🎉**

