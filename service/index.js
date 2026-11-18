const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
const database = require('./database');
const app = express();

const authCookieName = 'token';

const port = process.argv.length > 2 ? process.argv[2] : 4000;
const frontendDirectory = fs.existsSync(path.join(__dirname, 'public', 'index.html'))
  ? path.join(__dirname, 'public')
  : path.join(__dirname, '..', 'dist');
const authCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

app.use(cookieParser());
app.use(express.json());
app.use(express.static(frontendDirectory));

// create a new user
app.post('/api/auth/create', async (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await database.getUserByEmail(normalizedEmail)) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    email: normalizedEmail,
    password: hashedPassword,
    authToken: uuid.v4(),
    currentGameId: null,
  };
  try {
    await database.addUser(user);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }
    throw error;
  }
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
  const user = await database.getUserByEmail(normalizedEmail);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }

  const authToken = uuid.v4();
  await database.updateUserByEmail(user.email, { authToken });
  res.cookie(authCookieName, authToken, authCookieOptions);

  return res.json({ email: user.email, currentGameId: user.currentGameId });
});

// Verify the current auth token
app.get('/api/auth/me', async (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = await database.getUserByAuthToken(authToken);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  return res.json({ email: user.email, currentGameId: user.currentGameId });
});

// Set or clear the authenticated user's current game
app.put('/api/auth/current-game', async (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = await database.getUserByAuthToken(authToken);
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
    && !(await database.getGameById(currentGameId))
  ) {
    return res.status(404).json({ error: 'Game not found' });
  }

  await database.updateUserByEmail(user.email, { currentGameId });
  return res.json({ email: user.email, currentGameId });
});

// Get the authenticated user's current game
app.get('/api/auth/current-game', async (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = await database.getUserByAuthToken(authToken);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (user.currentGameId === null) {
    return res.json(null);
  }

  const game = await database.getGameById(user.currentGameId);
  if (!game) {
    await database.updateUserByEmail(user.email, { currentGameId: null });
    return res.json(null);
  }

  return res.json(game);
});

// Revoke the current user's auth token
app.post('/api/auth/logout', async (req, res) => {
  const authToken = req.cookies[authCookieName];
  const user = await database.getUserByAuthToken(authToken);
  if (user) {
    await database.clearUserAuthToken(user.email);
  }

  res.clearCookie(authCookieName, authCookieOptions);
  return res.status(204).end();
});

// Add a game
app.post('/api/games', async (req, res) => {
  const game = req.body;

  if (!game || typeof game !== 'object' || Array.isArray(game)) {
    return res.status(400).json({ error: 'Game data must be a JSON object' });
  }

  await database.addGame(game);
  return res.status(201).json(game);
});

// Clear all games for development
app.delete('/api/games', async (req, res) => {
  await database.deleteAllGames();
  await database.setAllUsersCurrentGameId(null);
  return res.status(204).end();
});

// Get all games
app.get('/api/games', async (req, res) => {
  return res.json(await database.getAllGames());
});

// Get a game by ID
app.get('/api/games/:id', async (req, res) => {
  const game = await database.getGameById(req.params.id);
  if (!game) {
    return res.status(404).json({ error: 'Game not found' });
  }

  return res.json(game);
});

// Replace a game with the given ID
app.put('/api/games/:id', async (req, res) => {
  const game = req.body;

  if (!game || typeof game !== 'object' || Array.isArray(game)) {
    return res.status(400).json({ error: 'Game data must be a JSON object' });
  }
  if (game.id === undefined || String(game.id) !== req.params.id) {
    return res.status(400).json({ error: 'Game ID must match the request URL' });
  }

  const replaced = await database.replaceGame(req.params.id, game);
  if (!replaced) {
    return res.status(404).json({ error: 'Game not found' });
  }

  return res.json(game);
});

app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  return res.sendFile(path.join(frontendDirectory, 'index.html'), (error) => {
    if (error) {
      next(error);
    }
  });
});

database.connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to MongoDB:', error.message);
    process.exit(1);
  });