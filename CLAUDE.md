# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 📚 CRITICAL DOCUMENTATION PATTERN

**ALWAYS ADD IMPORTANT DOCS HERE!** When you create or discover:
- Architecture diagrams → Add reference path here
- Database schemas → Add reference path here
- Problem solutions → Add reference path here
- Setup guides → Add reference path here

This prevents context loss! Update this file IMMEDIATELY when creating important docs.

### Key Documentation Index

**Database & Schema:**
- `docs/database/supabase_schema.sql` - Complete Supabase PostgreSQL schema
- See "Critical Schema Differences" section below for Supabase quirks

**Setup & Getting Started:**
- `docs/setup/QUICK_START_GUIDE.md` - Initial setup instructions
- `docs/testing/README_LOCAL_TESTING.md` - Local testing guide with mock auth
- `frontend/Plated/README_DEV.md` - Frontend dev server troubleshooting

**Architecture & Plans:**
- `docs/plans/2025-01-24-production-ready-plated.md` - Full implementation plan (100% complete)
- This file (CLAUDE.md) - Architecture overview and critical patterns

**Deployment (CRITICAL):**
- `DEPLOYMENT_RULES_QUICKREF.md` - **READ BEFORE EVERY DEPLOYMENT** (quick checklist)
- `docs/deployment/DEPLOYMENT_CRITICAL_RULES.md` - Full deployment rules and guidelines
- `.editorconfig` - Line ending enforcement (LF for .sh files)

**Authentication:**
- `docs/technical/MOCK_AUTH_FLOW.md` - Mock authentication for testing

**Configuration Examples:**
- `backend/.env.example` - Backend environment variables template
- `frontend/Plated/.env.example` - Frontend environment variables template

**Quick Fixes & Troubleshooting:**
- `QUICK_FIX_GUIDE.md` - Local dev issues (backend not running, white screens)

## Project Overview

Plated is a social recipe platform that combines social media engagement with gamification to make cooking addictive for young adults. The platform features post creation (simple and recipe posts), likes/comments/saves, direct messaging, user follows, and gamification elements (XP, badges, streaks, challenges).

**Status:** Production-ready MVP (100% complete as of 2025-01-26)

## Architecture

### Dual-Database Architecture (CRITICAL)

This project uses **two separate databases**:

1. **SQLite** (`backend/users.db`) - Local user authentication only
   - Managed by SQLAlchemy ORM
   - Models in `backend/models/user_model.py`
   - Only for OAuth sessions and JWT tokens
   - Tables: `user` (id, email, username, display_name, profile_pic, password, bio, location)

2. **Supabase PostgreSQL** - All application data
   - Direct Supabase client in `backend/supabase_client.py`
   - All posts, comments, likes, saves, follows, messages, gamification data
   - Schema in `docs/database/supabase_schema.sql`

**NEVER mix the two:** User auth queries use SQLAlchemy `db.session`, everything else uses `supabase` client.

### Environment Configuration Pattern

The backend uses a **two-stage environment loading** pattern:

1. First loads `backend/.env` (production/shared config)
2. Then **optionally overrides** with `backend/env.development.local` (local dev only)

**Files:**
- `backend/extensions.py` - Flask initialization, loads env vars
- `backend/supabase_client.py` - Supabase initialization, loads env vars
- Both use identical loading logic

**CRITICAL DEPLOYMENT RULE:** `env.development.local` MUST NOT exist in production. See `DEPLOYMENT_RULES_QUICKREF.md`.

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite build tool
- Zustand for state management (stores in `frontend/Plated/src/stores/`)
- React Router v6 with lazy loading
- Axios-style API client (custom implementation in `frontend/Plated/src/api/client.ts`)
- CSS Modules for styling

**Backend:**
- Flask with Blueprint architecture
- SQLAlchemy for user auth (local SQLite)
- Supabase client for all app data (PostgreSQL)
- Google OAuth + JWT authentication
- Supabase Storage for images

**Database:**
- Supabase PostgreSQL (primary data store)
- SQLite (local auth only)

## Common Commands

### Development

```powershell
# Start both servers (Windows/PowerShell)
.\start-local-dev.ps1

# Start backend only (runs on http://localhost:5000)
.\start-backend.ps1
# Or manually:
cd backend
.\venv\Scripts\Activate.ps1
python app.py

# Start frontend only (runs on http://localhost:5173)
.\start-frontend.ps1
# Or manually:
cd frontend/Plated
npm run dev

# Test environment setup
.\test-setup.ps1
```

### Testing

```powershell
# Backend tests (uses pytest)
cd backend
.\venv\Scripts\Activate.ps1
pytest                           # All tests
pytest tests/test_posts.py       # Single file
pytest -k "test_like"            # By keyword
pytest -v                        # Verbose

# Frontend tests (uses Vitest)
cd frontend/Plated
npm test                         # Watch mode
npm run test:run                 # Run once
npm run test:coverage            # With coverage
npm run test:ui                  # UI mode
```

### Linting & Building

```powershell
# Frontend
cd frontend/Plated
npm run lint                     # ESLint
npm run build                    # TypeScript compile + Vite build

# Backend
cd backend
# No linter configured - follow PEP 8 manually
```

### Database Operations

```powershell
# Check Supabase connection
cd backend
python check_supabase_env.py     # Verify env vars
python test_supabase.py          # Test connection

# List all backend routes
python list_routes.py

# Check local SQLite database
python check_db.py

# Seed data (if needed)
python seed_data.py
```

## Code Architecture

### Frontend Structure

```
frontend/Plated/src/
├── pages/                    # Page-level components (lazy loaded)
│   ├── feed/FeedPage.tsx    # Main feed with infinite scroll
│   ├── CreatePostPage.tsx   # Post creation (simple/recipe modes)
│   ├── messages/            # DM interface
│   └── ...
├── components/              # Reusable components
│   ├── feed/                # PostCard, CommentSection, PostEngagement
│   ├── navigation/          # BottomNav
│   ├── messages/            # ChatWindow, MessageThread
│   ├── gamification/        # XPBar, BadgeGrid, StreakFlame
│   └── common/              # LazyImage
├── stores/                  # Zustand state management
│   ├── feedStore.ts         # Posts, filters, pagination
│   ├── messageStore.ts      # Conversations, messages
│   └── gamificationStore.ts # XP, coins, badges, streaks
├── api/                     # Backend communication
│   ├── client.ts            # Base API request function
│   ├── posts.ts             # Post CRUD operations
│   ├── auth.ts              # Login/register
│   └── users.ts             # User profiles
└── utils/                   # Utilities
    ├── auth.ts              # JWT token management
    └── performance.ts       # Debounce, throttle
```

### Backend Structure

```
backend/
├── routes/                  # Blueprint endpoints
│   ├── user_routes.py       # Auth, profile (no prefix)
│   ├── posts_routes.py      # /api/posts, /api/feed, /api/create_post
│   ├── engagement_routes.py # /api/likes, /api/comments, /api/saves
│   ├── social_routes.py     # /api/follow, /api/unfollow
│   ├── messages_routes.py   # /api/conversations, /api/messages
│   └── gamification_routes.py # /api/gamification/*
├── models/                  # SQLAlchemy models (LOCAL DB ONLY)
│   └── user_model.py        # User model for auth
├── services/                # Business logic
│   └── storage_service.py   # Supabase Storage uploads
├── extensions.py            # Flask app initialization
├── supabase_client.py       # Supabase client singleton
└── app.py                   # Main entry point
```

**Blueprint Registration:**
- `users_bp` - No prefix (e.g., `/login`, `/profile`)
- All others - `/api` prefix (e.g., `/api/posts`)

### State Management Pattern

Frontend uses **Zustand stores** with optimistic updates:

1. **User action** → Immediate UI update via store
2. **API call** → Background request
3. **On success** → No change (already updated)
4. **On error** → Revert optimistic update

Example from `feedStore.ts`:
```typescript
toggleLike: (postId) => set((state) => ({
  posts: state.posts.map((post) =>
    post.id === postId
      ? {
          ...post,
          is_liked: !post.is_liked,
          likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1,
        }
      : post
  ),
}))
```

### API Request Pattern

Frontend uses a custom `apiRequest` function (not Axios):

```typescript
// frontend/Plated/src/api/client.ts
apiRequest<T>(path: string, {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
  token?: string,  // JWT from localStorage
  headers?: Record<string, string>
}): Promise<T>
```

**Features:**
- Automatic JSON serialization (except FormData)
- JWT token injection
- Credentials included (for cookies)
- Type-safe responses

### Backend Database Query Patterns

**For Supabase queries (all app data):**
```python
from supabase_client import supabase

# Insert
response = supabase.table('posts').insert({
    'user_id': user_id,
    'content': content
}).execute()

# Select with joins
posts = supabase.table('posts')\
    .select('*, user:users(username, display_name, profile_pic)')\
    .eq('id', post_id)\
    .execute()

# Update
supabase.table('posts')\
    .update({'content': new_content})\
    .eq('id', post_id)\
    .execute()
```

**For local user auth (SQLite only):**
```python
from extensions import db
from models.user_model import User

# Query
user = User.query.filter_by(email=email).first()

# Create
new_user = User(email=email, username=username)
db.session.add(new_user)
db.session.commit()
```

### Authentication Flow

1. **Google OAuth** → User redirects to Google
2. **Callback** → Backend receives OAuth code
3. **User creation** → Save to both databases:
   - SQLAlchemy `User` model → local SQLite
   - Supabase `users` table → PostgreSQL
4. **JWT token** → Issued to frontend
5. **Frontend** → Stores token in `localStorage`, includes in API requests

**Mock auth** available for testing (bypasses Google OAuth).

## Critical Schema Differences

The Supabase database has these differences from planning docs:

1. **`comments` table:**
   - Uses `text` column (NOT `content`)

2. **`posts` table:**
   - `image_url` is NULLABLE
   - `user_id` uses `gen_random_uuid()` default

3. **`user_gamification` table:**
   - Missing `updated_at` column
   - Only has `created_at`

**Always verify schema with:** `docs/database/supabase_schema.sql`

## Image Upload Flow

1. Frontend sends `multipart/form-data` with `image` field
2. Backend endpoint receives file via `request.files['image']`
3. `StorageService.upload_post_image()` handles upload:
   - Validates extension (png, jpg, jpeg, gif, webp)
   - Generates unique filename with UUID
   - Uploads to Supabase Storage bucket `post-images`
   - Returns public URL
4. URL stored in Supabase `posts.image_url` column

**Bucket:** `post-images`
**Path pattern:** `posts/{uuid}.{ext}`
**Max size:** 10MB

## Testing Patterns

### Backend Tests (pytest)

Located in `backend/tests/`, uses TDD approach.

**Test structure:**
```python
def test_create_post_success(mock_supabase):
    """Test successful post creation"""
    # Arrange
    mock_supabase.table().insert().execute.return_value = MagicMock(...)

    # Act
    response = client.post('/api/create_post', json={...})

    # Assert
    assert response.status_code == 201
```

**Run specific test:**
```bash
pytest tests/test_posts.py::test_create_post_success -v
```

### Frontend Tests (Vitest)

Located in `frontend/Plated/src/__tests__/`.

**Test structure:**
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('PostCard', () => {
  it('renders post content', () => {
    render(<PostCard post={mockPost} />)
    expect(screen.getByText(mockPost.content)).toBeInTheDocument()
  })
})
```

**Setup file:** `frontend/Plated/src/__tests__/setup.ts`

## Deployment

**CRITICAL:** This project has specific deployment rules due to production incidents.

**Pre-deployment checks:**
```bash
# 1. Verify deploy.sh has Unix line endings (LF, not CRLF)
file deploy.sh | grep "LF"

# 2. Ensure env.development.local does NOT exist
! ls backend/env.development.local 2>/dev/null
```

**See full rules:** `DEPLOYMENT_RULES_QUICKREF.md`

The project deploys to a DigitalOcean Droplet with GitHub Actions (`.github/workflows/deploy.yml`).

## Environment Variables

**Backend** requires:
- `SECRET_KEY` - Flask session secret
- `CLIENT_ID` / `CLIENT_SECRET` - Google OAuth credentials
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` - Supabase connection
- `FRONTEND_URL` - CORS configuration
- `FLASK_ENV` - Set to `production` in deployment

**Frontend** requires:
- `VITE_API_BASE_URL` - Backend URL (default: `http://localhost:5000`)
- `VITE_AUTH_MODE` - Set to `oauth` or `mock`

**Example files:**
- `backend/.env.example`
- `frontend/Plated/.env.example`

## Key Development Patterns

### Adding a New Endpoint

1. **Write tests first** (TDD approach - see `backend/tests/`)
2. **Create route** in appropriate blueprint (`backend/routes/`)
3. **Use Supabase client** for data operations (not SQLAlchemy)
4. **Return JSON** with consistent format: `{'data': ..., 'message': ...}`
5. **Handle errors** with try/except and appropriate status codes

### Adding a New Page

1. **Create page component** in `frontend/Plated/src/pages/`
2. **Add lazy import** in `App.tsx`
3. **Add route** to `<Routes>` in `App.tsx`
4. **Create API functions** in `frontend/Plated/src/api/`
5. **Add state management** in appropriate store if needed

### Adding a New Feature with State

1. **Extend Zustand store** in `frontend/Plated/src/stores/`
2. **Add API calls** in `frontend/Plated/src/api/`
3. **Implement optimistic updates** in store actions
4. **Use store** in components via `const { action } = useStore()`

## Common Gotchas

1. **Two databases:** Don't use SQLAlchemy for posts/comments/etc. Use Supabase client.
2. **Column names:** `followers.following_id` and `comments.text` differ from docs.
3. **CORS:** Backend allows multiple localhost ports (5173, 5174, 5175) for parallel dev.
4. **File uploads:** Must use `FormData`, not JSON, for image uploads.
5. **JWT tokens:** Stored in `localStorage`, passed via `Authorization: Bearer {token}` header.
6. **Line endings:** Shell scripts MUST use LF (Unix), not CRLF (Windows).
7. **Environment overrides:** `env.development.local` takes precedence over `.env` locally.
8. **Blueprint prefixes:** Only `users_bp` has no prefix; all others use `/api`.
9. **Production URLs:** NEVER hardcode `localhost` or port numbers in fetch/axios calls. Always use `API_BASE_URL` from `utils/api.ts` or the axios instance.
10. **Production builds:** Run `npm run build` and serve from `dist/`, NEVER run `npm run dev` in production.
11. **Error boundaries:** No error boundary exists in App.tsx - unhandled errors cause white screens.

## Documentation

All docs in `docs/` folder:
- `docs/setup/QUICK_START_GUIDE.md` - Getting started
- `docs/testing/README_LOCAL_TESTING.md` - Testing guide
- `docs/plans/2025-01-24-production-ready-plated.md` - Implementation plan & status
- `docs/database/supabase_schema.sql` - Complete database schema
- `docs/deployment/CRITICAL_DEPLOYMENT_ISSUES.md` - Known deployment issues

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `test-setup.ps1` | Verify dev environment (Node, Python, ports) |
| `start-backend.ps1` | Start Flask backend on port 5000 |
| `start-frontend.ps1` | Start Vite frontend on port 5173 |
| `start-local-dev.ps1` | Start both servers in parallel |

All scripts are PowerShell (`.ps1`) for Windows development.
