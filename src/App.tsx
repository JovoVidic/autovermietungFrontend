
import { Outlet, Link } from 'react-router-dom';

export default function App() {
  return (
    <>
      <header style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
        <Link to="/" style={{ fontWeight: 700, textDecoration: 'none' }}>AutoRent</Link>
        {/* hier kannst du später Nav-Links ergänzen */}
      </header>
      <Outlet />
      <footer style={{ padding: '2rem', borderTop: '1px solid #eee', marginTop: '3rem' }}>
        <small>© {new Date().getFullYear()} AutoRent</small>
      </footer>
    </>
  );
}
