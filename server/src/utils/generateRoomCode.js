const rooms = require("../state/rooms");

function generateRoomCode() {
  let roomCode;

  do {
    roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (rooms.has(roomCode));

  return roomCode;
}

module.exports = generateRoomCode;
