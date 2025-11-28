# 🚀 Quick Start Guide - Plated Application

This guide will help you install all dependencies and run both the frontend and backend development servers.

## 📋 Prerequisites

Before starting, make sure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download here](https://www.python.org/downloads/)
- **npm** (comes with Node.js)
- **pip** (comes with Python)

Verify installations:
```bash
node --version
npm --version
python --version
pip --version
```

---

## 🔧 Step 1: Install Frontend Dependencies

1. Navigate to the frontend directory:
```bash
cd frontend/Plated
```

2. Install all npm packages:
```bash
npm install
```

**What this does:** Downloads all React, TypeScript, and other frontend dependencies listed in `package.json`.

**Expected output:** You should see packages being downloaded. This may take a few minutes.

---

## 🐍 Step 2: Install Backend Dependencies

1. Navigate to the backend directory (from project root):
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
# Windows
python -m venv venv

# Activate virtual environment
# Windows PowerShell
.\venv\Scripts\Activate.ps1

# Windows Command Prompt
venv\Scripts\activate.bat

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install Python packages:
```bash
pip install -r requirements.txt
```

**What this does:** Installs Flask, SQLAlchemy, Supabase, and other backend dependencies.

**Expected output:** You should see packages being installed. This may take a few minutes.

---

## 🎮 Step 3: Run Development Servers

You'll need **two terminal windows** - one for frontend and one for backend.

### Terminal 1: Frontend Development Server

```bash
# Navigate to frontend directory
cd frontend/Plated

# Start development server
npm run dev
```

**Expected output:**
```
  VITE v7.1.7  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Frontend will be available at:** `http://localhost:5173`

### Terminal 2: Backend Development Server

```bash
# Navigate to backend directory
cd backend

# Make sure virtual environment is activated (if using one)
# Windows PowerShell: .\venv\Scripts\Activate.ps1
# Windows CMD: venv\Scripts\activate.bat

# Start Flask server
python app.py
```

**Expected output:**
```
 * Running on http://0.0.0.0:5000
 * Debug mode: on
```

**Backend will be available at:** `http://localhost:5000`

---

## 👀 Step 4: View the Application

1. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

2. You should see the Plated landing page!

3. The frontend will automatically connect to the backend API at `http://localhost:5000`

---

## 🔍 Step 5: Run Preview (Production Build Preview)

To see what the production build would look like:

### Build the Frontend

```bash
# Navigate to frontend directory
cd frontend/Plated

# Build for production
npm run build
```

**What this does:** Creates an optimized production build in the `dist/` folder.

### Preview the Production Build

```bash
# Still in frontend/Plated directory
npm run preview
```

**Expected output:**
```
  ➜  Local:   http://localhost:4173/
```

**Preview will be available at:** `http://localhost:4173`

**Note:** The preview server shows the optimized production build, which is faster and smaller than the development build.

---

## 📝 Quick Reference Commands

### Frontend Commands
```bash
cd frontend/Plated

# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test
```

### Backend Commands
```bash
cd backend

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run development server
python app.py

# Or using Flask CLI (if configured)
flask run
```

---

## 🐛 Troubleshooting

### Frontend Issues

**Problem:** `npm install` fails
- **Solution:** Try deleting `node_modules` and `package-lock.json`, then run `npm install` again
- **Solution:** Make sure you have Node.js v18+ installed

**Problem:** Port 5173 already in use
- **Solution:** Kill the process using port 5173 or change the port in `vite.config.ts`

**Problem:** Module not found errors
- **Solution:** Make sure you ran `npm install` in the `frontend/Plated` directory

### Backend Issues

**Problem:** `pip install` fails
- **Solution:** Make sure Python is installed and accessible from command line
- **Solution:** Try `python -m pip install -r requirements.txt` instead

**Problem:** Port 5000 already in use
- **Solution:** Change the port in `app.py` or kill the process using port 5000

**Problem:** Import errors
- **Solution:** Make sure virtual environment is activated
- **Solution:** Verify all packages are installed: `pip list`

**Problem:** Database connection errors
- **Solution:** Check if you have environment variables set up (`.env` file)
- **Solution:** Verify Supabase credentials if using Supabase

### General Issues

**Problem:** CORS errors in browser console
- **Solution:** Make sure both frontend (port 5173) and backend (port 5000) are running
- **Solution:** Check CORS configuration in `backend/app.py`

**Problem:** Changes not reflecting
- **Solution:** Frontend: Vite hot-reloads automatically, just save your files
- **Solution:** Backend: Flask auto-reloads in debug mode, restart if needed

---

## 🎯 What You Should See

### Frontend (http://localhost:5173)
- Landing page with hero section
- Navigation bar
- Features section
- "How It Works" section
- Call-to-action buttons

### Backend (http://localhost:5000)
- Health check endpoint: `http://localhost:5000/health`
- API root: `http://localhost:5000/`
- User routes: `/login`, `/profile`, etc.
- Post routes: `/posts`, `/feed`, etc.

---

## 📚 Next Steps

1. **Explore the Frontend:**
   - Check out `frontend/Plated/src/pages/Landing.tsx` for the landing page
   - Explore other pages in `frontend/Plated/src/pages/`

2. **Explore the Backend:**
   - Check `backend/app.py` for the main Flask app
   - Look at routes in `backend/routes/` directory

3. **Make Changes:**
   - Frontend changes auto-reload (Vite hot module replacement)
   - Backend changes auto-reload (Flask debug mode)

4. **Test Features:**
   - Try logging in
   - Create a post
   - Browse the feed

---

## 💡 Pro Tips

1. **Keep Both Servers Running:** You need both frontend and backend running simultaneously for the app to work properly.

2. **Use VS Code Terminal:** Open integrated terminal in VS Code and split it into two panes (one for frontend, one for backend).

3. **Check Browser Console:** Press F12 to see any errors or warnings.

4. **Check Terminal Output:** Both servers will show errors and logs in their respective terminals.

5. **Environment Variables:** Make sure you have `.env` files set up if the backend requires API keys or database credentials.

---

## ✅ Success Checklist

- [ ] Frontend dependencies installed (`npm install` completed)
- [ ] Backend dependencies installed (`pip install` completed)
- [ ] Frontend dev server running (`npm run dev` - port 5173)
- [ ] Backend dev server running (`python app.py` - port 5000)
- [ ] Can access frontend at `http://localhost:5173`
- [ ] Can access backend at `http://localhost:5000`
- [ ] No errors in browser console (F12)
- [ ] No errors in terminal output

---

**Happy coding! 🎉**

If you encounter any issues not covered here, check the browser console (F12) and terminal output for error messages.

