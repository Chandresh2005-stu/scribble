
import { useState } from "react";
import ConnectionStatus from "../components/ConnectionStatus";
import PlayerList from "../components/PlayerList";
import RoomCode from "../components/RoomCode";
import "./Lobby.css";

function Lobby({
  status,
  room,
  onLeaveRoom,
  onStartGame,
  currentPlayerId,
  gameStarted,
}) {
  const [copied, setCopied] = useState(false);

  const isHost = room.host === currentPlayerId;
  const hostName = room.playerNames?.[room.host] || room.host;
  const playerCount = room.players?.length || 0;
  const maxPlayers = room.maxPlayers || 8;
  const rounds = room.rounds || 5;
  const drawTime = room.drawTime || 60;
  const category = room.category || "Mixed";
  const customWordCount = Array.isArray(room.customWords)
    ? room.customWords.length
    : 0;

  const inviteLink = `${window.location.origin}/?room=${encodeURIComponent(
    room.roomCode
  )}`;

  const handleCopyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Unable to copy invite link:", error);
      window.prompt("Copy this invite link:", inviteLink);
    }
  };

  return (
    <main className="lobby-page">
      <header className="lobby-header">
        <a className="lobby-brand" href="/" aria-label="Skribbl home">
          <span className="lobby-brand-icon">✎</span>
          <span>
            scribble<span className="lobby-brand-dot">.</span>
          </span>
        </a>

        <button
          type="button"
          className="lobby-button lobby-button-leave"
          onClick={onLeaveRoom}
        >
          <span aria-hidden="true">←</span> Leave Room
        </button>
      </header>

      <section className="lobby-hero">
        <span className="lobby-eyebrow">YOUR GAME SPACE</span>
        <h1>
          The lobby<span className="lobby-title-dot">.</span>
        </h1>
        <p>Gather your friends. Get ready to draw, guess, and compete.</p>
      </section>

      <div className="lobby-connection">
        <ConnectionStatus status={status} />
      </div>

      <section className="lobby-layout">
        <div className="lobby-main-card">
          <div className="lobby-card-heading">
            <div>
              <span className="lobby-section-label">ROOM DETAILS</span>
              <h2>Invite your friends</h2>
            </div>
            <span className="lobby-room-icon" aria-hidden="true">
              🎮
            </span>
          </div>

          <div className="lobby-room-code">
            <RoomCode roomCode={room.roomCode} />
          </div>

          <button
            type="button"
            className="lobby-button lobby-button-start"
            onClick={handleCopyInvite}
          >
            {copied ? "Invite link copied!" : "Copy invite link"}
          </button>

          <div className="lobby-host">
            <span className="lobby-host-avatar" aria-hidden="true">
              {String(hostName).charAt(0).toUpperCase()}
            </span>
            <div className="lobby-host-info">
              <span className="lobby-host-caption">ROOM HOST</span>
              <strong>{hostName}</strong>
            </div>
            <span className="lobby-host-badge">👑 HOST</span>
          </div>

          <div className="lobby-invite-note">
            <span aria-hidden="true">💡</span>
            Share the invite link or room code with your friends so they can
            join.
          </div>

          <div className="lobby-settings">
            <span className="lobby-section-label">GAME SETTINGS</span>

            <div className="lobby-settings-grid">
              <div className="lobby-setting">
                <span aria-hidden="true">👥</span>
                <div>
                  <strong>
                    {playerCount}/{maxPlayers}
                  </strong>
                  <span>Players</span>
                </div>
              </div>

              <div className="lobby-setting">
                <span aria-hidden="true">🔄</span>
                <div>
                  <strong>{rounds}</strong>
                  <span>Rounds</span>
                </div>
              </div>

              <div className="lobby-setting">
                <span aria-hidden="true">⏱️</span>
                <div>
                  <strong>{drawTime}s</strong>
                  <span>Drawing time</span>
                </div>
              </div>

              <div className="lobby-setting">
                <span aria-hidden="true">🗂️</span>
                <div>
                  <strong>{category}</strong>
                  <span>Word category</span>
                </div>
              </div>

              <div className="lobby-setting">
                <span aria-hidden="true">✏️</span>
                <div>
                  <strong>{customWordCount}</strong>
                  <span>Custom words</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="lobby-side-card">
          <div className="lobby-card-heading">
            <div>
              <span className="lobby-section-label">THE PLAYERS</span>
              <h2>Who's here?</h2>
            </div>
            <span className="lobby-player-count">
              {playerCount}/{maxPlayers}
            </span>
          </div>

          <div className="lobby-player-list">
            <PlayerList
              players={room.players}
              playerNames={room.playerNames}
            />
          </div>

          <div className="lobby-player-footer">
            <span className="lobby-live-dot" />
            {playerCount < 2
              ? "Waiting for another player to join"
              : playerCount >= maxPlayers
                ? "Room is full"
                : "Your party is getting ready"}
          </div>
        </aside>
      </section>

      <section className="lobby-bottom-card">
        <div className="lobby-bottom-copy">
          <span className="lobby-bottom-icon" aria-hidden="true">
            {gameStarted ? "🎨" : "✨"}
          </span>
          <div>
            <h2>
              {gameStarted
                ? "The game is underway!"
                : isHost
                  ? "Everyone ready?"
                  : "You're in the right place!"}
            </h2>
            <p>
              {gameStarted
                ? "Get ready to draw and guess."
                : isHost
                  ? "Start the game when your friends have joined."
                  : "Hang tight. The host will start the game soon."}
            </p>
          </div>
        </div>

        <div className="lobby-actions">
          {gameStarted ? (
            <span className="lobby-started-badge">
              <span className="lobby-live-dot" />
              Game started
            </span>
          ) : isHost ? (
            <button
              type="button"
              className="lobby-button lobby-button-start"
              onClick={onStartGame}
              disabled={playerCount < 2}
            >
              Start Game <span aria-hidden="true">→</span>
            </button>
          ) : (
            <span className="lobby-waiting-badge">
              <span className="lobby-live-dot" />
              Waiting for host
            </span>
          )}
        </div>
      </section>

      <footer className="lobby-footer">
        Good drawings are optional. Good guesses are encouraged.
      </footer>
    </main>
  );
}

export default Lobby;
