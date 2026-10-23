export function removePlayerFromGame(game, username) {
  const users = game.users
    .filter((player) => player.username !== username)
    .map((player) => ({ ...player, response: '' }));
  const judge = game.judge === username
    ? users.length > 0
      ? users[Math.floor(Math.random() * users.length)].username
      : null
    : game.judge;

  return { ...game, judge, users };
}
