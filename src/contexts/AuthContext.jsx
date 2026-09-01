import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// The assignment keeps the provider and its access hook in one module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export function AuthProvider({ children }) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  async function login(userEmail, password) {
    try {
      const response = await fetch('/api/users/logon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 200 && data.name && data.csrfToken) {
        setEmail(data.name);
        setToken(data.csrfToken);
        return { success: true };
      }

      return {
        success: false,
        error: `Authentication failed: ${data?.message || 'Unknown error'}`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Network error during login: ${error.message}`,
      };
    }
  }

  async function logout() {
    let result = { success: true };

    try {
      if (token) {
        const response = await fetch('/api/user/logoff', {
          method: 'POST',
          headers: { 'X-CSRF-TOKEN': token },
          credentials: 'include',
        });

        if (!response.ok) {
          result = { success: false, error: 'Logout request failed' };
        }
      }
    } catch (error) {
      result = {
        success: false,
        error: `Network error during logout: ${error.message}`,
      };
    } finally {
      setEmail('');
      setToken('');
    }

    return result;
  }

  const value = {
    email,
    token,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}