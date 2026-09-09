import { Link } from 'react-router';

function NotFoundPage() {
  return (
    <div style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center' }}>
      <h2>404: Page Not Found</h2>
      <p>The page you requested does not exist.</p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/">Go Home</Link>
        <Link to="/about">About</Link>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
