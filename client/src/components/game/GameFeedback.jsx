
function GameFeedback({
  correctGuessMessage,
  restartError,
  roundEndedWord,
}) {
  return (
    <>
      {correctGuessMessage && (
        <div role="status" className="game-feedback game-feedback-success">
          {correctGuessMessage}
        </div>
      )}

      {restartError && (
        <div role="alert" className="game-feedback game-feedback-error">
          {restartError}
        </div>
      )}

      {roundEndedWord && (
        <div role="status" className="game-feedback game-feedback-round">
          Round over! The word was <strong>{roundEndedWord}</strong>
        </div>
      )}
    </>
  );
}

export default GameFeedback;
