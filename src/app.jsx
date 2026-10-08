import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
  return (
    <header>
      <div className="d-flex flex-column flex-md-row justify-content-center justify-content-md-between align-items-center">
        <h1 className="mb-0">T.I.E.W.O.W.</h1>
        <nav className="navbar navbar-expand p-0 w-100 flex-md-grow-1 justify-content-center justify-content-md-end">
          <ul className="navbar-nav flex-row flex-wrap justify-content-center justify-content-md-end gap-2 w-100">
            <li className="nav-item"><a className="nav-link" href="index.html">Home</a></li>
            <li className="nav-item"><a className="nav-link" href="play.html">Play</a></li>
            <li className="nav-item"><a className="nav-link" href="games.html">Join Game</a></li>
            <li className="nav-item"><a className="nav-link" href="how-to-play.html">Rules</a></li>
          </ul>
        </nav>
      </div>
      <hr />
    </header>
  )
}