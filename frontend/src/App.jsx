import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Feed from './components/Feed';
import Explore from './components/Explore';
import Sidebar from './components/Sidebar';
import PlaceholderPage from './components/PlaceholderPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleAuthSuccess = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <Router>
      <div className={token ? "app-layout" : "container"}>
        {token && <Sidebar user={user} onLogout={handleLogout} />}

        <div className={token ? "main-content" : ""}>
          <Routes>
            <Route path="/login" element={!token ? <Login onAuthSuccess={handleAuthSuccess} /> : <Navigate to="/" />} />
            <Route path="/register" element={!token ? <Register onAuthSuccess={handleAuthSuccess} /> : <Navigate to="/" />} />
            
            <Route path="/" element={token ? <Feed token={token} user={user} /> : <Navigate to="/login" />} />
            <Route path="/search" element={token ? <PlaceholderPage title="Search" description="Find trending topics and users." /> : <Navigate to="/login" />} />
            <Route path="/explore" element={token ? <Explore token={token} /> : <Navigate to="/login" />} />
            <Route path="/messages" element={token ? <PlaceholderPage title="Messages" description="Your direct messages and group chats." /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={token ? <PlaceholderPage title="Notifications" description="See who liked and commented on your posts." /> : <Navigate to="/login" />} />
            <Route path="/profile" element={token ? <PlaceholderPage title="Profile" description={`Manage the account for ${user?.username}`} /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
