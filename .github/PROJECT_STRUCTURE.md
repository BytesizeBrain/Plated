# 📁 Plated Project Structure

**Last Updated:** November 26, 2025

This document provides an overview of the Plated project structure and file organization.

---

## 🗂️ Root Directory

```
Plated-Testing-CC/
├── README.md                    # 📖 Main project documentation
├── .github/                     # GitHub-specific files
│   └── PROJECT_STRUCTURE.md    # This file
├── backend/                     # 🐍 Flask backend API
├── frontend/                    # ⚛️ React TypeScript frontend
├── docs/                        # 📚 All documentation
├── config/                      # ⚙️ Server configuration files
├── deploy.sh                    # 🚀 Deployment script
├── setup-all.ps1               # 📦 Complete setup script
├── start-backend.ps1           # 🔧 Start backend server
├── start-frontend.ps1          # 🔧 Start frontend server
├── start-local-dev.ps1         # 🔧 Start both servers
└── test-setup.ps1              # ✅ Verify development setup
```

---

## 📚 Documentation Structure (`docs/`)

```
docs/
├── README.md                    # Documentation index
├── setup/                       # 📦 Setup & Installation
│   └── QUICK_START_GUIDE.md    # Complete setup guide
├── testing/                     # 🧪 Testing & Development
│   ├── README_LOCAL_TESTING.md         # Main testing guide ⭐
│   ├── LOCAL_TESTING_QUICK_START.md    # Quick 3-step guide
│   └── START_LOCAL_TESTING.md          # Comprehensive guide
├── technical/                   # 🔧 Technical Documentation
│   ├── MOCK_AUTH_FLOW.md       # Authentication system
│   └── CHANGES_SUMMARY.md      # Recent changes
├── plans/                       # 📋 Project Planning
│   └── 2025-01-24-production-ready-plated.md
└── database/                    # 🗄️ Database Schemas
    └── supabase_schema.sql     # Complete database schema
```

---

## 🐍 Backend Structure (`backend/`)

```
backend/
├── app.py                       # Main Flask application
├── extensions.py                # Flask extensions & config
├── supabase_client.py          # Supabase connection
├── requirements.txt             # Python dependencies
├── env.development.local        # Development environment vars
├── routes/                      # 🛣️ API Endpoints
│   ├── __init__.py
│   ├── user_routes.py          # User & auth endpoints
│   ├── posts_routes.py         # Post CRUD endpoints
│   ├── engagement_routes.py    # Likes, comments, saves
│   ├── social_routes.py        # Follow/unfollow
│   ├── messages_routes.py      # Direct messaging
│   ├── gamification_routes.py  # XP, badges, challenges
│   ├── recipes.py              # Recipe-specific endpoints
│   └── tags.py                 # Tag management
├── models/                      # 📊 Database Models
│   ├── user_model.py           # User model (SQLAlchemy)
│   └── recipe_model.py         # Recipe model
├── services/                    # 💼 Business Logic
│   └── storage_service.py      # File upload service
├── tests/                       # ✅ Backend Tests
│   ├── test_post_creation.py
│   ├── test_engagement.py
│   └── test_check_username.py
├── instance/                    # 💾 Local SQLite DB
│   └── users.db
└── venv/                        # 🐍 Python virtual environment
```

---

## ⚛️ Frontend Structure (`frontend/Plated/`)

```
frontend/Plated/
├── package.json                 # Node dependencies
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config
├── index.html                  # HTML entry point
├── README.md                   # Frontend README
├── README_DEV.md               # Developer notes
├── src/                        # 📝 Source Code
│   ├── main.tsx                # Application entry point
│   ├── App.tsx                 # Root component
│   ├── pages/                  # 📄 Page Components
│   │   ├── Landing.tsx         # Landing page
│   │   ├── Login.tsx           # Login page
│   │   ├── Register.tsx        # Registration page
│   │   ├── Profile.tsx         # User profile
│   │   ├── ExplorePage.tsx     # Explore/search
│   │   ├── SavedPostsPage.tsx  # Saved posts
│   │   ├── CreatePostPage.tsx  # Create post
│   │   ├── feed/               # Feed page
│   │   ├── messages/           # Messages page
│   │   ├── challenges/         # Challenges page
│   │   └── cook/               # Cook mode page
│   ├── components/             # 🧩 Reusable Components
│   │   ├── feed/               # Feed-related components
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostEngagement.tsx
│   │   │   ├── CommentSection.tsx
│   │   │   ├── FeedFilters.tsx
│   │   │   └── FeedModeToggle.tsx
│   │   ├── gamification/       # Gamification components
│   │   ├── messages/           # Message components
│   │   ├── navigation/         # Navigation components
│   │   ├── common/             # Common utilities
│   │   ├── ChatbotPopup.tsx    # AI cooking assistant
│   │   └── ProtectedRoute.tsx  # Auth guard
│   ├── stores/                 # 🗄️ State Management (Zustand)
│   │   ├── feedStore.ts        # Feed state
│   │   ├── messageStore.ts     # Messages state
│   │   └── gamificationStore.ts # Gamification state
│   ├── utils/                  # 🛠️ Utilities
│   │   ├── api.ts              # API client & fallbacks
│   │   ├── auth.ts             # Authentication helpers
│   │   └── performance.ts      # Performance utilities
│   ├── api/                    # 📡 API Layer
│   │   ├── client.ts           # Base API client
│   │   ├── auth.ts             # Auth API calls
│   │   ├── users.ts            # User API calls
│   │   ├── posts.ts            # Post API calls
│   │   ├── recipes.ts          # Recipe API calls
│   │   └── types.ts            # TypeScript types
│   ├── data/                   # 📊 Mock Data
│   │   ├── mockData.ts         # Mock posts & users
│   │   └── mockGamificationData.ts
│   └── types.ts                # Global TypeScript types
├── public/                     # 📦 Static Assets
│   ├── landingPageVideo.mp4
│   └── vite.svg
└── dist/                       # 🏗️ Production Build Output
```

---

## ⚙️ Configuration Files

### Root Configuration
- `deploy.sh` - Production deployment script
- `.gitignore` - Git ignore rules
- `.env` files - Environment variables (git-ignored)

### Backend Configuration
- `backend/env.development.local` - Local development environment
- `backend/requirements.txt` - Python package dependencies
- `backend/venv/` - Python virtual environment

### Frontend Configuration
- `frontend/Plated/vite.config.ts` - Vite build configuration
- `frontend/Plated/tsconfig.json` - TypeScript compiler options
- `frontend/Plated/package.json` - Node.js dependencies
- `frontend/Plated/.env.local` - Local environment overrides

### Server Configuration
- `config/nginx_defualt.conf` - Nginx reverse proxy config

---

## 🚀 Executable Scripts

| Script | Location | Purpose |
|--------|----------|---------|
| `test-setup.ps1` | Root | Verify development environment setup |
| `setup-all.ps1` | Root | Install all dependencies (first-time setup) |
| `start-backend.ps1` | Root | Start Flask backend on port 5000 |
| `start-frontend.ps1` | Root | Start Vite frontend on port 5173 |
| `start-local-dev.ps1` | Root | Start both servers simultaneously |
| `deploy.sh` | Root | Deploy to production server |

---

## 📝 Key Files

### Essential Documentation
- **Main README:** `README.md` - Project overview and quick start
- **Docs Index:** `docs/README.md` - Complete documentation guide
- **Quick Start:** `docs/setup/QUICK_START_GUIDE.md` - Setup instructions
- **Testing Guide:** `docs/testing/README_LOCAL_TESTING.md` - Local testing

### Configuration
- **Backend Env:** `backend/env.development.local` - Backend environment variables
- **Frontend Env:** `frontend/Plated/.env.local` - Frontend environment variables
- **Database Schema:** `docs/database/supabase_schema.sql` - Complete DB schema

### Entry Points
- **Backend:** `backend/app.py` - Flask application entry
- **Frontend:** `frontend/Plated/src/main.tsx` - React application entry

---

## 🗄️ Database Structure

### Tables (Supabase PostgreSQL)
- `user` - User accounts and profiles
- `posts` - Post content (simple & recipe posts)
- `likes` - Post likes
- `comments` - Post comments
- `saved_posts` - Bookmarked posts
- `post_views` - Post view tracking
- `followers` - User follow relationships
- `follow_requests` - Pending follow requests
- `conversations` - DM conversations
- `messages` - Direct messages
- `challenges` - Cooking challenges
- `challenge_participants` - Challenge enrollment
- `user_gamification` - XP, level, coins, badges
- `achievements` - Achievement definitions
- `user_achievements` - Unlocked achievements
- `recipes` - Legacy recipe table
- `tags` - Content tags
- `recipe_tags` - Tag associations

**Full schema:** See `docs/database/supabase_schema.sql`

---

## 🎨 Frontend Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Landing.tsx` | Landing page for new visitors |
| `/login` | `Login.tsx` | Login with Google or mock auth |
| `/register` | `Register.tsx` | Complete profile after OAuth |
| `/profile` | `Profile.tsx` | User profile page |
| `/feed` | `FeedPage.tsx` | Main feed with posts |
| `/explore` | `ExplorePage.tsx` | Search and discover |
| `/saved` | `SavedPostsPage.tsx` | Bookmarked posts |
| `/create` | `CreatePostPage.tsx` | Create new post |
| `/messages` | `DirectMessagesPage.tsx` | Direct messaging |
| `/challenges` | `ChallengesPage.tsx` | Cooking challenges |
| `/cook` | `CookModePage.tsx` | Step-by-step cooking mode |

---

## 📦 Dependencies

### Backend (Python)
- Flask - Web framework
- Flask-SQLAlchemy - ORM for local DB
- Flask-CORS - Cross-origin resource sharing
- Authlib - OAuth implementation
- PyJWT - JWT token handling
- Supabase - Database & storage client
- Python-dotenv - Environment variables
- Pytest - Testing framework

### Frontend (Node.js)
- React 18 - UI framework
- TypeScript - Type safety
- Vite - Build tool & dev server
- React Router - Routing
- Zustand - State management
- Axios - HTTP client
- Date-fns - Date utilities
- Vitest - Testing framework

---

## 🔍 Finding Things

### "Where is the...?"

**API endpoint for likes:**
→ `backend/routes/engagement_routes.py`

**Feed page component:**
→ `frontend/Plated/src/pages/feed/FeedPage.tsx`

**Database schema:**
→ `docs/database/supabase_schema.sql`

**Authentication flow:**
→ `docs/technical/MOCK_AUTH_FLOW.md`

**Setup instructions:**
→ `docs/setup/QUICK_START_GUIDE.md`

**Testing guide:**
→ `docs/testing/README_LOCAL_TESTING.md`

**Project roadmap:**
→ `docs/plans/2025-01-24-production-ready-plated.md`

---

## 🧹 Cleanup Rules

### What belongs in root:
- `README.md` - Main documentation
- `*.ps1` - Executable PowerShell scripts
- `deploy.sh` - Deployment script
- Configuration folders (`backend/`, `frontend/`, `docs/`, `config/`)

### What goes in `docs/`:
- All `.md` documentation files (except root README)
- Organized into subdirectories by purpose

### What doesn't belong in root:
- Random `.css` files → Move to appropriate component
- Temporary test files → Delete or move to tests folder
- Old scripts → Archive or delete

---

## 💡 Best Practices

1. **Documentation:** Keep all `.md` files in `docs/` (except root README)
2. **Scripts:** Executable scripts stay in root for easy access
3. **Environment:** Never commit `.env` files (git-ignored)
4. **Dependencies:** Update `requirements.txt` / `package.json` when adding packages
5. **Structure:** Follow the established folder structure
6. **Naming:** Use clear, descriptive names for files and folders

---

**For more information, see [`docs/README.md`](../docs/README.md)**

