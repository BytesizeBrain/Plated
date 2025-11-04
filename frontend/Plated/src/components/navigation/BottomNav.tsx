import { useNavigate } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  return (
    <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 56, borderTop: '1px solid #e5e7eb', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
      <button onClick={() => navigate('/')}>Home</button>
      <button onClick={() => navigate('/explore')}>Explore</button>
      <button onClick={() => navigate('/profile')}>Profile</button>
    </nav>
  );
}


