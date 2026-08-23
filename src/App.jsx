import { useState } from 'react';
import Header from './shared/Header.jsx';
import TodosPage from './features/Todos/TodosPage.jsx';
import Logon from './features/Logon.jsx';
import './App.css';

function App() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');

  function handleLogout() {
    setEmail('');
    setToken('');
  }

  return (
    <>
      <Header email={email} token={token} onLogout={handleLogout} />
      {token ? (
        <TodosPage token={token} />
      ) : (
        <Logon onSetEmail={setEmail} onSetToken={setToken} />
      )}
    </>
  );
}

export default App;
