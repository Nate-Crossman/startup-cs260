import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function Play() {
  const [game] = useState(() => JSON.parse(localStorage.getItem('currentGame') ?? 'null'));

  if (!game) {
    return (
      <main>
        You're not in a game. <Link to="/games">Join here</Link>
      </main>
    );
  }

  return (
    <main>
      <div className="game mb-3">
        You are in game: <span className="game-name">{game.name}</span>
      </div>
      <section className="mb-5" aria-labelledby="players-heading">
        <h2 id="players-heading" className="h5 mb-2">Players</h2>
        <ul className="list-group players">
          {game.users.map((player) => (
            <li key={player.username} className="list-group-item d-flex justify-content-between align-items-center">
              <div className="ms-2 me-auto">
                <span className="player-score badge text-bg-secondary rounded-pill me-2">[{player.score}]</span>
                <span className="player-name">{player.username}</span>
              </div>
              {game.judge === player.username && (
                <span className="player-role badge text-bg-primary rounded-pill">JUDGE</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-5" aria-label="Enter Prompt">
        <form method="get" className="row g-3 align-items-end">
          <div className="col-12 col-md-6">
            <label for="prompt-input" className="form-label">Enter Prompt:</label>
            <input id="prompt-input" type="text" className="form-control" placeholder="Type a prompt here!" />
          </div>
          <div className="col-12 col-md-6">
            <button type="submit" className="btn btn-primary w-100">Submit</button>
          </div>
        </form>
        <div className="row mt-3">
          <div className="col-12 col-md-6">
            <button type="button" className="btn btn-secondary w-100">Generate an Idea</button>
            <output id="idea-output" className="form-control mt-2" aria-live="polite" hidden></output>
          </div>
        </div>
      </section>

      <section aria-labelledby="vote-heading">
        <h2 id="vote-heading" className="h5 mb-2">VOTE FOR THE VICTOR</h2>
        <div className="btn-group-vertical w-100" role="group" aria-label="Vote for the victor">
          <button type="button" className="btn btn-outline-primary">[User submission responding to the prompt]</button>
          <button type="button" className="btn btn-outline-primary">[Different and slightly lamer response]</button>
        </div>
      </section>

      
    </main>
  );
}