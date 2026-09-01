import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

function Header() {
  const { email, isAuthenticated, logout } = useAuth();
  const [logoutError, setLogoutError] = useState('');

  async function handleLogout() {
    setLogoutError('');
    const result = await logout();

    if (!result.success) {
      setLogoutError(result.error);
    }
  }

  return (
    <header style={{ 
      padding: '20px', 
      borderBottom: '2px solid #ccc',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <h1>Todo List</h1>
      {logoutError && <span role="alert">{logoutError}</span>}
      {isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Welcome, {email}!
          </span>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
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