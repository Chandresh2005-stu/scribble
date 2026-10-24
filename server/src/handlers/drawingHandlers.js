
const rooms = require("../state/rooms");

const MAX_STROKES = 5000;
const MAX_LINE_WIDTH = 50;

function registerDrawingHandlers(io, socket) {
  // Synchronize a drawing segment with every other player.
  socket.on("draw-line", (data) => {
    if (!data || typeof data.roomCode !== "string") return;

    const roomCode = data.roomCode.trim().toUpperCase();
    const { from, to } = data;

    if (
      !from ||
      !to ||
      !Number.isFinite(from.x) ||
      !Number.isFinite(from.y) ||
      !Number.isFinite(to.x) ||
      !Number.isFinite(to.y)
    ) {
      return;
    }

    if (!socket.rooms.has(roomCode)) return;

    const room = rooms.get(roomCode);

    if (
      !room ||
      !room.gameStarted ||
      room.drawer !== socket.id ||
      !room.currentWord
    ) {
      return;
    }

    // Initialize drawing history for this room.
    if (!Array.isArray(room.drawStrokes)) {
      room.drawStrokes = [];
    }

    // Prevent unlimited drawing history.
    if (room.drawStrokes.length >= MAX_STROKES) return;

    const color =
      typeof data.color === "string" &&
      /^#[0-9a-fA-F]{6}$/.test(data.color)
        ? data.color
        : "#000000";

    const lineWidth =
      Number.isFinite(data.lineWidth) &&
      data.lineWidth >= 1 &&
      data.lineWidth <= MAX_LINE_WIDTH
        ? data.lineWidth
        : 3;

    const strokeId =
      typeof data.strokeId === "string" &&
      data.strokeId.length <= 100
        ? data.strokeId
        : null;

    const segment = {
      from: { x: from.x, y: from.y },
      to: { x: to.x, y: to.y },
      color,
      lineWidth,
      strokeId,
    };

    room.drawStrokes.push(segment);

    socket.to(roomCode).emit("draw-line", segment);
  });

  // Undo the most recent stroke.
  socket.on("undo-canvas", (enteredCode) => {
    if (typeof enteredCode !== "string") return;

    const roomCode = enteredCode.trim().toUpperCase();

    if (!socket.rooms.has(roomCode)) return;

    const room = rooms.get(roomCode);

    if (
      !room ||
      !room.gameStarted ||
      room.drawer !== socket.id ||
      !room.currentWord
    ) {
      return;
    }

    if (!Array.isArray(room.drawStrokes)) {
      room.drawStrokes = [];
    }

    if (room.drawStrokes.length === 0) return;

    // Remove every segment belonging to the most recent stroke.
    const lastSegment = room.drawStrokes[room.drawStrokes.length - 1];
    const lastStrokeId = lastSegment.strokeId;

    if (lastStrokeId) {
      room.drawStrokes = room.drawStrokes.filter(
        (segment) => segment.strokeId !== lastStrokeId
      );
    } else {
      // Fallback until the client sends stroke IDs.
      room.drawStrokes.pop();
    }

    io.to(roomCode).emit("canvas-updated", {
      strokes: room.drawStrokes,
    });
  });

  // Clear the canvas for every player.
  socket.on("clear-canvas", (enteredCode) => {
    if (typeof enteredCode !== "string") return;

    const roomCode = enteredCode.trim().toUpperCase();

    if (!socket.rooms.has(roomCode)) return;

    const room = rooms.get(roomCode);

    if (
      !room ||
      !room.gameStarted ||
      room.drawer !== socket.id ||
      !room.currentWord
    ) {
      return;
    }

    room.drawStrokes = [];

    io.to(roomCode).emit("clear-canvas");
  });
}

module.exports = registerDrawingHandlers;
