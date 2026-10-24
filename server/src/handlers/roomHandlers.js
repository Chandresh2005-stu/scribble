
const rooms = require("../state/rooms");
const generateRoomCode = require("../utils/generateRoomCode");
const { categories } = require("../utils/words");

const DEFAULT_MAX_PLAYERS = 8;
const DEFAULT_ROUNDS = 5;
const DEFAULT_DRAW_TIME = 60;
const DEFAULT_CATEGORY = "Mixed";
const MAX_CUSTOM_WORDS = 100;

function getPlayerName(name) {
  if (typeof name !== "string" || !name.trim()) {
    return "Player";
  }

  return name.trim().slice(0, 20);
}

function getIntegerSetting(value, min, max, fallback) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < min || number > max) {
    return fallback;
  }

  return number;
}

function getCategory(value) {
  return typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(categories, value)
    ? value
    : DEFAULT_CATEGORY;
}

function getCustomWords(value) {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .filter((word) => typeof word === "string")
        .map((word) => word.trim().toLowerCase())
        .filter(
          (word) =>
            word.length >= 2 &&
            word.length <= 30 &&
            /^[a-zA-Z ]+$/.test(word)
        )
    ),
  ].slice(0, MAX_CUSTOM_WORDS);
}

function resetGameState(room) {
  if (room.roundTimer) clearTimeout(room.roundTimer);
  if (room.hintTimer) clearInterval(room.hintTimer);

  room.gameStarted = false;
  room.roundNumber = 0;
  room.drawer = null;
  room.currentWord = null;
  room.wordChoices = [];
  room.roundEndsAt = null;
  room.roundTimer = null;
  room.hintTimer = null;
  room.wrongGuesses = {};
  room.correctGuessers = [];
  room.hintRevealedCount = 0;
  room.currentHint = "";
}

function getRoomData(roomCode, room) {
  return {
    roomCode,
    players: [...room.players],
    playerNames: { ...(room.playerNames || {}) },
    scores: { ...(room.scores || {}) },
    host: room.host,
    maxPlayers: room.maxPlayers,
    rounds: room.rounds,
    drawTime: room.drawTime,
    category: room.category || DEFAULT_CATEGORY,
    customWords: [...(room.customWords || [])],
  };
}

function registerRoomHandlers(io, socket) {
  socket.on("create-room", (data) => {
    const playerName = getPlayerName(
      typeof data === "string" ? data : data?.playerName
    );

    const settings =
      data && typeof data === "object" && data.settings
        ? data.settings
        : {};

    const maxPlayers = getIntegerSetting(
      settings.maxPlayers,
      2,
      20,
      DEFAULT_MAX_PLAYERS
    );

    const rounds = getIntegerSetting(
      settings.rounds,
      2,
      10,
      DEFAULT_ROUNDS
    );

    const drawTime = getIntegerSetting(
      settings.drawTime,
      15,
      240,
      DEFAULT_DRAW_TIME
    );

    const category = getCategory(settings.category);
    const customWords = getCustomWords(settings.customWords);

    const roomCode = generateRoomCode();

    const room = {
      host: socket.id,
      players: [socket.id],
      playerNames: { [socket.id]: playerName },
      scores: { [socket.id]: 0 },

      maxPlayers,
      rounds,
      drawTime,
      category,
      customWords,

      gameStarted: false,
      roundNumber: 0,
      drawer: null,
      currentWord: null,
      wordChoices: [],
      roundEndsAt: null,
      roundTimer: null,
      hintTimer: null,
      wrongGuesses: {},
      correctGuessers: [],
      hintRevealedCount: 0,
      currentHint: "",
    };

    rooms.set(roomCode, room);
    socket.join(roomCode);
    socket.emit("room-created", getRoomData(roomCode, room));

    console.log("Room created:", roomCode, {
      maxPlayers,
      rounds,
      drawTime,
      category,
      customWordCount: customWords.length,
    });
  });

  socket.on("join-room", (data) => {
    if (!data || typeof data.roomCode !== "string") {
      socket.emit("join-error", "Please enter a valid room code.");
      return;
    }

    const roomCode = data.roomCode.trim().toUpperCase();
    const playerName = getPlayerName(data.playerName);
    const room = rooms.get(roomCode);

    if (!room) {
      socket.emit("join-error", "Room not found. Check the room code.");
      return;
    }

    if (room.players.includes(socket.id)) {
      socket.emit("join-error", "You have already joined this room.");
      return;
    }

    if (room.gameStarted) {
      socket.emit("join-error", "This game has already started.");
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit("join-error", "This room is full.");
      return;
    }

    room.players.push(socket.id);

    if (!room.playerNames) room.playerNames = {};
    room.playerNames[socket.id] = playerName;

    if (!room.scores) room.scores = {};
    room.scores[socket.id] = 0;

    socket.join(roomCode);

    const roomData = getRoomData(roomCode, room);

    socket.emit("room-joined", roomData);
    io.to(roomCode).emit("room-updated", roomData);

    console.log("Player joined room:", playerName, socket.id, roomCode);
  });

  socket.on("start-game", (enteredCode) => {
    if (typeof enteredCode !== "string") {
      socket.emit("start-game-error", "Invalid room code.");
      return;
    }

    const roomCode = enteredCode.trim().toUpperCase();
    const room = rooms.get(roomCode);

    if (!room || !room.players.includes(socket.id)) {
      socket.emit("start-game-error", "You are not in this room.");
      return;
    }

    if (room.host !== socket.id) {
      socket.emit("start-game-error", "Only the host can start the game.");
      return;
    }

    if (room.gameStarted) {
      socket.emit("start-game-error", "Game has already started.");
      return;
    }

    if (room.players.length < 2) {
      socket.emit(
        "start-game-error",
        "At least 2 players are required to start a game."
      );
      return;
    }

    resetGameState(room);

    room.scores = {};
    room.players.forEach((playerId) => {
      room.scores[playerId] = 0;
    });

    room.gameStarted = true;
    room.roundNumber = 1;

    const drawerIndex = Math.floor(Math.random() * room.players.length);
    room.drawer = room.players[drawerIndex];

    io.to(roomCode).emit("game-started", {
      roomCode,
      drawerId: room.drawer,
      roundNumber: room.roundNumber,
    });

    io.to(roomCode).emit("room-updated", getRoomData(roomCode, room));

    console.log("Game started:", roomCode);
  });

  socket.on("leave-room", (enteredCode) => {
    if (typeof enteredCode !== "string") return;

    const roomCode = enteredCode.trim().toUpperCase();
    const room = rooms.get(roomCode);

    if (!room || !room.players.includes(socket.id)) return;

    removePlayerFromRoom(io, socket, roomCode, room);

    socket.leave(roomCode);
    socket.emit("room-left");

    console.log("Player left room:", socket.id, roomCode);
  });

  socket.on("disconnect", () => {
    for (const [roomCode, room] of rooms.entries()) {
      if (!room.players.includes(socket.id)) continue;

      removePlayerFromRoom(io, socket, roomCode, room);

      console.log("Player disconnected:", socket.id, roomCode);
    }
  });
}

function removePlayerFromRoom(io, socket, roomCode, room) {
  const wasDrawer = room.drawer === socket.id;
  const gameWasStarted = room.gameStarted;
  const currentRound = room.roundNumber || 1;

  room.players = room.players.filter((playerId) => playerId !== socket.id);

  if (room.playerNames) delete room.playerNames[socket.id];
  if (room.scores) delete room.scores[socket.id];
  if (room.wrongGuesses) delete room.wrongGuesses[socket.id];

  if (room.correctGuessers) {
    room.correctGuessers = room.correctGuessers.filter(
      (playerId) => playerId !== socket.id
    );
  }

  if (room.players.length === 0) {
    resetGameState(room);
    rooms.delete(roomCode);
    console.log("Room deleted:", roomCode);
    return;
  }

  if (room.host === socket.id) {
    room.host = room.players[0];
  }

  if (gameWasStarted && room.players.length < 2) {
    resetGameState(room);

    io.to(roomCode).emit("game-stopped", {
      reason: "not-enough-players",
    });
  } else if (wasDrawer && gameWasStarted) {
    resetGameState(room);

    io.to(roomCode).emit("round-ended", {
      word: null,
      reason: "drawer-left",
    });

    if (currentRound >= room.rounds) {
      const scores = { ...(room.scores || {}) };
      const playerNames = { ...(room.playerNames || {}) };

      const rankedPlayers = room.players
        .map((playerId) => ({
          playerId,
          playerName: playerNames[playerId] || "Player",
          score: scores[playerId] || 0,
        }))
        .sort((a, b) => b.score - a.score);

      const highestScore = rankedPlayers[0]?.score ?? 0;
      const winners = rankedPlayers.filter(
        (player) => player.score === highestScore
      );

      room.gameStarted = false;
      room.drawer = null;
      room.roundNumber = currentRound;

      io.to(roomCode).emit("game-ended", {
        scores,
        playerNames,
        rankedPlayers,
        winners,
        winner: winners.length === 1 ? winners[0] : null,
        isTie: winners.length > 1,
        roundsPlayed: currentRound - 1,
      });
    } else {
      room.gameStarted = true;
      room.roundNumber = currentRound + 1;

      const nextDrawerIndex = Math.floor(Math.random() * room.players.length);
      room.drawer = room.players[nextDrawerIndex];

      io.to(roomCode).emit("game-started", {
        roomCode,
        drawerId: room.drawer,
        roundNumber: room.roundNumber,
      });

      console.log("Advanced to round:", room.roundNumber, roomCode);
    }
  }

  io.to(roomCode).emit("room-updated", getRoomData(roomCode, room));
}

module.exports = registerRoomHandlers;
