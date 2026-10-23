import React, { useState } from 'react';

export function Login({ onLogin }) {
  const [error, setError] = useState('');

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = formData.get('email').trim();
    const password = formData.get('password');
    const action = event.nativeEvent.submitter?.value ?? 'login';
    const users = JSON.parse(localStorage.getItem('users') ?? '{}');

    if (action === 'create') {
      if (Object.hasOwn(users, username)) {
        setError('Username already taken');
        return;
      }

      // Passwords should be hashed on the server before being stored.
      users[username] = password;
      localStorage.setItem('users', JSON.stringify(users));
    } else if (users[username] !== password) {
      setError('Incorrect password');
      return;
    }

    const user = { email: username };
    localStorage.setItem('user', JSON.stringify(user));
    onLogin(user);
    setError('');
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