// src/App.tsx

import { Outlet, Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      <header style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
        <Link to="/" style={{ fontWeight: 700, textDecoration: 'none' }}>AutoRent</Link>
        <nav style={{ marginLeft: '2rem' }}>
          <Link to="/autos" style={{ marginRight: '3rem' }}>Autos</Link>
          <Link to="/admin">Admin</Link>
          {isAuthenticated && (
            <button 
              onClick={logout} 
              style={{ marginLeft: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: 'blue' }}
            >
              Logout
            </button>
          )}
        </nav>
      </header>
      <Outlet />
      <footer style={{ padding: '3rem', borderTop: '1px solid #eee', marginTop: '3rem' }}>
        <small>© {new Date().getFullYear()} AutoRent</small>
      </footer>
    </>
  );
}
