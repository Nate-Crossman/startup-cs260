import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Play } from './play/play';
import { Games } from './games/games';
import { HowToPlay } from './how-to-play/how-to-play';

export default function App() {
  return (
    <BrowserRouter>
    <div className="body bg-dark text-light">
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
    <main> app content goes here </main>
    <footer>
      <hr />
      <div className="footer-content">
        <span className="text-reset">T.I.E.W.O.W. is a game by Nate Crossman</span>
        <a href="https://github.com/Nate-Crossman/startup-cs260">GitHub</a>
      </div>
    </footer>
    </div>
    </BrowserRouter>
  )
}