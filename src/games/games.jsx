import React from 'react';

export function Games() {
  return (
    <main>
      <section aria-label="Available games">
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
              <td><form action="play.html"><button type="submit" className="btn btn-sm btn-primary w-100">Join</button></form></td>
            </tr>
            <tr>
              <th scope="row">2</th>
              <td><span className="game-name">Example Game</span></td>
              <td><span className="game-player-count">4/8</span></td>
              <td><form action="play.html"><button type="submit" className="btn btn-sm btn-primary w-100">Join</button></form></td>
            </tr>
            <tr>
              <th scope="row">3</th>
              <td><span className="game-name">Empty Game</span></td>
              <td><span className="game-player-count">0/8</span></td>
              <td><form action="play.html"><button type="submit" className="btn btn-sm btn-primary w-100">Join</button></form></td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  );
}