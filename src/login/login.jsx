import React from 'react';

export function Login() {
  return (
    <main>
      <h2>Welcome to The Intense Epic War of Words, the party game where only the strongest words survive...</h2>

      <h1>Login</h1>
      <form method="get" action="play.html" className="login-form">
        <div>
          <span>Email: </span>
          <input type="text" className="form-control" placeholder="your@email.com" />
        </div>
        <div className="mb-3">
          <span>Password: </span>
          <input type="password" className="form-control" placeholder="password" />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
        <button type="submit" className="btn btn-secondary">Create New Account</button>
      </form>
    </main>
  );
}