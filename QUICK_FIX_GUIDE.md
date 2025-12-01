# Quick Fix Guide - Local Development Issues

## 🔴 Common Issue: Backend Not Running

### Symptom: "Failed to fetch" Errors
- Create Post shows "Failed to create post. Please try again."
- API calls fail in browser console
- Cause: Backend not responding on port 5000

---

## ✅ THE FIX: Start the Backend!

### Step 1: Open Terminal and Start Backend

**On Windows PowerShell:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python app.py
```

**On Mac/Linux:**
```bash
cd backend
source venv/bin/activate
python app.py
```

**You should see:**
```
 * Running on http://127.0.0.1:5000
 * Running on http://0.0.0.0:5000
```

### Step 2: Verify Backend is Running

Open another terminal and test:
```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{"status":"ok","message":"Server is running"}
```

---

## 🧪 Testing Checklist

- [ ] Backend is running on port 5000
- [ ] Can access `http://localhost:5000/health`
- [ ] Frontend is running on port 5173
- [ ] Create Post page loads without errors
- [ ] Can upload image successfully
- [ ] Can create post and navigate to feed
- [ ] Challenges page loads correctly
- [ ] Feed page shows posts

---

## 🔍 Debugging Tips

### Check if Backend is Running:
```bash
# Windows
Get-Process | Where-Object {$_.ProcessName -eq "python"}

# Mac/Linux
ps aux | grep python
```

### Check Ports in Use:
```bash
# Check port 5000
netstat -ano | findstr :5000

# Check port 5173
netstat -ano | findstr :5173
```

### View Backend Logs:
The terminal where you ran `python app.py` shows:
- API requests
- Errors
- Database queries

### View Frontend Logs:
Open browser DevTools (F12):
- Console tab: Shows JavaScript errors
- Network tab: Shows API calls and responses

---

## 📊 Common Error Messages Explained

| Error | Meaning | Fix |
|-------|---------|-----|
| "Failed to create post" | Backend not responding | Start backend |
| "Unable to connect to server" | Backend not running | Start backend |
| 404 Not Found | Route doesn't exist | Check App.tsx routes |
| CORS error | Backend CORS not configured | Check backend CORS settings |

---

## 🚀 Proper Development Workflow

**Always start BOTH servers:**

**Terminal 1 - Backend:**
```bash
cd backend
.\venv\Scripts\Activate.ps1  # Windows
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend/Plated
npm run dev
```

**Then access:** `http://localhost:5173`

---

## ✅ Success Indicators

**Backend is working when you see:**
```
 * Running on http://127.0.0.1:5000
 * Debugger is active!
```

**Frontend is working when you see:**
```
VITE v7.1.7  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

**Both are working when:**
- Can create posts without errors ✅
- Can view challenges page ✅
- Can see feed with posts ✅
- No white screens ✅

---

## 💡 Pro Tips

1. **Keep both terminals open** - Don't close them during development
2. **Check backend terminal** for error messages when frontend fails
3. **Use browser DevTools Network tab** to see API calls
4. **If changes don't apply** - Hard refresh browser (Ctrl+Shift+R)
5. **If really stuck** - Restart both servers

---

## 🆘 Still Not Working?

If issues persist after starting backend:

1. **Check Supabase credentials** in `backend/.env` or `backend/env.development.local`
2. **Verify database tables exist** - Run `python backend/check_supabase_env.py`
3. **Check for Python errors** in backend terminal
4. **Verify Node modules installed** - Run `npm install` in frontend/Plated
5. **Clear browser cache** and try again

---

Remember: **99% of "Failed to fetch" errors = Backend not running!** 🎯
