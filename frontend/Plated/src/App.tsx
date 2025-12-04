import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import './App.css';

// Static imports for critical pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy load non-critical pages
const FeedPage = lazy(() => import('./pages/feed/FeedPage'));
const DirectMessagesPage = lazy(() => import('./pages/messages/DirectMessagesPage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const Profile = lazy(() => import('./pages/Profile'));
const SavedPostsPage = lazy(() => import('./pages/SavedPostsPage'));
const ChallengesPage = lazy(() => import('./pages/challenges/ChallengesPage'));
const CookModePage = lazy(() => import('./pages/cook/CookModePage'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'));
const ProofPage = lazy(() => import('./pages/cook/ProofPage'));


// Loading component
function PageLoader() {
  return (
    <div className="page-loader">
      <div className="loader-spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/messages" element={<DirectMessagesPage />} />
          <Route path="/messages/:conversationId" element={<DirectMessagesPage />} />
          <Route path="/saved" element={<SavedPostsPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/cook/:challengeId" element={<CookModePage />} />
          <Route path="/proof/:challengeId" element={<ProofPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
