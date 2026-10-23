import React from 'react';

export function Login({ onLogin }) {
  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const user = { email: formData.get('email') };
    localStorage.setItem('user', JSON.stringify(user));
    onLogin(user);
  }

  return (
    <main>
      <h2>Welcome to The Intense Epic War of Words, the party game where only the strongest words survive...</h2>

      <h1>Login</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <span>Email: </span>
          <input type="text" name="email" className="form-control" placeholder="your@email.com" />
        </div>
        <div className="mb-3">
          <span>Password: </span>
          <input type="password" name="password" className="form-control" placeholder="password" />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
        <button type="submit" className="btn btn-secondary">Create New Account</button>
      </form>
    </main>
  );
}