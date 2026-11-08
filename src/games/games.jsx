import React, { useEffect, useState } from 'react';
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

async function readApiJson(response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `Service returned HTTP ${response.status} with ${contentType || 'no content type'} instead of JSON. Restart the service and try again.`,
    );
  }

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error ?? `Service returned ${response.status}`);
  }
  return result;
}

async function fetchGames() {
  const response = await fetch('/api/games');
  const result = await readApiJson(response);
  if (!Array.isArray(result)) {
    throw new Error('Games response must be a list');
  }
  return result;
}

async function getAuthenticatedUser() {
  const response = await fetch('/api/auth/me');
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Unable to verify authentication');
  }

  const user = await response.json();
  if (typeof user.email !== 'string' || !user.email) {
    throw new Error('Authentication response did not include a user email');
  }
  return user;
}

export function Games() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingDemoGames, setIsAddingDemoGames] = useState(false);
  const navigate = useNavigate();

  async function refreshGames() {
    setError('');
    setIsLoading(true);
    try {
      setGames(await fetchGames());
    } catch {
      setError('Unable to load games. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshGames();
  }, []);

  async function createGame() {
    setError('');
    let user;
    try {
      user = await getAuthenticatedUser();
    } catch {
      setError('Unable to verify your sign-in. Please try again.');
      return;
    }
    if (!user) {
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

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(game),
      });
      const createdGame = await response.json();
      if (!response.ok) {
        setError(createdGame.error ?? 'Unable to create game');
        return;
      }

      const currentGameResponse = await fetch('/api/auth/current-game', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentGameId: createdGame.id }),
      });
      if (!currentGameResponse.ok) {
        setGames((currentGames) => [...currentGames, createdGame]);
        setError('Game created, but unable to set it as your current game.');
        return;
      }

      setGames((currentGames) => [...currentGames, createdGame]);
    } catch {
      setError('Unable to create game. Please try again.');
    }
  }

  async function clearGames() {
    setError('');
    try {
      const response = await fetch('/api/games', { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('Unable to clear games');
      }

      setGames([]);
    } catch {
      setError('Unable to clear games. Please try again.');
    }
  }

  async function addDemoGames() {
    setError('');
    setIsAddingDemoGames(true);
    try {
      const existingGames = await fetchGames();
      for (const game of defaultGames) {
        const existingGame = existingGames.find(
          (candidate) => String(candidate.id) === String(game.id),
        );
        const response = await fetch(
          existingGame ? `/api/games/${encodeURIComponent(String(game.id))}` : '/api/games',
          {
            method: existingGame ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(game),
          },
        );
        await readApiJson(response);
      }

      setGames(await fetchGames());
    } catch (error) {
      setError(`Unable to add demo games: ${error instanceof Error ? error.message : 'Unexpected error'}`);
    } finally {
      setIsAddingDemoGames(false);
    }
  }

  async function joinGame(game) {
    setError('');
    let user;
    try {
      user = await getAuthenticatedUser();
    } catch {
      setError('Unable to verify your sign-in. Please try again.');
      return;
    }
    if (!user) {
      setError('Sign in to join a game');
      return;
    }

    try {
      const currentGameResponse = await fetch(
        `/api/games/${encodeURIComponent(String(game.id))}`,
      );
      if (!currentGameResponse.ok && currentGameResponse.status !== 404) {
        throw new Error('Unable to load game');
      }
      const targetGame = currentGameResponse.ok
        ? await currentGameResponse.json()
        : game;
      const joiningExistingGame = targetGame.users.some((player) => player.username === user.email);
      if (!joiningExistingGame && targetGame.users.length >= MAX_PLAYERS) {
        setError('This game is full');
        return;
      }
      const gameWithUser = joiningExistingGame
        ? targetGame
        : { ...targetGame, users: [...targetGame.users, { username: user.email, score: 0, response: '' }] };

      let updatedPreviousGame;
      if (
        user.currentGameId !== null
        && user.currentGameId !== undefined
        && String(user.currentGameId) !== String(game.id)
      ) {
        const previousGameResponse = await fetch(
          `/api/games/${encodeURIComponent(String(user.currentGameId))}`,
        );
        if (previousGameResponse.ok) {
          const previousGame = await previousGameResponse.json();
          const removedPlayerGame = removePlayerFromGame(previousGame, user.email);
          const updatePreviousResponse = await fetch(
            `/api/games/${encodeURIComponent(String(previousGame.id))}`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(removedPlayerGame),
            },
          );
          if (!updatePreviousResponse.ok) {
            throw new Error('Unable to leave previous game');
          }
          updatedPreviousGame = await updatePreviousResponse.json();
        } else if (previousGameResponse.status !== 404) {
          throw new Error('Unable to load previous game');
        }
      }

      let response = await fetch(`/api/games/${encodeURIComponent(String(game.id))}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gameWithUser),
      });
      let joinedGame = await response.json();
      if (response.status === 404) {
        response = await fetch('/api/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(gameWithUser),
        });
        joinedGame = await response.json();
      }

      if (!response.ok) {
        setError(joinedGame.error ?? 'Unable to join game');
        return;
      }

      const currentGameUpdate = await fetch('/api/auth/current-game', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentGameId: joinedGame.id }),
      });
      if (!currentGameUpdate.ok) {
        setError('Joined the game, but unable to save it as your current game.');
        return;
      }

      const finalGames = games.filter((savedGame) => (
        savedGame.id !== joinedGame.id
        && (!updatedPreviousGame || savedGame.id !== updatedPreviousGame.id)
      ));
      finalGames.push(...[updatedPreviousGame, joinedGame].filter(Boolean));
      setGames(finalGames);
      navigate('/play');
    } catch {
      setError('Unable to join game. Please try again.');
    }
  }

  return (
    <main>
      <section aria-label="Available games">
        <div className="d-flex justify-content-between mb-3">
          <div className="d-flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={createGame}>Create Game</button>
            <button type="button" className="btn btn-secondary" onClick={refreshGames} disabled={isLoading}>
              {isLoading ? 'Refreshing...' : 'Refresh Games'}
            </button>
            <button type="button" className="btn btn-danger" onClick={clearGames}>dev: clear games</button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={addDemoGames}
              disabled={isAddingDemoGames}
            >
              {isAddingDemoGames ? 'Adding demo games...' : 'dev: add demo games'}
            </button>
          </div>
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
            {isLoading && games.length === 0 && (
              <tr><td colSpan="4">Loading games...</td></tr>
            )}
            {!isLoading && games.length === 0 && (
              <tr><td colSpan="4">No games available.</td></tr>
            )}
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
