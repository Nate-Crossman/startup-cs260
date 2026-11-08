const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';

let users = []
let games = []

const port = process.argv.length > 2 ? process.argv[2] : 4000;
const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

app.use(cookieParser());
app.use(express.json());
app.use(express.static('public'));

// create a new user
app.post('/api/auth/create', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (users.some((user) => user.email === normalizedEmail)) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    email: normalizedEmail,
    password: hashedPassword,
    authToken: uuid.v4(),
    currentGameId: null,
  };
  users.push(user);
  res.cookie(authCookieName, user.authToken, authCookieOptions);

  return res.status(201).json({ email: normalizedEmail, currentGameId: user.currentGameId });
});

// login existing user
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((candidate) => candidate.email === normalizedEmail);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }

  user.authToken = uuid.v4();
  res.cookie(authCookieName, user.authToken, authCookieOptions);

  return res.json({ email: user.email, currentGameId: user.currentGameId });
});

// Verify the current auth token
app.get('/api/auth/me', (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = users.find((candidate) => candidate.authToken === authToken);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  return res.json({ email: user.email, currentGameId: user.currentGameId });
});

// Set or clear the authenticated user's current game
app.put('/api/auth/current-game', (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = users.find((candidate) => candidate.authToken === authToken);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { currentGameId } = req.body ?? {};
  if (
    currentGameId !== null
    && !(typeof currentGameId === 'string' && currentGameId.length > 0)
    && !(typeof currentGameId === 'number' && Number.isFinite(currentGameId))
  ) {
    return res.status(400).json({ error: 'currentGameId must be a game ID or null' });
  }

  if (
    currentGameId !== null
    && !games.some((game) => String(game.id) === String(currentGameId))
  ) {
    return res.status(404).json({ error: 'Game not found' });
  }

  user.currentGameId = currentGameId;
  return res.json({ email: user.email, currentGameId: user.currentGameId });
});

// Revoke the current user's auth token
app.post('/api/auth/logout', (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = users.find((candidate) => candidate.authToken === authToken);
  if (user) {
    user.authToken = null;
  }

  res.clearCookie(authCookieName, authCookieOptions);
  return res.status(204).end();
});

// Add a game
app.post('/api/games', (req, res) => {
  const game = req.body;

  if (!game || typeof game !== 'object' || Array.isArray(game)) {
    return res.status(400).json({ error: 'Game data must be a JSON object' });
  }

  games.push(game);
  return res.status(201).json(game);
});

// Clear all games for development
app.delete('/api/games', (req, res) => {
  games = [];
  users.forEach((user) => {
    user.currentGameId = null;
  });
  return res.status(204).end();
});

// Get all games
app.get('/api/games', (req, res) => {
  return res.json(games);
});

// Get a game by ID
app.get('/api/games/:id', (req, res) => {
  const game = games.find((existingGame) => String(existingGame.id) === req.params.id);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  return res.json(game);
});

// Replace a game with the given ID
app.put('/api/games/:id', (req, res) => {
  const game = req.body;

  if (!game || typeof game !== 'object' || Array.isArray(game)) {
    return res.status(400).json({ error: 'Game data must be a JSON object' });
  }
  if (game.id === undefined || String(game.id) !== req.params.id) {
    return res.status(400).json({ error: 'Game ID must match the request URL' });
  }

  const gameIndex = games.findIndex((existingGame) => String(existingGame.id) === req.params.id);
  if (gameIndex === -1) {
    return res.status(404).json({ error: 'Game not found' });
  }

  games[gameIndex] = game;
  return res.json(game);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});