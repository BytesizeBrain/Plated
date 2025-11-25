# Quick Start: Local Development

## 🚀 Start Local Development (2 Terminals)

### Terminal 1: Backend
```powershell
cd backend
./venv/Scripts/Activate.ps1
python app.py
```

### Terminal 2: Frontend  
```powershell
cd frontend/Plated
npm run dev
```

## 🌐 Access Your Local App

**Open browser to:**
```
http://localhost:5173
```

**DO NOT use:**
```
❌ http://platedwithfriends.life:5173  ← This is your AWS production server!
```

---

## ✅ How to Verify You're Local

1. **Check URL bar:** Should say `localhost:5173`
2. **Check backend terminal:** Should show requests from `127.0.0.1`
3. **Check browser console:** Should show `[vite] connected`

---

## 🔧 Changes Applied

**Updated `vite.config.ts`:**
- Changed `host: true` → `host: '127.0.0.1'`
- Now restricts to localhost only (can't be accessed via network/production domain)

**Restart frontend for changes to take effect:**
```powershell
# Press Ctrl+C in frontend terminal
npm run dev
```

---

## 📱 Testing Production Build Locally

```powershell
# Build
npm run build

# Preview production build locally
npm run preview

# Opens at: http://localhost:4173 (different port from dev)
```

---

**Always use `localhost` URLs for local development!**

