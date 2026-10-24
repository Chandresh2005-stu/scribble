import { useEffect, useState } from "react";
import socket from "../services/socket";

function useSocket() {
  const [status, setStatus] = useState(
    socket.connected ? "Connected to backend!" : "Connecting...",
  );

  useEffect(() => {
    const onConnect = () => setStatus("Connected to backend!");
    const onDisconnect = () => setStatus("Disconnected from backend");

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  return { socket, status };
}
export default useSocket;
