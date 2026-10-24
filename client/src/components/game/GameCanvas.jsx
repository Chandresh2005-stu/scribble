
import { useRef, useState } from "react";

const COLORS = [
  "#000000",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ffffff",
];

const BRUSH_SIZES = [3, 6, 10, 16];

function GameCanvas({
  canvasRef,
  socket,
  roomCode,
  isDrawer,
  selectedWord,
  timeLeft,
}) {
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);

  const canDraw = isDrawer && Boolean(selectedWord) && timeLeft > 0;

  const getCanvasPoint = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPoint.current = null;
  };

  const startDrawing = (event) => {
    if (!canDraw) return;

    const point = getCanvasPoint(event);
    if (!point) return;

    event.preventDefault();

    isDrawing.current = true;
    lastPoint.current = point;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const draw = (event) => {
    if (!canDraw || !isDrawing.current) return;

    const canvas = canvasRef.current;
    const to = getCanvasPoint(event);
    const from = lastPoint.current;

    if (!canvas || !from || !to) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const stroke = {
      roomCode,
      from,
      to,
      color,
      lineWidth: brushSize,
    };

    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.strokeStyle = color;
    context.lineWidth = brushSize;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.stroke();

    socket.emit("draw-line", stroke);
    lastPoint.current = to;
  };

  const clearCanvas = () => {
    if (!canDraw) return;

    socket.emit("clear-canvas", roomCode);
    stopDrawing();
  };

  const undoLastStroke = () => {
    if (!canDraw) return;

    socket.emit("undo-canvas", roomCode);
    stopDrawing();
  };

  return (
    <div className="drawing-area">
      {isDrawer && (
        <div className="drawing-controls">
          <div className="drawing-tool-group">
            <span>Color</span>
            <div className="drawing-colors">
              {COLORS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-label={`Choose ${item} brush color`}
                  aria-pressed={color === item}
                  disabled={!canDraw}
                  onClick={() => setColor(item)}
                  className={`drawing-color ${
                    color === item ? "active" : ""
                  }`}
                  style={{ backgroundColor: item }}
                />
              ))}
            </div>
          </div>

          <label className="drawing-tool-group">
            Brush size
            <select
              value={brushSize}
              disabled={!canDraw}
              onChange={(event) =>
                setBrushSize(Number(event.target.value))
              }
            >
              {BRUSH_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </label>

          <div className="drawing-actions">
            <button
              type="button"
              className="game-button game-button-secondary"
              disabled={!canDraw}
              onClick={undoLastStroke}
            >
              Undo
            </button>

            <button
              type="button"
              className="game-button game-button-secondary"
              disabled={!canDraw}
              onClick={clearCanvas}
            >
              Clear Canvas
            </button>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="drawing-canvas"
        style={{
          cursor: canDraw ? "crosshair" : "default",
          touchAction: "none",
        }}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        onLostPointerCapture={stopDrawing}
      />
    </div>
  );
}

export default GameCanvas;
