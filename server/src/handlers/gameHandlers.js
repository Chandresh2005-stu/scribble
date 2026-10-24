
const rooms = require("../state/rooms");
const { getWords } = require("../utils/words");

const DEFAULT_ROUND_DURATION = 60;
const DEFAULT_MAX_ROUNDS = 5;
const MAX_WRONG_GUESSES = 3;
const CORRECT_GUESS_POINTS = 100;
const DRAWER_GUESS_POINTS = 50;
const HINT_INTERVAL = 15;

function getRoundDuration(room) {
  return Number.isInteger(room.drawTime) &&
    room.drawTime >= 15 &&
    room.drawTime <= 240
    ? room.drawTime
    : DEFAULT_ROUND_DURATION;
}

function getMaxRounds(room) {
  return Number.isInteger(room.rounds) &&
    room.rounds >= 2 &&
    room.rounds <= 10
    ? room.rounds
    : DEFAULT_MAX_ROUNDS;
}

function createHint(word, revealedCount = 0) {
  const letterPositions = [];

  for (let i = 0; i < word.length; i++) {
    if (/[a-zA-Z]/.test(word[i])) {
      letterPositions.push(i);
    }
  }

  const revealedPositions = new Set(
    letterPositions.slice(0, revealedCount)
  );

  return [...word]
    .map((character, index) => {
      if (!/[a-zA-Z]/.test(character)) {
        return character;
      }

      return revealedPositions.has(index) ? character : "_";
    })
    .join(" ");
}

function areAllGuessersFinished(room) {
  const eligibleGuessers = room.players.filter(
    (playerId) => playerId !== room.drawer
  );

  return (
    eligibleGuessers.length > 0 &&
    eligibleGuessers.every(
      (playerId) =>
        room.correctGuessers?.includes(playerId) ||
        (room.wrongGuesses?.[playerId] || 0) >= MAX_WRONG_GUESSES
    )
  );
}

function endRound(io, roomCode, room) {
  if (!room || !room.gameStarted || !room.currentWord) {
    return;
  }

  const word = room.currentWord;
  const endedRound = room.roundNumber || 1;
  const maxRounds = getMaxRounds(room);

  if (room.roundTimer) clearTimeout(room.roundTimer);
  if (room.hintTimer) clearInterval(room.hintTimer);

  room.roundTimer = null;
  room.hintTimer = null;

  io.to(roomCode).emit("round-ended", {
    word,
    roundNumber: endedRound,
  });

  room.currentWord = null;
  room.roundEndsAt = null;
  room.wordChoices = [];
  room.wrongGuesses = {};
  room.correctGuessers = [];
  room.hintRevealedCount = 0;
  room.currentHint = "";

  if (endedRound >= maxRounds) {
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
    room.roundNumber = maxRounds;

    io.to(roomCode).emit("game-ended", {
      scores,
      playerNames,
      rankedPlayers,
      winners,
      winner: winners.length === 1 ? winners[0] : null,
      isTie: winners.length > 1,
      roundsPlayed: maxRounds,
    });

    console.log("Game ended:", roomCode);
    return;
  }

  if (!room.players.length) {
    room.gameStarted = false;
    room.drawer = null;
    return;
  }

  const previousDrawerIndex = room.players.indexOf(room.drawer);
  const nextDrawerIndex =
    previousDrawerIndex < 0
      ? 0
      : (previousDrawerIndex + 1) % room.players.length;

  room.drawer = room.players[nextDrawerIndex];
  room.roundNumber = endedRound + 1;

  io.to(roomCode).emit("game-started", {
    roomCode,
    drawerId: room.drawer,
    roundNumber: room.roundNumber,
  });

  console.log("Starting round:", room.roundNumber, roomCode);
}

function registerGameHandlers(io, socket) {
  socket.on("get-game-state", (enteredCode) => {
    if (typeof enteredCode !== "string") return;

    const roomCode = enteredCode.trim().toUpperCase();
    const room = rooms.get(roomCode);

    if (!room || !room.players.includes(socket.id)) return;

    socket.emit("game-state", {
      gameStarted: room.gameStarted,
      drawerId: room.drawer,
      currentWord:
        room.drawer === socket.id ? room.currentWord : null,
      roundEndTime: room.roundEndsAt,
      wordSelected: Boolean(room.currentWord),
      scores: { ...(room.scores || {}) },
      playerNames: { ...(room.playerNames || {}) },
      roundNumber: room.roundNumber || 0,
      hint: room.drawer === socket.id ? null : room.currentHint || "",
    });
  });

  // Generate choices from this room's category and custom words.
  socket.on("get-word-choices", (enteredCode) => {
    if (typeof enteredCode !== "string") return;

    const roomCode = enteredCode.trim().toUpperCase();
    const room = rooms.get(roomCode);

    if (
      !room ||
      !room.gameStarted ||
      !room.players.includes(socket.id) ||
      room.drawer !== socket.id ||
      room.currentWord
    ) {
      return;
    }

    const availableWords = getWords(
      room.category,
      room.customWords
    );

    const shuffledWords = [...availableWords].sort(
      () => Math.random() - 0.5
    );

    const choices = shuffledWords.slice(0, 3);

    if (choices.length === 0) {
      socket.emit("word-selection-error", "No words are available.");
      return;
    }

    room.wordChoices = choices;
    socket.emit("word-choices", choices);
  });

  socket.on("select-word", ({ roomCode, word } = {}) => {
    if (typeof roomCode !== "string" || typeof word !== "string") {
      return;
    }

    roomCode = roomCode.trim().toUpperCase();

    const room = rooms.get(roomCode);

    if (
      !room ||
      !room.gameStarted ||
      !room.players.includes(socket.id) ||
      room.drawer !== socket.id ||
      !room.wordChoices?.includes(word) ||
      room.currentWord
    ) {
      return;
    }

    const roundDuration = getRoundDuration(room);

    room.currentWord = word;
    room.wrongGuesses = {};
    room.correctGuessers = [];
    room.hintRevealedCount = 0;
    room.currentHint = createHint(word, 0);
    room.roundEndsAt = Date.now() + roundDuration * 1000;

    socket.emit("word-selected", word);
    socket.to(roomCode).emit("word-selected", null);

    io.to(roomCode).emit("hint-updated", {
      hint: room.currentHint,
      revealedCount: room.hintRevealedCount,
    });

    io.to(roomCode).emit("round-started", {
      drawerId: room.drawer,
      roundNumber: room.roundNumber,
      roundEndTime: room.roundEndsAt,
    });

    if (room.roundTimer) clearTimeout(room.roundTimer);
    if (room.hintTimer) clearInterval(room.hintTimer);

    room.hintTimer = setInterval(() => {
      const currentRoom = rooms.get(roomCode);

      if (
        !currentRoom ||
        !currentRoom.gameStarted ||
        currentRoom.currentWord !== word
      ) {
        if (currentRoom?.hintTimer) {
          clearInterval(currentRoom.hintTimer);
          currentRoom.hintTimer = null;
        }
        return;
      }

      const letterCount = [...word].filter((character) =>
        /[a-zA-Z]/.test(character)
      ).length;

      if (currentRoom.hintRevealedCount >= letterCount) {
        clearInterval(currentRoom.hintTimer);
        currentRoom.hintTimer = null;
        return;
      }

      currentRoom.hintRevealedCount += 1;
      currentRoom.currentHint = createHint(
        word,
        currentRoom.hintRevealedCount
      );

      io.to(roomCode).emit("hint-updated", {
        hint: currentRoom.currentHint,
        revealedCount: currentRoom.hintRevealedCount,
      });

      if (currentRoom.hintRevealedCount >= letterCount) {
        clearInterval(currentRoom.hintTimer);
        currentRoom.hintTimer = null;
      }
    }, HINT_INTERVAL * 1000);

    room.roundTimer = setTimeout(() => {
      const currentRoom = rooms.get(roomCode);

      if (
        !currentRoom ||
        !currentRoom.gameStarted ||
        currentRoom.currentWord !== word
      ) {
        return;
      }

      endRound(io, roomCode, currentRoom);
    }, roundDuration * 1000);
  });

  socket.on("send-chat-message", ({ roomCode, text } = {}) => {
    if (typeof roomCode !== "string" || typeof text !== "string") {
      return;
    }

    const normalizedRoomCode = roomCode.trim().toUpperCase();
    const message = text.trim();

    if (!message || message.length > 200) return;

    const room = rooms.get(normalizedRoomCode);

    if (!room || !room.players.includes(socket.id)) return;

    io.to(normalizedRoomCode).emit("chat-message", {
      playerId: socket.id,
      playerName: room.playerNames?.[socket.id] || "Player",
      text: message,
      timestamp: Date.now(),
    });
  });

  socket.on("submit-guess", ({ roomCode, guess } = {}) => {
    if (typeof roomCode !== "string" || typeof guess !== "string") {
      return;
    }

    roomCode = roomCode.trim().toUpperCase();

    const room = rooms.get(roomCode);

    if (
      !room ||
      !room.players.includes(socket.id) ||
      !room.gameStarted ||
      !room.currentWord ||
      room.drawer === socket.id
    ) {
      return;
    }

    guess = guess.trim();

    if (!guess || guess.length > 100) return;
    if (room.correctGuessers?.includes(socket.id)) return;

    if (!room.wrongGuesses) room.wrongGuesses = {};

    const wrongCount = room.wrongGuesses[socket.id] || 0;

    if (wrongCount >= MAX_WRONG_GUESSES) {
      socket.emit("guess-limit-reached", {
        limit: MAX_WRONG_GUESSES,
      });
      return;
    }

    const playerName = room.playerNames?.[socket.id] || "Player";

    if (guess.toLowerCase() === room.currentWord.toLowerCase()) {
      if (!room.correctGuessers) room.correctGuessers = [];
      room.correctGuessers.push(socket.id);

      if (!room.scores) room.scores = {};
      if (room.scores[socket.id] == null) room.scores[socket.id] = 0;

      room.scores[socket.id] += CORRECT_GUESS_POINTS;

      if (room.scores[room.drawer] == null) {
        room.scores[room.drawer] = 0;
      }

      room.scores[room.drawer] += DRAWER_GUESS_POINTS;

      io.to(roomCode).emit("correct-guess", {
        playerId: socket.id,
        playerName,
        score: room.scores[socket.id],
        scores: { ...room.scores },
      });

      io.to(roomCode).emit("room-updated", {
        roomCode,
        players: [...room.players],
        playerNames: { ...(room.playerNames || {}) },
        scores: { ...room.scores },
        host: room.host,
        maxPlayers: room.maxPlayers,
        rounds: room.rounds,
        drawTime: room.drawTime,
        category: room.category || "Mixed",
        customWords: [...(room.customWords || [])],
      });

      console.log(
        "Correct guess:",
        playerName,
        roomCode,
        "Guesser score:",
        room.scores[socket.id],
        "Drawer score:",
        room.scores[room.drawer]
      );

      if (areAllGuessersFinished(room)) {
        endRound(io, roomCode, room);
      }

      return;
    }

    room.wrongGuesses[socket.id] = wrongCount + 1;

    io.to(roomCode).emit("player-guessed", {
      playerId: socket.id,
      playerName,
      guess,
    });

    if (room.wrongGuesses[socket.id] >= MAX_WRONG_GUESSES) {
      socket.emit("guess-limit-reached", {
        limit: MAX_WRONG_GUESSES,
      });
    }

    if (areAllGuessersFinished(room)) {
      endRound(io, roomCode, room);
    }
  });
}

module.exports = registerGameHandlers;
