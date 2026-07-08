import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, Compass, MessageCircle, Heart, PlusSquare, User, LogOut } from 'lucide-react';
import CreatePost from './CreatePost';

export default function Sidebar({ user, onLogout }) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <>
      <div className="sidebar">
      <div className="sidebar-logo">Social Media</div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
        <Link to="/" className="nav-link">
          <Home />
          <span>Home</span>
        </Link>
        <Link to="/search" className="nav-link">
          <Search />
          <span>Search</span>
        </Link>
        <Link to="/explore" className="nav-link">
          <Compass />
          <span>Explore</span>
        </Link>
        <Link to="/messages" className="nav-link">
          <MessageCircle />
          <span>Messages</span>
        </Link>
        <Link to="/notifications" className="nav-link">
          <Heart />
          <span>Notifications</span>
        </Link>
        <div className="nav-link" style={{ color: 'var(--accent-primary)', cursor: 'pointer' }} onClick={() => setShowCreateModal(true)}>
          <PlusSquare />
          <span>Create</span>
        </div>
        <Link to="/profile" className="nav-link">
          <User />
          <span>Profile</span>
        </Link>
      </nav>

      <div style={{ padding: '20px 0', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: '600' }}>{user?.username}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Logged in</div>
          </div>
        </div>
        <button 
          onClick={onLogout} 
          className="nav-link" 
          style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--error)', padding: '12px 0' }}
        >
          <LogOut />
          <span>Logout</span>
        </button>
      </div>
    </div>
    {showCreateModal && (
      <CreatePost token={localStorage.getItem('token')} onClose={() => setShowCreateModal(false)} />
    )}
    </>
  );
}
