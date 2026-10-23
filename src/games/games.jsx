import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removePlayerFromGame } from './game-utils';

const defaultGames = [
  {
    id: 'sample-john-doe',
    name: "John Doe's Game",
    users: [{ username: 'John Doe', score: 0, response: '' }],
    judge: 'John Doe',
  },
  {
    id: 'sample-example',
    name: 'Example Game',
    users: [1, 2, 3, 4].map((number) => ({ username: `Player ${number}`, score: 0, response: '' })),
    judge: 'Player 1',
  },
];
const MAX_PLAYERS = 8;

function loadGames() {
  const savedGames = JSON.parse(localStorage.getItem('games') ?? '[]');
  const savedIds = new Set(savedGames.map((game) => game.id));
  const games = [...defaultGames.filter((game) => !savedIds.has(game.id)), ...savedGames];

  if (games.length !== savedGames.length) {
    localStorage.setItem('games', JSON.stringify(games));
  }

  return games;
}

export function Games() {
  const [games, setGames] = useState(loadGames);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function createGame() {
    const user = JSON.parse(localStorage.getItem('user') ?? 'null');
    if (!user?.email) {
      setError('Sign in to create a game');
      return;
    }

    const baseName = `${user.email}'s game`;
    let name = baseName;
    let suffix = 2;
    while (games.some((game) => game.name === name)) {
      name = `${baseName}#${suffix}`;
      suffix += 1;
    }

    const game = {
      id: Date.now(),
      name,
      users: [{ username: user.email, score: 0, response: '' }],
      judge: user.email,
    };
    const updatedGames = [...games, game];
    localStorage.setItem('games', JSON.stringify(updatedGames));
    setGames(updatedGames);
    setError('');
  }

  function resetGames() {
    localStorage.setItem('games', JSON.stringify(defaultGames));
    localStorage.removeItem('currentGame');
    setGames(defaultGames);
    setError('');
  }

  function joinGame(game) {
    const user = JSON.parse(localStorage.getItem('user') ?? 'null');
    if (!user?.email) {
      setError('Sign in to join a game');
      return;
    }

    const currentGame = JSON.parse(localStorage.getItem('currentGame') ?? 'null');
    const savedGames = JSON.parse(localStorage.getItem('games') ?? '[]');
    const joiningExistingGame = game.users.some((player) => player.username === user.email);
    if (!joiningExistingGame && game.users.length >= MAX_PLAYERS) {
      setError('This game is full');
      return;
    }

    const updatedGames = savedGames.map((savedGame) => {
      if (currentGame && savedGame.id === currentGame.id && currentGame.id !== game.id) {
        return removePlayerFromGame(savedGame, user.email);
      }
      return savedGame;
    });
    const targetGame = updatedGames.find((savedGame) => savedGame.id === game.id) ?? game;
    const joinedGame = targetGame.users.some((player) => player.username === user.email)
      ? targetGame
      : { ...targetGame, users: [...targetGame.users, { username: user.email, score: 0, response: '' }] };
    const finalGames = updatedGames.some((savedGame) => savedGame.id === game.id)
      ? updatedGames.map((savedGame) => savedGame.id === game.id ? joinedGame : savedGame)
      : [...updatedGames, joinedGame];

    localStorage.setItem('games', JSON.stringify(finalGames));
    localStorage.setItem('currentGame', JSON.stringify(joinedGame));
    setGames(finalGames);
    setError('');
    navigate('/play');
  }

  return (
    <main>
      <section aria-label="Available games">
        <div className="d-flex justify-content-between mb-3">
          <button type="button" className="btn btn-primary" onClick={createGame}>Create Game</button>
          <button type="button" className="btn btn-danger" onClick={resetGames}>dev: reset games</button>
        </div>
        {error && <p className="text-danger">{error}</p>}
        <table className="table table-sm table-striped align-middle game-list-table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Number of Players</th>
              <th scope="col">Join</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game, index) => (
              <tr key={game.id}>
                <th scope="row">{index + 1}</th>
                <td><span className="game-name">{game.name}</span></td>
                <td><span className="game-player-count">{game.users.length}/{MAX_PLAYERS}</span></td>
                <td>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary w-100"
                    onClick={() => joinGame(game)}
                    disabled={game.users.length >= MAX_PLAYERS}
                  >
                    Join
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
