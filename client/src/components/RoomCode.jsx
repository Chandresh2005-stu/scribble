
import { useState } from "react";
import "./RoomCode.css";

function RoomCode({ roomCode }) {
  const [copied, setCopied] = useState(false);

  if (!roomCode) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="room-code-card">
      <div className="room-code-content">
        <span className="room-code-label">ROOM CODE</span>
        <strong className="room-code-value">{roomCode}</strong>
        <span className="room-code-hint">
          Share this code with your friends
        </span>
      </div>

      <button
        type="button"
        className="room-code-copy-button"
        onClick={handleCopy}
        aria-label="Copy room code"
      >
        {copied ? "✓ Copied" : "Copy Code"}
      </button>
    </div>
  );
}

export default RoomCode;
