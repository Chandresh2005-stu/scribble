
import GameCanvas from "./GameCanvas";
import WordChoices from "./WordChoices";

function GameDrawingPanel({
  isDrawer,
  selectedWord,
  hint,
  wordChoices,
  onSelectWord,
  canvasRef,
  socket,
  roomCode,
  timeLeft,
}) {
  return (
    <section className="game-main-panel">
      <div className="game-panel-heading">
        <div>
          <p className="game-eyebrow">DRAWING BOARD</p>
          <h1>
            {isDrawer ? "Your turn to draw" : "What's the word?"}
          </h1>
        </div>

        <div className="game-word-indicator">
          {isDrawer
            ? selectedWord
              ? `Word: ${selectedWord}`
              : "Pick a word below"
            : "Make your guess"}
        </div>
      </div>

      {!isDrawer && hint && (
        <div className="game-hint" role="status" aria-label="Word hint">
          <span className="game-hint-label">WORD HINT</span>
          <strong className="game-hint-word">{hint}</strong>
        </div>
      )}

      <WordChoices
        isDrawer={isDrawer}
        selectedWord={selectedWord}
        wordChoices={wordChoices}
        onSelectWord={onSelectWord}
      />

      <div className="game-canvas-shell">
        <GameCanvas
          canvasRef={canvasRef}
          socket={socket}
          roomCode={roomCode}
          isDrawer={isDrawer}
          selectedWord={selectedWord}
          timeLeft={timeLeft}
        />
      </div>

      <div className="game-canvas-footer">
        <span>
          {isDrawer
            ? "Draw clearly so other players can guess."
            : "Type your guess in the chat panel."}
        </span>
        <span>
          {timeLeft > 0
            ? `${timeLeft} seconds left`
            : "Waiting for round"}
        </span>
      </div>
    </section>
  );
}

export default GameDrawingPanel;
