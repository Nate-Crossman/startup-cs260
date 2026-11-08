import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Login({ onLogin }) {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = formData.get('email').trim();
    const password = formData.get('password');
    const action = event.nativeEvent.submitter?.value ?? 'login';

    setError('');
    try {
      const response = await fetch(`/api/auth/${action === 'create' ? 'create' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? (action === 'create' ? 'Unable to create account' : 'Unable to log in'));
        return;
      }

      const user = { email: result.email };
      localStorage.setItem('user', JSON.stringify(user));
      onLogin(user);
      navigate('/games');
    } catch {
      setError('Unable to connect to the server');
    }
  }

  return (
    <main>
      <h2>Welcome to The Intense Epic War of Words, the party game where only the strongest words survive...</h2>

      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <span>Email: </span>
          <input type="text" name="email" className="form-control" placeholder="your@email.com" required />
        </div>
        <div className="mb-3">
          <span>Password: </span>
          <input type="password" name="password" className="form-control" placeholder="password" required />
        </div>
        <button type="submit" value="login" className="btn btn-primary">Login</button>
        <button type="submit" value="create" className="btn btn-secondary">Create New Account</button>
        {error && <p className="text-danger mb-0">{error}</p>}
      </form>
    </main>
  );
}