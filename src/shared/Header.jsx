import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext.jsx';
import Navigation from './Navigation.jsx';

function Header() {
  const { email, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    const result = await logout();

    if (result.success) {
      navigate('/login', { replace: true });
    }
  }

  return (
    <header
      style={{
        padding: '20px',
        borderBottom: '2px solid #ccc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <div>
        <Link to="/" style={{ color: '#111827', textDecoration: 'none' }}>
          <h1 style={{ margin: 0 }}>Todo List</h1>
        </Link>
      </div>

      <Navigation />

      {isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Welcome, {email}!</span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;