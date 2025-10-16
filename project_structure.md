# 📂 Plated Project Structure - Visual Guide

## 🗺️ Complete Project Map

Think of your project like an **office building**:
- Each folder is a **department**
- Each file is a **document** in that department
- The structure keeps everything organized

```
plated/
│
├── 📁 backend/                    # The Server (Flask)
│   ├── 📁 routes/                # URL endpoints (like restaurant menu)
│   │   └── user_routes.py        # User authentication routes
│   ├── 📁 models/                # Database structure (like filing cabinets)
│   │   └── user_model.py         # User data schema
│   ├── 📁 static/                # Images, CSS, JS (public assets)
│   ├── 📁 templates/             # HTML templates (old school)
│   ├── app.py                    # Main server file (the engine)
│   ├── extensions.py             # Database & config setup
│   └── requirements.txt          # Python dependencies (shopping list)
│
└── 📁 frontend/Plated/            # The Client (React)
    ├── 📁 src/                   # Source code (where magic happens)
    │   ├── 📁 components/        # Reusable UI pieces
    │   │   └── ProtectedRoute.tsx
    │   ├── 📁 pages/             # Full page components
    │   │   ├── Landing.tsx       # ⭐ NEW: Landing page
    │   │   ├── Landing.css       # ⭐ NEW: Landing styles
    │   │   ├── Login.tsx         # Login page
    │   │   ├── Register.tsx      # Registration page
    │   │   └── Profile.tsx       # User profile page
    │   ├── 📁 utils/             # Helper functions
    │   │   ├── api.ts            # API calls to backend
    │   │   └── auth.ts           # Authentication helpers
    │   ├── 📁 assets/            # Images, icons
    │   ├── App.tsx               # Main app router (updated)
    │   ├── App.css               # Global styles
    │   ├── types.ts              # TypeScript definitions
    │   └── main.tsx              # Entry point (start here)
    │
    ├── 📁 public/                # Static assets (available to browser)
    ├── index.html                # HTML shell
    ├── package.json              # Dependencies & scripts
    ├── tsconfig.json             # TypeScript config
    └── vite.config.ts            # Vite bundler config
```

---

## 🎯 Focus: Where You'll Work

### ✨ New Files You Created

```
frontend/Plated/src/pages/
├── Landing.tsx          # Landing page component (React)
└── Landing.css          # Landing page styles (CSS)
```

### 📝 Modified Files

```
frontend/Plated/src/
└── App.tsx              # Added landing page route
```

---

## 🧩 How Files Connect (Data Flow)

Think of this like a **mail delivery system**:

```
User Browser
    ↓
index.html (shell)
    ↓
main.tsx (entry point)
    ↓
App.tsx (router - decides which page to show)
    ↓
    ├─→ Landing.tsx (homepage)
    ├─→ Login.tsx (login page)
    ├─→ Register.tsx (signup page)
    └─→ Profile.tsx (user dashboard)
```

### Example User Journey:

```
1. User visits: localhost:5173/
   ↓
2. App.tsx sees "/" route
   ↓
3. Renders: Landing.tsx
   ↓
4. User clicks "Start Cooking Free"
   ↓
5. Landing.tsx calls: navigate('/login')
   ↓
6. App.tsx sees "/login" route
   ↓
7. Renders: Login.tsx
   ↓
8. User clicks "Continue with Google"
   ↓
9. Redirects to: backend/login (Flask)
   ↓
10. Google OAuth flow...
```

---

## 📦 Understanding Package Files

### package.json
**Purpose:** Lists all dependencies (like a shopping list)

**Analogy:** Like a cookbook's ingredient list
```json
{
  "dependencies": {
    "react": "^19.1.1",        // The main framework
    "react-router-dom": "^7.9.3" // Navigation
  }
}
```

### tsconfig.json
**Purpose:** TypeScript compiler settings

**Analogy:** Like grammar rules for your code
- Catches errors before runtime
- Enforces type safety

### vite.config.ts
**Purpose:** Build tool configuration

**Analogy:** Like oven settings for baking
- Hot reload speed
- Build optimizations
- Plugin configuration

---

## 🔧 File Naming Conventions

### React Components
```
Landing.tsx         ✅ PascalCase for components
landing.tsx         ❌ Wrong
LANDING.tsx         ❌ Wrong
```

### CSS Files
```
Landing.css         ✅ Matches component name
styles.css          ⚠️ Too generic
landing-page.css    ⚠️ Not conventional
```

### Utility Files
```
auth.ts             ✅ lowercase for utilities
api.ts              ✅ lowercase for utilities
Auth.ts             ❌ Components only
```

---

## 🎨 Styling Architecture

### CSS Organization

```
Landing.css
│
├── Root Variables (Design System)
│   ├── Colors
│   ├── Spacing
│   ├── Typography
│   └── Shadows
│
├── Global Styles
│   └── Base styles for .landing-page
│
├── Component Sections
│   ├── Navigation (.landing-nav)
│   ├── Hero (.hero-section)
│   ├── Features (.features-section)
│   ├── How It Works (.how-it-works-section)
│   ├── CTA (.cta-section)
│   └── Footer (.landing-footer)
│
├── Reusable Components
│   ├── Buttons (.btn-primary, .btn-large)
│   └── Cards (.feature-card)
│
└── Responsive Rules
    ├── Tablet (< 1024px)
    ├── Mobile (< 768px)
    └── Small Mobile (< 480px)
```

**Analogy:** Like organizing a toolbox
- Top drawer: Most-used tools (variables)
- Middle drawers: Specific tools (components)
- Bottom drawer: Special situations (responsive)

---

## 🔄 Development Workflow

### Daily Development Process

```
1. Open Terminal
   cd frontend/Plated

2. Start Dev Server
   npm run dev
   
3. Open Browser
   http://localhost:5173
   
4. Make Changes
   - Edit Landing.tsx or Landing.css
   - Save file (Ctrl+S / Cmd+S)
   
5. See Changes
   - Browser auto-refreshes
   - Check for errors in console (F12)
   
6. Test Features
   - Click buttons
   - Check mobile view
   - Test navigation
   
7. Commit Changes (when ready)
   git add .
   git commit -m "Add landing page"
   git push
```

---

## 📱 Testing Checklist

### Desktop Testing (Chrome/Firefox)
- [ ] Page loads without errors
- [ ] All sections visible
- [ ] Buttons are clickable
- [ ] Navigation works
- [ ] Animations trigger on scroll
- [ ] Text is readable

### Mobile Testing (DevTools)
- [ ] Layout adjusts for small screens
- [ ] Buttons are easily tappable
- [ ] Text size is readable
- [ ] Images scale properly
- [ ] Navigation is accessible

### Performance Testing
- [ ] Page loads under 3 seconds
- [ ] No console errors
- [ ] Animations are smooth
- [ ] Images are optimized

---

## 🚀 Quick Start Commands

### First Time Setup
```bash
# Navigate to frontend
cd frontend/Plated

# Install dependencies
npm install

# Start development server
npm run dev
```

### Daily Development
```bash
# Start dev server (if not running)
npm run dev

# Build for production (later)
npm run build

# Preview production build
npm run preview
```

### Troubleshooting
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear cache and restart
npm cache clean --force
npm run dev
```

---

## 🎓 Understanding Import Statements

### Component Imports
```typescript
// Importing React libraries
import { useState, useEffect } from 'react';
// └─ Named imports from 'react' package

// Importing router
import { useNavigate } from 'react-router-dom';
// └─ Named import for navigation

// Importing your components
import Landing from './pages/Landing';
// └─ Default import from local file
```

**Analogy:** Like including ingredients in a recipe
- `from 'react'` = From the pantry (node_modules)
- `from './pages/Landing'` = From your own kitchen (project files)

### CSS Imports
```typescript
import './Landing.css';
// └─ Side-effect import (loads styles)
```

**Why no variable?** CSS doesn't export anything, it just applies styles globally.

---

## 🔑 Key Concepts Recap

### 1. **Component = Building Block**
Each `.tsx` file is a reusable piece of UI

**Example:**
```typescript
function Landing() {
  return <div>Content here</div>;
}
```

### 2. **Props = Parameters**
Pass data from parent to child

**Example:**
```typescript
<Button text="Click me" onClick={handleClick} />
```

### 3. **State = Memory**
Component's data that can change

**Example:**
```typescript
const [isOpen, setIsOpen] = useState(false);
```

### 4. **CSS Selectors = Targeting**
Apply styles to specific elements

**Example:**
```css
.hero-section {      /* Class selector */
  background: blue;
}

#main-nav {          /* ID selector */
  position: fixed;
}

button:hover {       /* Pseudo-class */
  transform: scale(1.1);
}
```

---

## 🎯 Next Steps

### Immediate (Today)
1. ✅ Create Landing.tsx
2. ✅ Create Landing.css
3. ✅ Update App.tsx
4. ✅ Test in browser

### Short-term (This Week)
1. Add real content and images
2. Test on different devices
3. Get feedback from users
4. Iterate on design

### Long-term (Next Month)
1. Add more pages (About, FAQ, etc.)
2. Implement analytics
3. A/B test different versions
4. Prepare for deployment

---

## 💡 Pro Tips

### VS Code Tips
```
Cmd/Ctrl + P          = Quick file search
Cmd/Ctrl + Shift + F  = Search across files
Cmd/Ctrl + /          = Comment/uncomment
Alt + Up/Down         = Move line up/down
Shift + Alt + Down    = Duplicate line
```

### Browser DevTools
```
F12                   = Open DevTools
Cmd/Ctrl + Shift + C  = Inspect element
Cmd/Ctrl + Shift + M  = Toggle device toolbar
Cmd/Ctrl + R          = Refresh page
Cmd/Ctrl + Shift + R  = Hard refresh (bypass cache)
```

### Git Commands
```bash
git status            # Check what changed
git add .             # Stage all changes
git commit -m "msg"   # Commit with message
git push              # Push to remote
git pull              # Pull latest changes
```

---

## 📚 Learning Path

### Beginner Level
1. ✅ HTML structure (what you see)
2. ✅ CSS styling (how it looks)
3. ✅ JavaScript basics (how it behaves)
4. 🔄 React components (reusable pieces)

### Intermediate Level
1. 🔄 React hooks (useState, useEffect)
2. ⏭️ TypeScript (type safety)
3. ⏭️ React Router (navigation)
4. ⏭️ State management (Zustand/Redux)

### Advanced Level
1. ⏭️ Performance optimization
2. ⏭️ Testing (Jest, React Testing Library)
3. ⏭️ Deployment (Vercel, AWS)
4. ⏭️ CI/CD pipelines

**Legend:**
- ✅ = You know this
- 🔄 = Currently learning
- ⏭️ = Future learning

---

## 🆘 Common Issues & Solutions

### Issue: Import errors
```
Error: Cannot find module './Landing'
```
**Solution:** Check file path and extension
```typescript
// ❌ Wrong
import Landing from './Landing';

// ✅ Correct
import Landing from './pages/Landing';
```

### Issue: Styles not applying
```
Elements exist but have no styling
```
**Solution:** Import CSS file
```typescript
// Add this at top of Landing.tsx
import './Landing.css';
```

### Issue: TypeScript errors
```
Type 'string' is not assignable to type 'number'
```
**Solution:** Check your types
```typescript
// ❌ Wrong
const age: number = "25";

// ✅ Correct
const age: number = 25;
```

---

*Keep this guide handy as you develop. Happy coding! 🚀*