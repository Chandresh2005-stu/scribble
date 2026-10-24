
import "./PlayerList.css";

function PlayerList({ players = [], playerNames = {} }) {
  if (players.length === 0) {
    return (
      <p className="player-list-empty">
        No players yet. Invite your friends!
      </p>
    );
  }

  return (
    <section className="player-list" aria-label="Players in the room">
      <ul className="player-list-items">
        {players.map((playerId, index) => {
          const name = playerNames[playerId] || playerId;

          return (
            <li className="player-list-item" key={playerId}>
              <span className={`player-list-avatar player-avatar-${index % 6}`}>
                {String(name).charAt(0).toUpperCase()}
              </span>

              <span className="player-list-name">{name}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default PlayerList;
