const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';

let users = []
let games = []

const port = process.argv.length > 2 ? process.argv[2] : 4000;

app.use(express.json());
app.use(express.static('public'));

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
  users.push({ email: normalizedEmail, password: hashedPassword });

  return res.status(201).json({ email: normalizedEmail });
});

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

  return res.json({ email: user.email });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});