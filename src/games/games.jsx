import React, { useState } from 'react';

export function Games() {
  const [games, setGames] = useState(() => JSON.parse(localStorage.getItem('games') ?? '[]'));
  const [error, setError] = useState('');

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

  return (
    <main>
      <section aria-label="Available games">
        <button type="button" className="btn btn-primary mb-3" onClick={createGame}>Create Game</button>
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
            <tr>
              <th scope="row">1</th>
              <td><span className="game-name">John Doe's Game</span></td>
              <td><span className="game-player-count">1/8</span></td>
              <td><form action="play"><button type="submit" className="btn btn-sm btn-primary w-100">Join</button></form></td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td><span className="game-name">Example Game</span></td>
              <td><span className="game-player-count">4/8</span></td>
              <td><form action="play"><button type="submit" className="btn btn-sm btn-primary w-100">Join</button></form></td>
            </tr>
            <tr>
              <th scope="row">3</th>
              <td><span className="game-name">Empty Game</span></td>
              <td><span className="game-player-count">0/8</span></td>
              <td><form action="play"><button type="submit" className="btn btn-sm btn-primary w-100">Join</button></form></td>
            </tr>
            {games.map((game, index) => (
              <tr key={game.id}>
                <th scope="row">{index + 4}</th>
                <td><span className="game-name">{game.name}</span></td>
                <td><span className="game-player-count">{game.users.length}/8</span></td>
                <td><form action="play"><button type="submit" className="btn btn-sm btn-primary w-100">Join</button></form></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}