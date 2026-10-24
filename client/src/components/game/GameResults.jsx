function GameResults({
  gameResults,
  restartError,
  onPlayAgain,
  onLeaveRoom,
}) {
  const rankedPlayers = gameResults.rankedPlayers || [];
  const winner = gameResults.winner;
  const isTie = gameResults.isTie;

  const leaveRoomButton = (
    <button
      type="button"
      className="game-button game-button-danger"
      onClick={onLeaveRoom}
    >
      Leave Room
    </button>
  );

  return (
    <main className="game-page game-results-page">
      <header className="game-topbar">
        <div className="game-brand">
          <span className="game-brand-icon">✎</span>
          <span>Skribbl</span>
        </div>

        {leaveRoomButton}
      </header>

      <section className="results-card">
        <div className="results-trophy">🏆</div>
        <p className="game-eyebrow">GAME COMPLETE</p>
        <h1>Game Over!</h1>

        {isTie ? (
          <h2>🤝 It's a tie!</h2>
        ) : winner ? (
          <h2>
            🎉 Winner: {winner.playerName} with {winner.score} points!
          </h2>
        ) : (
          <h2>Game finished!</h2>
        )}

        <h3>Final Scoreboard</h3>

        {rankedPlayers.length > 0 ? (
          <ol className="results-ranking">
            {rankedPlayers.map((player, index) => (
              <li key={player.playerId}>
                <span className="ranking-position">{index + 1}</span>
                <span className="ranking-name">{player.playerName}</span>
                <strong>{player.score} pts</strong>
              </li>
            ))}
          </ol>
        ) : (
          <p>No final rankings received.</p>
        )}

        <p className="results-rounds">
          Rounds played: {gameResults.roundsPlayed || 5}
        </p>

        {restartError && (
          <p role="alert" className="game-error">
            {restartError}
          </p>
        )}

        <div className="results-actions">
          <button
            type="button"
            className="game-button game-button-primary"
            onClick={onPlayAgain}
          >
            ↻ Play Again
          </button>

          {leaveRoomButton}
        </div>

        <p className="results-note">
          The host can restart the game for everyone in this room.
        </p>
      </section>
    </main>
  );
}

export default GameResults;
    