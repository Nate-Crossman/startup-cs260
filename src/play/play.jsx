import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function Play() {
  const [game, setGame] = useState(() => JSON.parse(localStorage.getItem('currentGame') ?? 'null'));
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');

  if (!game) {
    return (
      <main>
        You're not in a game. <Link to="/games">Join here</Link>
      </main>
    );
  }

  function handlePromptSubmit(event) {
    event.preventDefault();

    const response = String(new FormData(event.currentTarget).get('response') ?? '').trim();
    const user = JSON.parse(localStorage.getItem('user') ?? 'null');
    if (!user?.email) {
      setError('Sign in to submit a response');
      return;
    }
    if (!game.users.some((player) => player.username === user.email)) {
      setError('You are not a player in this game');
      return;
    }

    const updatedGame = {
      ...game,
      users: game.users.map((player) => (
        player.username === user.email ? { ...player, response } : player
      )),
    };
    const games = JSON.parse(localStorage.getItem('games') ?? '[]');
    const updatedGames = games.map((savedGame) => (
      savedGame.id === updatedGame.id ? updatedGame : savedGame
    ));

    localStorage.setItem('currentGame', JSON.stringify(updatedGame));
    localStorage.setItem('games', JSON.stringify(updatedGames));
    setGame(updatedGame);
    setError('');
  }

  function getSuggestion() {
    // This function will call an API to generate a suggestion.
    setResponse('Suggestion text');
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
                {player.response && <div className="small">{player.response}</div>}
              </div>
              {game.judge === player.username && (
                <span className="player-role badge text-bg-primary rounded-pill">JUDGE</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-5" aria-label="Enter Prompt">
        <form onSubmit={handlePromptSubmit} className="row g-3 align-items-end">
          <div className="col-12 col-md-6">
            <label htmlFor="prompt-input" className="form-label">Enter Prompt:</label>
            <input
              id="prompt-input"
              name="response"
              type="text"
              className="form-control"
              placeholder="Type a prompt here!"
              value={response}
              onChange={(event) => setResponse(event.target.value)}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <button type="submit" className="btn btn-primary w-100">Submit</button>
          </div>
        </form>
        {error && <p className="text-danger mt-2">{error}</p>}
        <div className="row mt-3">
          <div className="col-12 col-md-6">
            <button type="button" className="btn btn-secondary w-100" onClick={getSuggestion}>Generate an Idea</button>
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