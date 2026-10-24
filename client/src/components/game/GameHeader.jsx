
function GameHeader({ roomCode, onLeaveRoom }) {
  return (
    <header className="game-topbar">
      <div className="game-brand">
        <span className="game-brand-icon">✎</span>
        <span>Skribbl</span>
      </div>

      <div className="game-room-label">
        Room <strong>{roomCode}</strong>
      </div>

      <button
        type="button"
        className="game-button game-button-danger"
        onClick={onLeaveRoom}
      >
        Leave Room
      </button>
    </header>
  );
}

export default GameHeader;
