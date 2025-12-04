# 🍳 Plated - Social Recipe Platform

**Making cooking addictive through social engagement and gamification**

[![Status](https://img.shields.io/badge/Status-In%20Development-yellow)]()
[![Backend](https://img.shields.io/badge/Backend-Flask-blue)]()
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-blue)]()
[![Database](https://img.shields.io/badge/Database-Supabase-green)]()

---

## 🎯 The Problem

Cooking is not popular among young adults. Traditional recipe apps are boring, isolated experiences that don't resonate with a generation raised on social media and gamification.

## 💡 Our Solution

Plated transforms cooking into an **addictive social experience** by incorporating:
- 📱 **Social Media Features** - Share, like, comment on recipes
- 🎮 **Gamification** - Challenges, XP, badges, and streaks
- 👥 **Community Engagement** - Follow friends, discover viral recipes
- 🎯 **Budget-Friendly** - Get ingredient lists and recipes within your budget

## ✨ Key Features

- **Post & Share** - Create simple posts or detailed recipe posts with ingredients and instructions
- **Engagement System** - Like, comment, save, and share recipes
- **Social Network** - Follow users, build your cooking community
- **Direct Messaging** - Chat with other home chefs
- **Cook Mode** - Step-by-step cooking assistant
- **Challenges** - Weekly cooking challenges to keep things fun
- **Gamification** - Earn XP, unlock badges, maintain cooking streaks

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Python 3.8+
- Git

### Get Running in 3 Steps

```powershell
# 1. Clone the repository
git clone https://github.com/yourusername/Plated-Testing-CC.git
cd Plated-Testing-CC

# 2. Test your setup
.\test-setup.ps1

# 3. Start both servers
.\start-local-dev.ps1
```

That's it! Open http://localhost:5173 in your browser.

**For detailed instructions:** See [`docs/setup/QUICK_START_GUIDE.md`](docs/setup/QUICK_START_GUIDE.md)

---

## 📁 Project Structure

```
Plated-Testing-CC/
├── backend/               # Flask backend API
│   ├── routes/           # API endpoints
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   └── tests/            # Backend tests
├── frontend/Plated/      # React TypeScript frontend
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── stores/       # State management
│   │   └── utils/        # Utilities and API client
│   └── public/           # Static assets
├── docs/                 # 📚 All documentation
│   ├── setup/           # Setup guides
│   ├── testing/         # Testing guides
│   ├── technical/       # Technical docs
│   ├── plans/           # Project plans
│   └── database/        # Database schemas
└── config/              # Configuration files
```

---

## 📚 Documentation

All documentation is organized in the [`docs/`](docs/) folder:

### 🎯 Quick Links

| I want to... | Read this |
|--------------|-----------|
| **Set up the project** | [`docs/setup/QUICK_START_GUIDE.md`](docs/setup/QUICK_START_GUIDE.md) |
| **Test locally** | [`docs/testing/README_LOCAL_TESTING.md`](docs/testing/README_LOCAL_TESTING.md) |
| **Understand authentication** | [`docs/technical/MOCK_AUTH_FLOW.md`](docs/technical/MOCK_AUTH_FLOW.md) |
| **See project status** | [`docs/plans/2025-01-24-production-ready-plated.md`](docs/plans/2025-01-24-production-ready-plated.md) |

**Full documentation index:** [`docs/README.md`](docs/README.md)

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand
- **Styling:** CSS Modules
- **Router:** React Router v6
- **HTTP Client:** Axios

### Backend
- **Framework:** Flask (Python)
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Google OAuth + JWT
- **Storage:** Supabase Storage
- **ORM:** SQLAlchemy (local), Supabase Client (cloud)

### Infrastructure
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (S3-compatible)
- **Deployment:** DigitalOcean Droplet
- **CI/CD:** GitHub Actions (planned)

---

## 🎮 Development

### Running Locally

**Backend:**
```powershell
.\start-backend.ps1
# Backend runs on http://localhost:5000
```

**Frontend:**
```powershell
.\start-frontend.ps1
# Frontend runs on http://localhost:5173
```

**Both at once:**
```powershell
.\start-local-dev.ps1
```

### Testing

```powershell
# Backend tests
cd backend
.\venv\Scripts\Activate.ps1
pytest

# Frontend tests
cd frontend/Plated
npm test
```

### Mock Login for Testing

The app includes a mock authentication system for local testing:
1. Click "Continue with Mock Login (Testing)" on the login page
2. Complete your profile
3. Start testing!

See [`docs/technical/MOCK_AUTH_FLOW.md`](docs/technical/MOCK_AUTH_FLOW.md) for details.

---

## 📊 Current Status

**Progress:** 72% Complete (13/18 tasks)

### ✅ Completed Features
- Database schema and tables
- Post creation system
- Engagement system (likes, comments, saves)
- Image upload to Supabase
- Feed with pagination
- User authentication
- Mock login for testing
- Create post UI (Simple & Recipe posts)

### 🚧 In Progress
- Follow/unfollow system
- Direct messaging
- Gamification backend
- UI polish and redesign

**Detailed status:** See [`docs/plans/2025-01-24-production-ready-plated.md`](docs/plans/2025-01-24-production-ready-plated.md)

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests:** Make sure everything passes
5. **Commit:** `git commit -m 'Add amazing feature'`
6. **Push:** `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines
- Follow existing code style
- Write tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

**Frontend won't start:**
```powershell
cd frontend/Plated
npm install
npm run dev
```

**Mock login not working:**
- Ensure both servers are running
- Check backend is on port 5000
- See [`docs/testing/LOCAL_TESTING_QUICK_START.md`](docs/testing/LOCAL_TESTING_QUICK_START.md)

**More help:** See [`docs/testing/README_LOCAL_TESTING.md`](docs/testing/README_LOCAL_TESTING.md)

---

## 📝 Scripts

| Script | Purpose |
|--------|---------|
| `test-setup.ps1` | Verify your development environment |
| `start-backend.ps1` | Start Flask backend server |
| `start-frontend.ps1` | Start Vite frontend server |
| `start-local-dev.ps1` | Start both servers automatically |

---

## 🔒 Environment Variables

### Backend (`backend/env.development.local`)
```env
ENV=dev
SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
CLIENT_ID=google-oauth-client-id
CLIENT_SECRET=google-oauth-client-secret
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```

### Frontend (`frontend/Plated/.env.local`)
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_AUTH_MODE=oauth
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👥 Team

Built with ❤️ by the Plated development team.

---

## 🔗 Links

- **Documentation:** [`docs/`](docs/)
- **Project Plan:** [`docs/plans/2025-01-24-production-ready-plated.md`](docs/plans/2025-01-24-production-ready-plated.md)
- **Database Schema:** [`docs/database/supabase_schema.sql`](docs/database/supabase_schema.sql)

---

## 📞 Support

Having issues? Check out:
1. [`docs/testing/README_LOCAL_TESTING.md`](docs/testing/README_LOCAL_TESTING.md) - Testing guide
2. [`docs/setup/QUICK_START_GUIDE.md`](docs/setup/QUICK_START_GUIDE.md) - Setup guide
3. GitHub Issues - Report bugs or request features

---

**Happy Cooking! 🍳**
