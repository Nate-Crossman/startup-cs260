import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removePlayerFromGame } from '../games/game-utils';

export function Play({ user: currentUser }) {
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [isLoadingGame, setIsLoadingGame] = useState(Boolean(currentUser?.email));
  const [isGettingSuggestion, setIsGettingSuggestion] = useState(false);
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');
  const [roundResult, setRoundResult] = useState(null);
  const allPlayersSubmitted = Boolean(game?.users.length)
    && game.users.every((player) => player.response?.trim());
  const judgeResponse = game?.users.find((player) => player.username === game.judge)?.response;
  const currentPlayer = game?.users.find((player) => player.username === currentUser?.email);
  const currentPlayerSubmitted = Boolean(currentPlayer?.response?.trim());
  const isJudge = currentUser?.email === game?.judge;
  const canSubmitResponse = Boolean(currentPlayer)
    && !allPlayersSubmitted
    && (isJudge ? !currentPlayerSubmitted : Boolean(judgeResponse?.trim()) && !currentPlayerSubmitted);
  const waitingForResponses = Boolean(judgeResponse?.trim())
    && currentPlayerSubmitted
    && !allPlayersSubmitted;
  const waitingForJudgePrompt = !isJudge && !judgeResponse?.trim();
  const waitingForJudgeVote = allPlayersSubmitted && !isJudge;

  async function saveGame(updatedGame) {
    const response = await fetch(`/api/games/${encodeURIComponent(String(updatedGame.id))}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedGame),
    });
    const savedGame = await response.json();
    if (!response.ok) {
      throw new Error(savedGame.error ?? 'Unable to save game');
    }
    return savedGame;
  }

  useEffect(() => {
    let active = true;
    if (!currentUser?.email) {
      setGame(null);
      setIsLoadingGame(false);
      return () => {
        active = false;
      };
    }

    setIsLoadingGame(true);
    async function loadCurrentGame() {
      try {
        const response = await fetch('/api/auth/current-game');
        if (response.status === 401) {
          if (active) {
            setGame(null);
          }
          return;
        }
        if (!response.ok) {
          throw new Error('Unable to load current game');
        }

        const currentGame = await response.json();
        if (active) {
          setGame(currentGame);
        }
      } catch {
        if (active) {
          setError('Unable to load your current game. Please try again.');
          setGame(null);
        }
      } finally {
        if (active) {
          setIsLoadingGame(false);
        }
      }
    }

    loadCurrentGame();
    return () => {
      active = false;
    };
  }, [currentUser?.email]);

  useEffect(() => {
    if (!game || !currentUser?.email) {
      return undefined;
    }

    const suggestions = [
      'Fun filler text',
      'Lorem Ipsum',
      'This is some cool filler text',
      'Help I\'m trapped in the filler text!',
    ];
    let responseIndex = 0;
    let active = true;

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`/api/games/${encodeURIComponent(String(game.id))}`);
        if (response.status === 404) {
          await fetch('/api/auth/current-game', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentGameId: null }),
          });
          if (active) {
            setGame(null);
          }
          return;
        }
        if (!response.ok) {
          throw new Error('Unable to refresh game');
        }

        const currentGame = await response.json();
        const currentJudgeResponse = currentGame.users.find(
          (gameUser) => gameUser.username === currentGame.judge,
        )?.response;
        if (!currentJudgeResponse?.trim() && currentUser.email === currentGame.judge) {
          if (active) {
            setGame(currentGame);
          }
          return;
        }

        const player = !currentJudgeResponse?.trim()
          ? currentGame.users.find((gameUser) => gameUser.username === currentGame.judge)
          : currentGame.users.find(
            (gameUser) => gameUser.username !== currentUser.email && !gameUser.response,
          );
        if (!player) {
          if (active) {
            setGame(currentGame);
          }
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
        const updateResponse = await fetch(`/api/games/${encodeURIComponent(String(game.id))}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedGame),
        });
        if (!updateResponse.ok) {
          throw new Error('Unable to save game');
        }
        const savedGame = await updateResponse.json();
        if (active) {
          setGame(savedGame);
        }
      } catch {
        if (active) {
          setError('Unable to refresh game state. Please try again.');
        }
      }
    }, 2000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [game?.id, judgeResponse, currentUser?.email]);

  useEffect(() => {
    if (!allPlayersSubmitted || currentUser?.email === game?.judge) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      const candidates = game.users.filter(
        (player) => player.username !== game.judge && player.response?.trim(),
      );
      if (candidates.length === 0) {
        return;
      }

      const winner = candidates[Math.floor(Math.random() * candidates.length)];
      handleVote(winner.username, true);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [allPlayersSubmitted, currentUser?.email, game?.judge]);

  if (!game) {
    return (
      <main>
        {isLoadingGame
          ? 'Loading your game...'
          : <>You're not in a game. <Link to="/games">Join here</Link></>}
      </main>
    );
  }

  async function handlePromptSubmit(event) {
    event.preventDefault();

    const response = String(new FormData(event.currentTarget).get('response') ?? '').trim();
    if (!currentUser?.email) {
      setError('Sign in to submit a response');
      return;
    }
    if (!game.users.some((player) => player.username === currentUser.email)) {
      setError('You are not a player in this game');
      return;
    }

    const updatedGame = {
      ...game,
      users: game.users.map((player) => (
        player.username === currentUser.email ? { ...player, response } : player
      )),
    };
    try {
      const savedGame = await saveGame(updatedGame);
      setGame(savedGame);
      setError('');
    } catch {
      setError('Unable to submit your response. Please try again.');
    }
  }

  async function getSuggestion() {
    setError('');
    setIsGettingSuggestion(true);
    try {
      const suggestionResponse = await fetch(
        'https://uselessfacts.jsph.pl/api/v2/facts/random?language=en',
      );
      if (!suggestionResponse.ok) {
        throw new Error(`Fact service returned ${suggestionResponse.status}`);
      }

      const fact = await suggestionResponse.json();
      if (typeof fact.text !== 'string' || !fact.text.trim()) {
        throw new Error('Fact service returned no fact text');
      }
      setResponse(fact.text);
    } catch {
      setError('Unable to get a random fact. Please try again.');
    } finally {
      setIsGettingSuggestion(false);
    }
  }

  async function leaveGame() {
    const updatedGame = removePlayerFromGame(game, currentUser?.email);
    try {
      await saveGame(updatedGame);
      const response = await fetch('/api/auth/current-game', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentGameId: null }),
      });
      if (!response.ok) {
        throw new Error('Unable to clear current game');
      }
      setGame(null);
      setRoundResult(null);
      navigate('/games');
    } catch {
      setError('Unable to leave game. Please try again.');
    }
  }

  async function handleVote(winnerUsername, automated = false) {
    if ((!automated && currentUser?.email !== game.judge) || !allPlayersSubmitted) {
      return;
    }

    const winner = game.users.find((player) => player.username === winnerUsername);
    const judge = game.users.find((player) => player.username === game.judge);
    if (!winner) {
      return;
    }

    setRoundResult({
      judgeUsername: game.judge,
      judgePrompt: judge?.response ?? '',
      winnerUsername: winner.username,
      winningResponse: winner.response,
      playerResponses: game.users
        .filter((player) => player.username !== game.judge)
        .map((player) => ({ username: player.username, response: player.response })),
    });

    const updatedGame = {
      ...game,
      judge: winnerUsername,
      users: game.users.map((player) => ({
        ...player,
        score: player.username === winnerUsername ? player.score + 1 : player.score,
        response: '',
      })),
    };
    try {
      const savedGame = await saveGame(updatedGame);
      setGame(savedGame);
      setResponse('');
      setError('');
    } catch {
      setError('Unable to save round results. Please try again.');
    }
  }

  return (
    <main>
      <div className="d-flex justify-content-between align-items-center game mb-3">
        <span>You are in game: <span className="game-name">{game.name}</span></span>
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={leaveGame}>
          Leave Game
        </button>
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
          {judgeResponse
            ? `The Judge says: ${judgeResponse}`
            : waitingForJudgePrompt
              ? 'Waiting for the judge to make the prompt'
              : "You're the Judge! Submit a prompt!"}
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
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={getSuggestion}
                disabled={isGettingSuggestion}
              >
                {isGettingSuggestion ? 'Getting an idea...' : 'Generate an Idea'}
              </button>
            </div>
          </div>
        </section>
      )}
      {waitingForResponses && (
        <p className="mb-5" aria-live="polite">Waiting for responses...</p>
      )}
      {waitingForJudgeVote && (
        <p className="mb-5" aria-live="polite">Waiting for the judge to pick the best answer</p>
      )}

      {allPlayersSubmitted && currentUser?.email === game.judge && (
        <section aria-labelledby="vote-heading">
          <h2 id="vote-heading" className="h5 mb-2">VOTE FOR THE VICTOR</h2>
          <div className="btn-group-vertical w-100" role="group" aria-label="Vote for the victor">
            {game.users
              .filter((player) => player.username !== game.judge)
              .map((player) => (
              <button
                key={player.username}
                type="button"
                className="btn btn-outline-primary"
                onClick={() => handleVote(player.username)}
              >
                {player.response}
              </button>
              ))}
          </div>
        </section>
      )}

      {roundResult && (
        <>
          <div className="modal-backdrop fade show" />
          <div
            className="modal d-block"
            role="dialog"
            aria-modal="true"
            aria-labelledby="round-result-title"
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h2 id="round-result-title" className="modal-title fs-5">Round Results</h2>
                  <button
                    type="button"
                    className="btn-close"
                    aria-label="Dismiss round results"
                    onClick={() => setRoundResult(null)}
                  />
                </div>
                <div className="modal-body">
                  <p className="fs-4"><strong>{roundResult.judgeUsername} says: {roundResult.judgePrompt}</strong></p>
                  <p className="fs-4"><strong>{roundResult.winnerUsername} won: {roundResult.winningResponse}</strong></p>
                  <ul className="list-group">
                    {roundResult.playerResponses.map((player) => (
                      <li key={player.username} className="list-group-item">
                        {player.username}: {player.response}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-primary" onClick={() => setRoundResult(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}