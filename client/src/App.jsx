
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";
import useSocket from "./hooks/useSocket";
import Game from "./pages/Game";

function App() {
  const { socket, status } = useSocket();

  const [room, setRoom] = useState(null);
  const [error, setError] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState("");

  // Read the room code from an invite URL, e.g. /?room=A1B2C3
  const [inviteRoomCode] = useState(() => {
    const params = new URLSearchParams(window.location.search);

    return (params.get("room") || "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
  });

  useEffect(() => {
    const onRoomCreated = (data) => {
      setError("");
      setGameStarted(false);
      setRoom(data);
    };

    const onRoomJoined = (data) => {
      setError("");
      setGameStarted(false);
      setRoom(data);
    };

    const onRoomUpdated = (data) => {
      setRoom((currentRoom) => {
        if (!currentRoom || currentRoom.roomCode !== data.roomCode) {
          return currentRoom;
        }

        return data;
      });
    };

    const onJoinError = (message) => setError(message);

    const onRoomLeft = () => {
      setRoom(null);
      setError("");
      setGameStarted(false);
      setPlayerName("");
    };

    const onGameStarted = (data) => {
      setRoom((currentRoom) => {
        if (!currentRoom || currentRoom.roomCode !== data.roomCode) {
          return currentRoom;
        }

        setGameStarted(true);
        return currentRoom;
      });
    };

    const onGameStopped = () => setGameStarted(false);

    socket.on("room-created", onRoomCreated);
    socket.on("room-joined", onRoomJoined);
    socket.on("room-updated", onRoomUpdated);
    socket.on("join-error", onJoinError);
    socket.on("room-left", onRoomLeft);
    socket.on("game-started", onGameStarted);
    socket.on("game-stopped", onGameStopped);

    return () => {
      socket.off("room-created", onRoomCreated);
      socket.off("room-joined", onRoomJoined);
      socket.off("room-updated", onRoomUpdated);
      socket.off("join-error", onJoinError);
      socket.off("room-left", onRoomLeft);
      socket.off("game-started", onGameStarted);
      socket.off("game-stopped", onGameStopped);
    };
  }, [socket]);

  const createRoom = (name, settings) => {
    setError("");
    setPlayerName(name);
    socket.emit("create-room", {
      playerName: name,
      settings,
    });
  };

  const joinRoom = (roomCode, name) => {
    setError("");
    setPlayerName(name);
    socket.emit("join-room", {
      roomCode,
      playerName: name,
    });
  };

  const leaveRoom = () => {
    if (room) socket.emit("leave-room", room.roomCode);
  };

  const startGame = () => {
    if (room) socket.emit("start-game", room.roomCode);
  };

  if (!room) {
    return (
      <Home
        status={status}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        error={error}
        initialRoomCode={inviteRoomCode}
      />
    );
  }

  if (gameStarted) {
    return (
      <Game
        socket={socket}
        roomCode={room.roomCode}
        playerName={playerName}
        onLeaveRoom={leaveRoom}
      />
    );
  }

  return (
    <Lobby
      status={status}
      room={room}
      currentPlayerId={socket.id}
      onLeaveRoom={leaveRoom}
      onStartGame={startGame}
      gameStarted={gameStarted}
    />
  );
}

export default App;
