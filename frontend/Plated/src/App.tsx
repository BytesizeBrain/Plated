import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import FeedPage from './pages/feed/FeedPage';
import DirectMessagesPage from './pages/messages/DirectMessagesPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/messages" element={<DirectMessagesPage />} />
        <Route path="/messages/:conversationId" element={<DirectMessagesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
