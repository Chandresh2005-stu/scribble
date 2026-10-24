import { useState } from "react";

function GuessPanel({
  isDrawer,
  timeLeft,
  correctGuess,
  guess,
  setGuess,
  submitGuess,
  messages,
  guessLimitReached,
  chatMessages = [],
  onSendChat,
}) {
  const [chatText, setChatText] = useState("");

  const isGuessDisabled =
    isDrawer || correctGuess || guessLimitReached || timeLeft <= 0;

  const submitChat = (event) => {
    event.preventDefault();

    const text = chatText.trim();

    if (!text || text.length > 200) return;

    onSendChat(text);
    setChatText("");
  };

  return (
    <div className="guess-panel">
      {!isGuessDisabled && (
        <form onSubmit={submitGuess}>
          <input
            type="text"
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            placeholder="Enter your guess"
            maxLength={100}
            disabled={isGuessDisabled}
          />

          <button type="submit" disabled={isGuessDisabled}>
            Guess
          </button>
        </form>
      )}

      {correctGuess && <h3>Correct guess! 🎉</h3>}

      {guessLimitReached && !correctGuess && (
        <h3>You have used all 3 wrong guesses for this round.</h3>
      )}

      <div className="guess-game-messages">
        <h3>Game Messages</h3>

        {messages.map((message, index) => (
          <p key={`game-${index}`}>{message}</p>
        ))}
      </div>

      <div className="general-chat">
        <h3>General Chat</h3>

        <div
          className="general-chat-messages"
          aria-live="polite"
          aria-label="General chat messages"
        >
          {chatMessages.length === 0 ? (
            <p>No chat messages yet.</p>
          ) : (
            chatMessages.map((message) => (
              <p key={message.id}>
                <strong>{message.playerName}: </strong>
                {message.text}
              </p>
            ))
          )}
        </div>

        <form onSubmit={submitChat}>
          <input
            type="text"
            value={chatText}
            onChange={(event) => setChatText(event.target.value)}
            placeholder="Send a message..."
            maxLength={200}
            aria-label="General chat message"
          />

          <button type="submit" disabled={!chatText.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default GuessPanel;