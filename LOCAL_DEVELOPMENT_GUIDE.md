# Local Development Guide - Avoiding Production Conflicts

## 🎯 Problem

You're accessing `http://platedwithfriends.life:5173` which routes to your AWS EC2 production server, not your local machine.

---

## ✅ Solution: Use Correct Local URLs

### Development URLs (Local Machine)
```
✅ Frontend: http://localhost:5173
✅ Backend:  http://localhost:5000
✅ Backend Health: http://localhost:5000/health
✅ Backend API: http://localhost:5000/api/feed
```

### Production URLs (AWS EC2)
```
❌ DON'T USE THESE FOR LOCAL DEV:
❌ http://platedwithfriends.life:5173
❌ http://platedwithfriends.life:5000
```

---

## 🔧 How to Run Pure Local Development

### Step 1: Start Backend Locally
```powershell
cd backend
./venv/Scripts/Activate.ps1
python app.py
```

**Expected Output:**
```
* Running on http://127.0.0.1:5000
* Running on http://192.168.x.x:5000
```

### Step 2: Start Frontend Locally
```powershell
cd frontend/Plated
npm run dev
```

**Expected Output:**
```
VITE v7.1.7  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

### Step 3: Access Local Development
Open your browser to:
```
http://localhost:5173
```

**DO NOT use:**
- ❌ `platedwithfriends.life` URLs
- ❌ Network IP addresses (unless testing from another device)

---

## 🔍 How to Verify You're on Local vs Production

### Check 1: Browser URL Bar
```
✅ Local:      http://localhost:5173/feed
❌ Production: http://platedwithfriends.life:5173/feed
```

### Check 2: Browser Console (F12)
**Local Development Shows:**
```
[vite] connecting...
[vite] connected.
✅ Feed Posts: Using real API data
```

**Also check Network tab:**
```
✅ Requests go to: http://localhost:5000/api/feed
❌ NOT to: http://platedwithfriends.life/api/feed
```

### Check 3: Terminal Output
**Backend terminal should show requests:**
```
INFO:werkzeug:127.0.0.1 - - [24/Nov/2025 02:19:20] "GET /api/feed HTTP/1.1" 200
```

If you see external IP addresses, someone is hitting your production server.

---

## 🛡️ Preventing Production Access During Development

### Option 1: Use localhost Only (Recommended)
Just always use `http://localhost:5173` in your browser.

### Option 2: Block Production Domain Locally
Add to your Windows hosts file (`C:\Windows\System32\drivers\etc\hosts`):
```
# Block production during local dev (comment out when done)
127.0.0.1 platedwithfriends.life
```

This redirects `platedwithfriends.life` to localhost temporarily.

**To edit hosts file:**
```powershell
# Run as Administrator
notepad C:\Windows\System32\drivers\etc\hosts
```

**Add line:**
```
127.0.0.1 platedwithfriends.life
```

**Save, then flush DNS:**
```powershell
ipconfig /flushdns
```

### Option 3: Restrict Vite to Localhost Only
**Edit `frontend/Plated/vite.config.ts`:**
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',  // Changed from 'true' to localhost only
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
  appType: 'spa',
})
```

This prevents network access entirely.

### Option 4: Use Different Port
**Change local dev port:**
```typescript
// vite.config.ts
server: {
  host: true,
  port: 3000,  // Different from production
}
```

Then access: `http://localhost:3000`

---

## 📋 Local Development Checklist

Before starting development:

- [ ] ✅ Backend running locally (check terminal)
- [ ] ✅ Frontend running locally (check terminal)
- [ ] ✅ Using `http://localhost:5173` in browser
- [ ] ✅ `.env` file exists in `frontend/Plated/`
- [ ] ✅ `.env` has `VITE_API_BASE_URL=http://localhost:5000`
- [ ] ✅ Browser console shows `[vite] connected`
- [ ] ✅ Network tab shows requests to `localhost:5000`

---

## 🧪 Testing Workflow

### 1. Local Development
```bash
# Test changes locally
http://localhost:5173
```

### 2. Build for Production
```powershell
cd frontend/Plated
npm run build
```

### 3. Preview Production Build Locally
```powershell
npm run preview
```
Opens at `http://localhost:4173` (different port)

### 4. Deploy to AWS EC2
Only after testing locally:
```bash
git push origin main
# SSH to AWS EC2
# Pull changes
# Restart services
```

---

## 🐛 Troubleshooting

### Issue: Still Seeing Production URL
**Check:** Browser might have cached redirect
```
Solution:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+Shift+R)
3. Close all browser tabs
4. Reopen to http://localhost:5173
```

### Issue: "Site Can't Be Reached"
**Check:** Vite dev server not running
```
Solution:
cd frontend/Plated
npm run dev
```

### Issue: API Calls Failing
**Check:** Backend not running
```
Solution:
cd backend
./venv/Scripts/Activate.ps1
python app.py
```

### Issue: CORS Errors Still
**Check:** `.env` file might not be loaded
```
Solution:
1. Verify frontend/Plated/.env exists
2. Restart Vite dev server
3. Hard refresh browser
```

---

## 📊 Environment Comparison

| Aspect | Local Development | Production (AWS) |
|--------|------------------|------------------|
| Frontend URL | `http://localhost:5173` | `http://platedwithfriends.life:5173` |
| Backend URL | `http://localhost:5000` | `http://platedwithfriends.life:5000` |
| Database | Local SQLite | Supabase Cloud |
| Auth | Mock Login | Google OAuth |
| Hot Reload | ✅ Yes | ❌ No |
| Build | Dev mode | Production build |

---

## ✅ Quick Commands

### Start Local Development
```powershell
# Terminal 1: Backend
cd backend
./venv/Scripts/Activate.ps1
python app.py

# Terminal 2: Frontend
cd frontend/Plated
npm run dev

# Browser: http://localhost:5173
```

### Stop Development
```
Press Ctrl+C in both terminals
```

### Check What's Running
```powershell
# Check if backend running
Get-Process python -ErrorAction SilentlyContinue

# Check if Vite running
Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
```

---

## 🎯 Summary

**Always use these URLs for local development:**
- ✅ Frontend: `http://localhost:5173`
- ✅ Backend: `http://localhost:5000`

**Never use these during local dev:**
- ❌ `http://platedwithfriends.life:5173`
- ❌ Network IP addresses

This ensures you're testing your local changes, not hitting the production AWS server.

