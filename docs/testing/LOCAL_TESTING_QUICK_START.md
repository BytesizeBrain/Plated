# 🚀 Local Testing Quick Start

**Get your Plated app running locally in 3 steps!**

---

## Prerequisites ✅

- Node.js v18+ ([Download](https://nodejs.org/))
- Python 3.8+ ([Download](https://www.python.org/downloads/))

---

## 🎯 Quick Start (3 Steps)

### Step 1: Test Your Setup

```powershell
.\test-setup.ps1
```

This will check if everything is configured correctly.

### Step 2: Start Both Servers

**Option A: Automated (Recommended)**

```powershell
.\start-local-dev.ps1
```

**Option B: Manual (Two Terminals)**

Terminal 1 - Backend:
```powershell
.\start-backend.ps1
```

Terminal 2 - Frontend:
```powershell
.\start-frontend.ps1
```

### Step 3: Test the App

1. Open http://localhost:5173
2. Click "Get Started"
3. Click "Continue with Mock Login (Testing)"
4. Complete your profile
5. Start testing! 🎉

---

## 🔧 First Time Setup

If this is your first time, you need to install dependencies:

### Backend Dependencies

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

### Frontend Dependencies

```powershell
cd frontend/Plated
npm install
cd ../..
```

---

## 🐛 Troubleshooting

### Mock Login Reloads the Page

**Problem:** Clicking mock login just reloads the page.

**Solution:**
1. Make sure backend is running (http://localhost:5000)
2. Check backend terminal for errors
3. Test backend health: `curl http://localhost:5000/health`
4. Clear browser localStorage (F12 → Application → Local Storage → Clear)

### Backend Won't Start

**Problem:** Backend fails to start or shows errors.

**Common Causes & Solutions:**

1. **Port 5000 already in use:**
   ```powershell
   # Check what's using port 5000
   netstat -ano | findstr :5000
   
   # Kill the process (replace PID)
   Stop-Process -Id <PID> -Force
   ```

2. **Virtual environment not activated:**
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   ```

3. **Missing dependencies:**
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```

4. **Missing environment variables:**
   - Check that `backend/env.development.local` exists
   - It should contain `SECRET_KEY`, `CLIENT_ID`, etc.

### Frontend Won't Start

**Problem:** Frontend fails to start or shows errors.

**Common Causes & Solutions:**

1. **Port 5173 already in use:**
   ```powershell
   # Check what's using port 5173
   netstat -ano | findstr :5173
   
   # Kill the process (replace PID)
   Stop-Process -Id <PID> -Force
   ```

2. **Missing node_modules:**
   ```powershell
   cd frontend/Plated
   npm install
   ```

3. **Corrupted node_modules:**
   ```powershell
   cd frontend/Plated
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

### CORS Errors

**Problem:** Browser console shows CORS errors.

**Solution:**
1. Verify backend is running on port 5000
2. Verify frontend is running on port 5173
3. Check `backend/app.py` CORS configuration includes `http://localhost:5173`
4. Restart both servers

### "Authorization header is missing" Error

**Problem:** API calls fail with 401 error.

**Solution:**
1. Clear browser localStorage (F12 → Application → Local Storage → Clear All)
2. Refresh page
3. Try logging in again with mock login

### "User not found" After Registration

**Problem:** Successfully registered but can't see profile.

**Solution:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python check_db.py  # Check database contents

# If database is corrupted, reset it (WARNING: deletes all data)
Remove-Item instance/users.db
python app.py
```

---

## 📊 Verifying Everything Works

### 1. Check Backend Health

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

### 2. Test Dev Login Endpoint

```powershell
curl -X POST http://localhost:5000/dev/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@plated.local"}'
```

Expected response:
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbG..."
}
```

### 3. Check Frontend

- Open http://localhost:5173
- You should see the Plated landing page
- No errors in browser console (F12)

---

## 🎮 Using Mock Sign-In

### How It Works

1. **Click Mock Login Button**
   - Sends POST request to `http://localhost:5000/dev/login`
   - Backend generates a real JWT token
   - Token is stored in browser localStorage

2. **Navigate to Register Page**
   - Token is validated by backend
   - User can complete profile registration

3. **Profile is Created**
   - Saved in local SQLite database (`backend/instance/users.db`)
   - Subsequent logins will skip registration

### Testing Multiple Users

To test with different users:

**Option 1: Use Different Emails**
```powershell
curl -X POST http://localhost:5000/dev/login `
  -H "Content-Type: application/json" `
  -d '{"email":"user1@plated.local"}'
  
curl -X POST http://localhost:5000/dev/login `
  -H "Content-Type: application/json" `
  -d '{"email":"user2@plated.local"}'
```

**Option 2: Reset Database**
```powershell
cd backend
Remove-Item instance/users.db
python app.py
```

---

## 📍 Important URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:5173 | Main application |
| Backend | http://localhost:5000 | API server |
| Health Check | http://localhost:5000/health | Backend health status |
| Dev Login | http://localhost:5000/dev/login | Mock authentication endpoint |

---

## 🔐 Environment Variables

### Backend (`backend/env.development.local`)

```
ENV=dev
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
CLIENT_ID=google-oauth-client-id
CLIENT_SECRET=google-oauth-client-secret
FRONTEND_URL=http://localhost:5173
```

### Frontend (Optional: `frontend/Plated/.env.local`)

```
VITE_AUTH_MODE=oauth
VITE_API_BASE_URL=http://localhost:5000
VITE_API_FALLBACK_PORT=5000
```

**Note:** Frontend `.env.local` is optional. Defaults work for most cases.

---

## 💡 Pro Tips

1. **Use Windows Terminal**
   - Split panes: Backend in left pane, Frontend in right pane
   - Easy to monitor both servers

2. **Browser DevTools**
   - Press F12 to open
   - Console tab: See JavaScript errors
   - Network tab: Monitor API calls
   - Application tab: View localStorage tokens

3. **Backend Logs**
   - Watch backend terminal for API requests
   - Debug mode shows detailed error messages

4. **Hot Reload**
   - Frontend: Auto-reloads on file save (Vite HMR)
   - Backend: Auto-reloads on file save (Flask debug mode)

5. **Database Inspection**
   ```powershell
   cd backend
   python check_db.py
   ```

---

## ✅ Success Checklist

- [ ] Backend running on http://localhost:5000
- [ ] Frontend running on http://localhost:5173
- [ ] http://localhost:5000/health shows "ok"
- [ ] Landing page loads without errors
- [ ] Mock login button redirects to register page
- [ ] Can complete registration
- [ ] Redirected to profile after registration
- [ ] No errors in browser console
- [ ] No errors in backend terminal

---

## 🆘 Still Having Issues?

1. **Run the test script:**
   ```powershell
   .\test-setup.ps1
   ```

2. **Check the logs:**
   - Backend terminal for API errors
   - Frontend terminal for build errors
   - Browser console (F12) for client errors

3. **Reset everything:**
   ```powershell
   # Stop all servers (Ctrl+C)
   
   # Reset backend
   cd backend
   Remove-Item instance/users.db
   
   # Reset frontend cache
   cd ../frontend/Plated
   Remove-Item -Recurse -Force node_modules/.vite
   
   # Restart servers
   cd ../..
   .\start-local-dev.ps1
   ```

4. **Check the full documentation:**
   - See `START_LOCAL_TESTING.md` for detailed info
   - See `QUICK_START_GUIDE.md` for general setup

---

**Happy Testing! 🎉**

If you're still stuck, check:
- Browser console (F12)
- Backend terminal output
- Network tab in DevTools

