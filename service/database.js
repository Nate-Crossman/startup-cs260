const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('startup');
const userCollection = db.collection('user');
const gamesCollection = db.collection('games');

function gameIdFilter(id) {
  return {
    $expr: {
      $eq: [
        { $convert: { input: '$id', to: 'string', onError: '', onNull: '' } },
        String(id),
      ],
    },
  };
}

async function connectToDatabase() {
  await client.connect();
  await userCollection.createIndex({ email: 1 }, { unique: true });
}

function getUserByEmail(email) {
  return userCollection.findOne({ email });
}

function getUserByAuthToken(authToken) {
  if (typeof authToken !== 'string') {
    return Promise.resolve(null);
  }

  return userCollection.findOne({ authToken });
}

function addUser(user) {
  return userCollection.insertOne(user);
}

function updateUserByEmail(email, updates) {
  return userCollection.updateOne({ email }, { $set: updates });
}

function clearUserAuthToken(email) {
  return userCollection.updateOne({ email }, { $set: { authToken: null } });
}

function setAllUsersCurrentGameId(currentGameId) {
  return userCollection.updateMany({}, { $set: { currentGameId } });
}

function addGame(game) {
  const gameToStore = { ...game };
  delete gameToStore._id;
  return gamesCollection.insertOne(gameToStore);
}

function deleteAllGames() {
  return gamesCollection.deleteMany({});
}

function getAllGames() {
  return gamesCollection.find({}, { projection: { _id: 0 } }).toArray();
}

function getGameById(id) {
  return gamesCollection.findOne(gameIdFilter(id), { projection: { _id: 0 } });
}

async function replaceGame(id, game) {
  const replacement = { ...game };
  delete replacement._id;
  const result = await gamesCollection.replaceOne(gameIdFilter(id), replacement);
  return result.matchedCount > 0;
}

module.exports = {
  connectToDatabase,
  getUserByEmail,
  getUserByAuthToken,
  addUser,
  updateUserByEmail,
  clearUserAuthToken,
  setAllUsersCurrentGameId,
  addGame,
  deleteAllGames,
  getAllGames,
  getGameById,
  replaceGame,
};
