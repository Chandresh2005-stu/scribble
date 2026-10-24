
import GuessPanel from "./GuessPanel";

function GameSidebar({
  sortedScores,
  playerNames,
  socket,
  drawerId,
  isDrawer,
  timeLeft,
  correctGuess,
  guess,
  setGuess,
  submitGuess,
  messages,
  guessLimitReached,
  chatMessages,
  onSendChat,
}) {
  return (
    <aside className="game-sidebar">
      <section className="game-side-card">
        <div className="game-side-heading">
          <div>
            <p className="game-eyebrow">LEADERBOARD</p>
            <h2>Players</h2>
          </div>
          <span className="game-player-count">{sortedScores.length}</span>
        </div>

        {sortedScores.length === 0 ? (
          <p className="game-empty-state">Waiting for scores...</p>
        ) : (
          <ol className="game-score-list">
            {sortedScores.map(([playerId, score], index) => (
              <li
                key={playerId}
                className={
                  playerId === socket.id ? "game-score-self" : ""
                }
              >
                <span className="game-score-rank">{index + 1}</span>

                <span className="game-score-avatar">
                  {(playerNames[playerId] || `P${index + 1}`)
                    .charAt(0)
                    .toUpperCase()}
                </span>

                <span className="game-score-name">
                  {playerNames[playerId] || `Player ${playerId}`}

                  {playerId === socket.id && (
                    <small className="game-you-label">YOU</small>
                  )}

                  {playerId === drawerId && (
                    <small className="game-drawer-label">DRAWER</small>
                  )}
                </span>

                <strong className="game-score-points">{score}</strong>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="game-side-card game-chat-card">
        <div className="game-side-heading">
          <div>
            <p className="game-eyebrow">LIVE MESSAGES</p>
            <h2>Guesses &amp; Chat</h2>
          </div>
          <span className="game-live-indicator">LIVE</span>
        </div>

        <GuessPanel
          isDrawer={isDrawer}
          timeLeft={timeLeft}
          correctGuess={correctGuess}
          guess={guess}
          setGuess={setGuess}
          submitGuess={submitGuess}
          messages={messages}
          guessLimitReached={guessLimitReached}
          chatMessages={chatMessages}
          onSendChat={onSendChat}
        />
      </section>
    </aside>
  );
}

export default GameSidebar;
