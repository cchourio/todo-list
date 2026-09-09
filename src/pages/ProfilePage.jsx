import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

function ProfilePage() {
  const { email, token } = useAuth();
  const [todoStats, setTodoStats] = useState({ total: 0, completed: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTodoStats() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch('/api/tasks', {
          method: 'GET',
          headers: {
            'X-CSRF-TOKEN': token,
          },
          credentials: 'include',
        });

        if (response.status === 401) {
          throw new Error('Unauthorized');
        }

        if (!response.ok) {
          throw new Error('Failed to fetch todos');
        }

        const todos = await response.json();
        const total = todos.length;
        const completed = todos.filter((todo) => todo.isCompleted).length;
        const active = total - completed;

        setTodoStats({ total, completed, active });
      } catch (err) {
        setError(`Error loading statistics: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchTodoStats();
  }, [token]);

  const completionPercent = todoStats.total
    ? Math.round((todoStats.completed / todoStats.total) * 100)
    : 0;

  return (
    <main style={{ maxWidth: '700px', margin: '2rem auto', padding: '1rem' }}>
      <h2>Your Profile</h2>

      <div style={{ marginBottom: '2rem' }}>
        <p>
          <strong>Email:</strong> {email || 'Not available'}
        </p>
        <p>
          <strong>Status:</strong> {token ? 'Authenticated' : 'Not logged in'}
        </p>
      </div>

      <section>
        <h3>Todo Statistics</h3>

        {loading ? (
          <p>Loading statistics...</p>
        ) : error ? (
          <p style={{ color: 'crimson' }}>{error}</p>
        ) : (
          <>
            <p>Total: {todoStats.total}</p>
            <p>Completed: {todoStats.completed}</p>
            <p>Active: {todoStats.active}</p>
            <p>Completion rate: {completionPercent}%</p>
          </>
        )}
      </section>
    </main>
  );
}

export default ProfilePage;
