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
    <div className="body bg-light text-dark">
    <header>
      <div className="d-flex flex-column flex-md-row justify-content-center justify-content-md-between align-items-center">
        <h1 className="mb-0">T.I.E.W.O.W.</h1>
        <nav className="navbar navbar-expand p-0 w-100 flex-md-grow-1 justify-content-center justify-content-md-end">
          <ul className="navbar-nav flex-row flex-wrap justify-content-center justify-content-md-end gap-2 w-100">
            <li className="nav-item"><NavLink className="nav-link" to="">Home</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="play">Play</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="games">Join Game</NavLink></li>
            <li className="nav-item"><NavLink className="nav-link" to="how-to-play">Rules</NavLink></li>
          </ul>
        </nav>
      </div>
      <hr />
    </header>
    <Routes>
        <Route path='/' element={<Login />} exact />
        <Route path='/play' element={<Play />} />
        <Route path='/games' element={<Games />} />
        <Route path='/how-to-play' element={<HowToPlay />} />
        <Route path='*' element={<NotFound />} />
    </Routes>
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

function NotFound() {
  return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
}