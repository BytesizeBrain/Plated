# 🚀 Local Testing - Plated Application

**Your complete guide to testing Plated locally with both frontend and backend servers.**

---

## ⚡ Quick Start (30 seconds)

```powershell
# 1. Test your setup
.\test-setup.ps1

# 2. Start both servers
.\start-local-dev.ps1

# 3. Open browser
# http://localhost:5173
```

**That's it! 🎉**

---

## 📖 What Was Fixed

The mock sign-in feature now works correctly:

✅ **Before:** Mock login button reloaded the page  
✅ **After:** Mock login generates real JWT token and progresses to registration

**Technical Details:** See `CHANGES_SUMMARY.md`

---

## 🎯 Testing the Fix

### Step 1: Start Servers

**Option A: Automated (Recommended)**
```powershell
.\start-local-dev.ps1
```

**Option B: Manual (Two Terminals)**
```powershell
# Terminal 1 - Backend
.\start-backend.ps1

# Terminal 2 - Frontend
.\start-frontend.ps1
```

### Step 2: Test Mock Authentication

1. Open http://localhost:5173
2. Click **"Get Started"**
3. Click **"Continue with Mock Login (Testing)"**
4. You should be redirected to the registration page ✅
5. Complete your profile:
   - Enter username (min 3 characters)
   - Enter display name
   - (Optional) Add profile picture URL
6. Click **"Complete Registration"**
7. You should be redirected to your profile page ✅

### Step 3: Verify Everything Works

- ✅ Profile page loads
- ✅ No errors in browser console (F12)
- ✅ Can navigate the app
- ✅ API calls work (check Network tab)

---

## 📚 Documentation Index

| Guide | When to Use |
|-------|-------------|
| **LOCAL_TESTING_QUICK_START.md** | Fast setup, common issues |
| **START_LOCAL_TESTING.md** | Detailed guide, troubleshooting |
| **MOCK_AUTH_FLOW.md** | Technical deep dive, debugging |
| **CHANGES_SUMMARY.md** | What changed, why it works now |
| **QUICK_START_GUIDE.md** | General app setup |

---

## 🔧 Helpful Scripts

### Test Your Setup
```powershell
.\test-setup.ps1
```
Checks dependencies, ports, and configuration.

### Start Backend Only
```powershell
.\start-backend.ps1
```
Starts Flask backend on port 5000.

### Start Frontend Only
```powershell
.\start-frontend.ps1
```
Starts Vite dev server on port 5173.

### Start Both Servers
```powershell
.\start-local-dev.ps1
```
Automated startup with monitoring.

---

## 🐛 Quick Troubleshooting

### Mock Login Reloads Page

**Fix:**
1. Verify backend is running: `curl http://localhost:5000/health`
2. Check browser console for errors (F12)
3. Clear localStorage: F12 → Application → Local Storage → Clear

### Backend Won't Start

**Fix:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

### Frontend Won't Start

**Fix:**
```powershell
cd frontend/Plated
npm install
npm run dev
```

### Port Already in Use

**Fix:**
```powershell
# Check port 5000
netstat -ano | findstr :5000

# Kill process (replace <PID>)
Stop-Process -Id <PID> -Force
```

---

## ✅ Success Checklist

After starting servers:

- [ ] Backend: http://localhost:5000/health shows `{"status":"ok"}`
- [ ] Frontend: http://localhost:5173 shows landing page
- [ ] Mock login redirects to registration (not reload)
- [ ] Can complete registration
- [ ] Profile page loads with user data
- [ ] No console errors (F12)

---

## 🔐 How Mock Auth Works

```
User → Mock Login → Backend /dev/login
                   ↓
              Real JWT Token
                   ↓
         Store in localStorage
                   ↓
         Navigate to /register
                   ↓
         Check if user exists
                   ↓
     ┌──────────────┴──────────────┐
     ↓                             ↓
New User                    Existing User
Show Registration           Skip to Profile
```

**Full Technical Flow:** See `MOCK_AUTH_FLOW.md`

---

## 💡 Pro Tips

1. **Split Terminal:** Use one pane for backend, one for frontend
2. **DevTools:** Keep F12 open to monitor console and network
3. **Watch Logs:** Backend terminal shows all API requests
4. **Hot Reload:** Both servers auto-reload on file changes
5. **Multiple Users:** Use different emails in dev login

---

## 🎮 Testing Scenarios

### New User
1. Mock login
2. Register with username
3. Access profile
4. Test app features

### Existing User
1. Mock login (same email as before)
2. Auto-redirect to profile
3. Test app features

### Multiple Users
1. Use different emails:
   - `user1@plated.local`
   - `user2@plated.local`
   - etc.
2. Test interactions between users

---

## 🆘 Still Stuck?

1. **Run diagnostics:**
   ```powershell
   .\test-setup.ps1
   ```

2. **Reset everything:**
   ```powershell
   # Stop servers (Ctrl+C)
   Remove-Item backend/instance/users.db
   # Clear browser: F12 → Application → Clear storage
   .\start-local-dev.ps1
   ```

3. **Check detailed docs:**
   - `LOCAL_TESTING_QUICK_START.md` - Common issues
   - `START_LOCAL_TESTING.md` - Detailed troubleshooting
   - `MOCK_AUTH_FLOW.md` - Technical debugging

---

## 📍 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:5173 | Main app |
| Backend | http://localhost:5000 | API server |
| Health Check | http://localhost:5000/health | Verify backend |
| Dev Login | POST http://localhost:5000/dev/login | Get test token |

---

## 🚀 Next Steps

1. ✅ **Test the mock authentication** (you're here!)
2. 📝 **Develop and test features** with working auth
3. 🎨 **Customize and extend** the application
4. 🌐 **Deploy to production** when ready

---

## 📋 Prerequisites

- Node.js v18+ ([Download](https://nodejs.org/))
- Python 3.8+ ([Download](https://www.python.org/downloads/))
- Dependencies installed (run `.\test-setup.ps1` to check)

---

**Everything is ready! Start testing your application now! 🎉**

For questions or issues, check the detailed guides:
- 🚀 Quick fixes: `LOCAL_TESTING_QUICK_START.md`
- 📖 Complete guide: `START_LOCAL_TESTING.md`
- 🔬 Technical details: `MOCK_AUTH_FLOW.md`

