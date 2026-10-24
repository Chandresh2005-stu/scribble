
import "./ConnectionStatus.css";

function ConnectionStatus({ status }) {
  const normalizedStatus = String(status || "").toLowerCase();

  const isConnected = normalizedStatus.includes("connected to backend");
  const isConnecting = normalizedStatus.includes("connecting");

  const label = isConnected
    ? "Connected to backend"
    : isConnecting
      ? "Connecting to backend..."
      : "Disconnected from backend";

  const statusClass = isConnected
    ? "connection-connected"
    : isConnecting
      ? "connection-connecting"
      : "connection-disconnected";

  return (
    <div
      className={`connection-status ${statusClass}`}
      role="status"
      aria-live="polite"
    >
      <span className="connection-status-dot" />
      <span>{label}</span>
    </div>
  );
}

export default ConnectionStatus;
