import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function Play() {
  const [game, setGame] = useState(() => JSON.parse(localStorage.getItem('currentGame') ?? 'null'));
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (!game) {
      return undefined;
    }

    const user = JSON.parse(localStorage.getItem('user') ?? 'null');
    const suggestions = [
      'Fun filler text',
      'Lorem Ipsum',
      'This is some cool filler text',
      'Help I\'m trapped in the filler text!',
    ];
    let responseIndex = 0;

    const intervalId = setInterval(() => {
      const currentGame = JSON.parse(localStorage.getItem('currentGame') ?? 'null');
      if (!currentGame || currentGame.id !== game.id) {
        clearInterval(intervalId);
        return;
      }

      const player = currentGame.users.find(
        (gameUser) => gameUser.username !== user?.email && !gameUser.response,
      );
      if (!player) {
        clearInterval(intervalId);
        return;
      }

      const updatedGame = {
        ...currentGame,
        users: currentGame.users.map((gameUser) => (
          gameUser.username === player.username
            ? { ...gameUser, response: suggestions[responseIndex++ % suggestions.length] }
            : gameUser
        )),
      };
      const savedGames = JSON.parse(localStorage.getItem('games') ?? '[]');
      const updatedGames = savedGames.map((savedGame) => (
        savedGame.id === updatedGame.id ? updatedGame : savedGame
      ));

      localStorage.setItem('currentGame', JSON.stringify(updatedGame));
      localStorage.setItem('games', JSON.stringify(updatedGames));
      setGame(updatedGame);
    }, 2000);

    return () => clearInterval(intervalId);
  }, [game?.id]);

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

  const allPlayersSubmitted = game.users.length > 0
    && game.users.every((player) => player.response?.trim());
  const judgeResponse = game.users.find((player) => player.username === game.judge)?.response;
  const currentUser = JSON.parse(localStorage.getItem('user') ?? 'null');
  const canSubmitResponse = currentUser?.email === game.judge || Boolean(judgeResponse?.trim());

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
                {player.response && <span className="small"> -- Submitted!</span>}
              </div>
              {game.judge === player.username && (
                <span className="player-role badge text-bg-primary rounded-pill">JUDGE</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-4" aria-live="polite" aria-label="Judge prompt">
        <p className="display-6">
          The Judge says: {game.users.find((player) => player.username === game.judge)?.response
            || "Wait for the judge to enter their Prompt!"}
        </p>
      </section>

      {canSubmitResponse && (
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
      )}

      {allPlayersSubmitted && currentUser?.email === game.judge && (
        <section aria-labelledby="vote-heading">
          <h2 id="vote-heading" className="h5 mb-2">VOTE FOR THE VICTOR</h2>
          <div className="btn-group-vertical w-100" role="group" aria-label="Vote for the victor">
            {game.users
              .filter((player) => player.username !== game.judge)
              .map((player) => (
                <button key={player.username} type="button" className="btn btn-outline-primary">
                  {player.response}
                </button>
              ))}
          </div>
        </section>
      )}

      
    </main>
  );
}