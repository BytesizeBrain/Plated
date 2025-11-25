# 🚀 Quick Start Commands

## One-Time Setup (Run Once)

### Option 1: Automated Setup (Recommended)
```powershell
# Run the setup script (installs all dependencies)
.\setup-all.ps1
```

### Option 2: Manual Setup

#### Frontend Setup
```powershell
cd frontend\Plated
npm install
```

#### Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

## Running Development Servers

You need **TWO terminal windows** open:

### Terminal 1: Frontend (React + Vite)
```powershell
cd frontend\Plated
npm run dev
```
**Opens at:** http://localhost:5173

### Terminal 2: Backend (Flask)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python app.py
```
**Opens at:** http://localhost:5000

---

## Running Preview (Production Build)

### Step 1: Build Frontend
```powershell
cd frontend\Plated
npm run build
```

### Step 2: Preview Production Build
```powershell
npm run preview
```
**Opens at:** http://localhost:4173

---

## Quick Reference

| Task | Command |
|------|---------|
| **Install Frontend** | `cd frontend\Plated && npm install` |
| **Install Backend** | `cd backend && pip install -r requirements.txt` |
| **Run Frontend Dev** | `cd frontend\Plated && npm run dev` |
| **Run Backend Dev** | `cd backend && python app.py` |
| **Build Frontend** | `cd frontend\Plated && npm run build` |
| **Preview Build** | `cd frontend\Plated && npm run preview` |

---

## Troubleshooting

**Port already in use?**
- Frontend (5173): Kill process or change port in `vite.config.ts`
- Backend (5000): Kill process or change port in `app.py`

**Dependencies not installing?**
- Frontend: Delete `node_modules` and `package-lock.json`, then `npm install`
- Backend: Make sure virtual environment is activated, then `pip install -r requirements.txt`

**Can't activate virtual environment?**
- Run PowerShell as Administrator
- Or use: `python -m venv venv` then `venv\Scripts\python.exe -m pip install -r requirements.txt`

