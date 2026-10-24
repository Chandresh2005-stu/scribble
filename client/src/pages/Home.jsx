
import { useState } from "react";
import ConnectionStatus from "../components/ConnectionStatus";
import "./Home.css";

const WORD_CATEGORIES = ["Mixed", "Animals", "Food", "Nature", "Objects"];

function Home({
  status,
  onCreateRoom,
  onJoinRoom,
  error,
  initialRoomCode = "",
}) {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [maxPlayers, setMaxPlayers] = useState("8");
  const [rounds, setRounds] = useState("5");
  const [drawTime, setDrawTime] = useState("60");
  const [category, setCategory] = useState("Mixed");
  const [customWordsInput, setCustomWordsInput] = useState("");

  const handleCreate = () => {
    const name = playerName.trim();
    if (!name) return;

    const customWords = [
      ...new Set(
        customWordsInput
          .split(",")
          .map((word) => word.trim().toLowerCase())
          .filter(
            (word) =>
              word.length >= 2 &&
              word.length <= 30 &&
              /^[a-zA-Z ]+$/.test(word)
          )
      ),
    ].slice(0, 100);

    onCreateRoom(name, {
      maxPlayers: Number(maxPlayers),
      rounds: Number(rounds),
      drawTime: Number(drawTime),
      category,
      customWords,
    });
  };

  const handleJoin = (event) => {
    event.preventDefault();

    const name = playerName.trim();
    const code = roomCode.trim().toUpperCase();

    if (!name || !code) return;

    onJoinRoom(code, name);
  };

  return (
    <main className="home-page">
      <header className="home-header">
        <a className="home-brand" href="/" aria-label="Skribbl home">
          <span className="home-brand-icon">✎</span>
          <span>
            scribble<span className="home-brand-dot">.</span>
          </span>
        </a>
        <div className="home-header-label">Draw. Guess. Have fun.</div>
      </header>

      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-eyebrow">✨ YOUR NEXT GAME NIGHT</span>
          <h1>
            A little drawing.
            <br />
            <span>A lot of fun.</span>
          </h1>
          <p>
            Draw secret words, guess what your friends are sketching,
            and see who tops the leaderboard.
          </p>
          <div className="home-feature-list">
            <span>🎨 Draw together</span>
            <span>⚡ Guess quickly</span>
            <span>🏆 Compete for points</span>
          </div>
        </div>

        <div className="home-game-art" aria-hidden="true">
          <div className="home-art-spark home-art-spark-one">✦</div>
          <div className="home-art-spark home-art-spark-two">✧</div>
          <div className="home-art-card">
            <div className="home-art-toolbar">
              <span />
              <span />
              <span />
              <span className="home-art-word">DRAW!</span>
            </div>
            <div className="home-art-canvas">
              <svg
                viewBox="0 0 280 190"
                role="presentation"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M66 127 L87 68 L109 127 Z"
                  fill="#FFD166"
                  stroke="#292D47"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path
                  d="M87 68 L87 127"
                  stroke="#292D47"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M67 108 L107 108"
                  stroke="#292D47"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M132 126 C132 95 149 79 172 79 C195 79 211 96 211 126"
                  fill="#FF8A75"
                  stroke="#292D47"
                  strokeWidth="4"
                />
                <path
                  d="M143 91 L136 69 M158 81 L158 58 M177 80 L185 59 M195 91 L211 75"
                  stroke="#292D47"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="158" cy="105" r="3.5" fill="#292D47" />
                <circle cx="184" cy="105" r="3.5" fill="#292D47" />
                <path
                  d="M162 117 Q171 126 181 117"
                  fill="none"
                  stroke="#292D47"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M111 145 Q139 158 167 145"
                  fill="none"
                  stroke="#6258E8"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="5 7"
                />
              </svg>
            </div>
            <div className="home-art-footer">
              <span>✏️ Your turn to draw</span>
              <span>⏱ {drawTime}s</span>
            </div>
          </div>
          <div className="home-art-bubble home-art-bubble-left">🎨</div>
          <div className="home-art-bubble home-art-bubble-right">💡</div>
        </div>
      </section>

      <section className="home-play-card">
        <div className="home-play-heading">
          <span className="home-play-icon">🎮</span>
          <div>
            <h2>Ready to play?</h2>
            <p>Choose a name, then create a room or join your friends.</p>
          </div>
        </div>

        <div className="home-connection">
          <ConnectionStatus status={status} />
        </div>

        <div className="home-form-field">
          <label htmlFor="playerName">Your player name</label>
          <input
            id="playerName"
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(event) => setPlayerName(event.target.value)}
            maxLength={20}
            autoComplete="nickname"
          />
          <span className="home-input-hint">Up to 20 characters</span>
        </div>

        <h3>Room settings</h3>

        <div className="home-form-field">
          <label htmlFor="maxPlayers">Player limit</label>
          <select
            id="maxPlayers"
            value={maxPlayers}
            onChange={(event) => setMaxPlayers(event.target.value)}
          >
            {Array.from({ length: 19 }, (_, i) => i + 2).map((value) => (
              <option key={value} value={value}>
                {value} players
              </option>
            ))}
          </select>
        </div>

        <div className="home-form-field">
          <label htmlFor="rounds">Number of rounds</label>
          <select
            id="rounds"
            value={rounds}
            onChange={(event) => setRounds(event.target.value)}
          >
            {Array.from({ length: 9 }, (_, i) => i + 2).map((value) => (
              <option key={value} value={value}>
                {value} rounds
              </option>
            ))}
          </select>
        </div>

        <div className="home-form-field">
          <label htmlFor="drawTime">Drawing time</label>
          <select
            id="drawTime"
            value={drawTime}
            onChange={(event) => setDrawTime(event.target.value)}
          >
            {Array.from({ length: 46 }, (_, i) => (i + 3) * 5)
              .filter((value) => value >= 15 && value <= 240)
              .map((value) => (
                <option key={value} value={value}>
                  {value} seconds
                </option>
              ))}
          </select>
        </div>

        <div className="home-form-field">
          <label htmlFor="category">Word category</label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {WORD_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <span className="home-input-hint">
            Choose the type of words used in your game.
          </span>
        </div>

        <div className="home-form-field">
          <label htmlFor="customWords">Custom words (optional)</label>
          <textarea
            id="customWords"
            placeholder="e.g. cricket, coding, chai, laptop"
            value={customWordsInput}
            onChange={(event) => setCustomWordsInput(event.target.value)}
            rows={3}
            maxLength={3000}
          />
          <span className="home-input-hint">
            Separate words with commas. Use 2–30 letters per word, up to 100
            unique words. Custom words are added to the selected category.
          </span>
        </div>

        <button
          className="home-button home-button-primary"
          type="button"
          onClick={handleCreate}
          disabled={!playerName.trim()}
        >
          Create a new room <span aria-hidden="true">→</span>
        </button>

        <div className="home-divider">
          <span />
          <span>OR JOIN YOUR FRIENDS</span>
          <span />
        </div>

        <form className="home-join-form" onSubmit={handleJoin}>
          <div className="home-form-field">
            <label htmlFor="roomCode">Room code</label>
            <input
              id="roomCode"
              type="text"
              placeholder="e.g. A1B2C3"
              value={roomCode}
              onChange={(event) =>
                setRoomCode(
                  event.target.value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, "")
                    .slice(0, 6)
                )
              }
              maxLength={6}
              autoComplete="off"
            />
          </div>
          <button
            className="home-button home-button-secondary"
            type="submit"
            disabled={!playerName.trim() || !roomCode.trim()}
          >
            Join room
          </button>
        </form>

        {error && (
          <p className="home-error" role="alert">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
      </section>

      <footer className="home-footer">
        Made for friends, doodles, and terrible guesses.
      </footer>
    </main>
  );
}

export default Home;
