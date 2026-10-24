
function GameStatusBar({ isDrawer, selectedWord, timeLeft }) {
  return (
    <section className="game-statusbar">
      <div className="game-status-copy">
        <span className="game-status-dot" />
        <span>
          {isDrawer
            ? selectedWord
              ? "You're drawing"
              : "Choose a word"
            : "Guess the drawing"}
        </span>
      </div>

      <div
        className={`game-timer ${
          timeLeft <= 10 ? "game-timer-warning" : ""
        }`}
      >
        <span aria-hidden="true">◷</span>
        <strong>{timeLeft}s</strong>
      </div>
    </section>
  );
}

export default GameStatusBar;
