
const { Server } = require("socket.io");

const registerRoomHandlers = require("../handlers/roomHandlers");
const registerDrawingHandlers = require("../handlers/drawingHandlers");
const registerGameHandlers = require("../handlers/gameHandlers");

function initializeSocket(httpServer) {
  const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL,
  ].filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Player connected:", socket.id);

    registerRoomHandlers(io, socket);
    registerDrawingHandlers(io, socket);
    registerGameHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("Player disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = initializeSocket;
