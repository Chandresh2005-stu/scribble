
import { useEffect, useRef, useState } from "react";
import GameResults from "../components/game/GameResults";
import GameHeader from "../components/game/GameHeader";
import GameStatusBar from "../components/game/GameStatusBar";
import GameFeedback from "../components/game/GameFeedback";
import GameDrawingPanel from "../components/game/GameDrawingPanel";
import GameSidebar from "../components/game/GameSidebar";
import "./Game.css";

function Game({ socket, roomCode, onLeaveRoom }) {
  const [selectedWord, setSelectedWord] = useState("");
  const [drawerId, setDrawerId] = useState("");
  const [wordChoices, setWordChoices] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [roundEndedWord, setRoundEndedWord] = useState("");
  const [guess, setGuess] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [correctGuess, setCorrectGuess] = useState(false);
  const [correctGuessMessage, setCorrectGuessMessage] = useState("");
  const [guessLimitReached, setGuessLimitReached] = useState(false);
  const [scores, setScores] = useState({});
  const [playerNames, setPlayerNames] = useState({});
  const [gameResults, setGameResults] = useState(null);
  const [restartError, setRestartError] = useState(null);
  const [hint, setHint] = useState("");

  const canvasRef = useRef(null);

  const isDrawer = Boolean(
    socket.id && drawerId && socket.id === drawerId
  );

  useEffect(() => {
    let countdownInterval = null;

    const drawSegment = (context, segment) => {
      if (!segment?.from || !segment?.to) return;

      context.beginPath();
      context.moveTo(segment.from.x, segment.from.y);
      context.lineTo(segment.to.x, segment.to.y);
      context.strokeStyle = segment.color || "#000000";
      context.lineWidth = segment.lineWidth || 3;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.stroke();
    };

    const clearLocalCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleDrawLine = (segment) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      drawSegment(context, segment);
    };

    const handleCanvasUpdated = ({ strokes } = {}) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      if (!Array.isArray(strokes)) return;

      strokes.forEach((segment) => {
        drawSegment(context, segment);
      });
    };

    const handleClearCanvas = () => {
      clearLocalCanvas();
    };

    const handleWordSelected = (word) => {
      setSelectedWord(word || "");
      setWordChoices([]);
    };

    const handleWordChoices = (choices) => {
      setWordChoices(choices);
    };

    const handleHintUpdated = ({ hint: updatedHint } = {}) => {
      setHint(typeof updatedHint === "string" ? updatedHint : "");
    };

    const handleRoundStarted = (data = {}) => {
      const endTime = data.roundEndTime || data.endsAt;

      setRoundEndedWord("");
      setCorrectGuess(false);
      setCorrectGuessMessage("");
      setGuessLimitReached(false);
      setGuess("");
      setHint("");

      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }

      if (!endTime) {
        console.warn("Round started without an end time:", data);
        return;
      }

      const updateCountdown = () => {
        const remaining = Math.max(
          0,
          Math.ceil((endTime - Date.now()) / 1000)
        );

        setTimeLeft(remaining);

        if (remaining === 0 && countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
      };

      updateCountdown();
      countdownInterval = setInterval(updateCountdown, 250);
    };

    const handlePlayerGuessed = ({
      playerName,
      playerId,
      guess: submittedGuess,
    }) => {
      const name = playerName || `Player ${playerId}`;

      setMessages((previous) => [
        ...previous,
        `${name}: ${submittedGuess}`,
      ]);
    };

    const handleChatMessage = ({ playerId, playerName, text, timestamp }) => {
      if (typeof text !== "string") return;

      setChatMessages((previous) => [
        ...previous,
        {
          id: `${playerId}-${timestamp || Date.now()}-${previous.length}`,
          playerId,
          playerName: playerName || "Player",
          text,
        },
      ]);
    };

    const handleCorrectGuess = ({
      playerId,
      playerName,
      scores: updatedScores,
    }) => {
      const isSelf = playerId === socket.id;
      const name = playerName || `Player ${playerId}`;

      const message = isSelf
        ? "🎉 You guessed it right!"
        : `🎉 ${name} guessed the word correctly!`;

      if (updatedScores) {
        setScores(updatedScores);
      }

      if (isSelf) {
        setCorrectGuess(true);
        setGuess("");
      }

      setCorrectGuessMessage(message);

      setMessages((previous) => [
        ...previous,
        message,
      ]);
    };

    const handleRoomUpdated = (data = {}) => {
      if (data.scores) setScores(data.scores);
      if (data.playerNames) setPlayerNames(data.playerNames);
    };

    const handleGameEnded = (results = {}) => {
      setGameResults(results);

      if (results.scores) setScores(results.scores);

      if (results.playerNames) {
        setPlayerNames(results.playerNames);
      }

      setDrawerId("");
      setSelectedWord("");
      setWordChoices([]);
      setTimeLeft(0);
      setCorrectGuess(false);
      setCorrectGuessMessage("");
      setGuessLimitReached(false);
      setGuess("");
      setHint("");

      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
    };

    const handleGameState = (data = {}) => {
      const {
        gameStarted,
        drawerId: currentDrawerId,
        roundEndTime,
        roundEndsAt,
        currentWord,
        wordChoices: currentChoices,
        wordSelected,
        scores: currentScores,
        playerNames: currentPlayerNames,
        hint: currentHint,
      } = data;

      if (currentScores) setScores(currentScores);
      if (currentPlayerNames) setPlayerNames(currentPlayerNames);

      if (gameStarted) {
        setDrawerId(currentDrawerId || "");

        if (socket.id === currentDrawerId) {
          if (wordSelected || currentWord) {
            setWordChoices([]);
          } else {
            socket.emit("get-word-choices", roomCode);
          }

          if (currentChoices?.length && !wordSelected) {
            setWordChoices(currentChoices);
          }

          if (currentWord) {
            setSelectedWord(currentWord);
          }

          setHint("");
        } else {
          setSelectedWord("");
          setWordChoices([]);
          setHint(currentHint || "");
        }

        const endTime = roundEndTime || roundEndsAt;

        if (endTime) {
          handleRoundStarted({ roundEndTime: endTime });
        }
      } else {
        setDrawerId("");
        setSelectedWord("");
        setWordChoices([]);
        setTimeLeft(0);
        setCorrectGuess(false);
        setCorrectGuessMessage("");
        setGuessLimitReached(false);
        setGuess("");
        setRoundEndedWord("");
        setHint("");

        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
      }
    };

    const handleGameStarted = (data = {}) => {
      const newDrawerId = data.drawerId;

      setGameResults(null);
      setRestartError("");

      setDrawerId(newDrawerId || "");
      setSelectedWord("");
      setWordChoices([]);
      setRoundEndedWord("");
      setTimeLeft(0);
      setCorrectGuess(false);
      setCorrectGuessMessage("");
      setGuessLimitReached(false);
      setGuess("");
      setMessages([]);
      setHint("");

      clearLocalCanvas();

      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }

      if (newDrawerId && socket.id === newDrawerId) {
        socket.emit("get-word-choices", roomCode);
      }
    };

    const handleGuessLimitReached = ({ limit } = {}) => {
      setGuessLimitReached(true);
      setGuess("");

      setMessages((previous) => [
        ...previous,
        `You have used all ${limit || 3} wrong guesses for this round.`,
      ]);
    };

    const handleRoundEnded = ({ word } = {}) => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }

      setTimeLeft(0);
      setRoundEndedWord(word || "");
      setSelectedWord("");
      setWordChoices([]);
      setHint("");

      clearLocalCanvas();
    };

    const handleStartGameError = (message) => {
      setRestartError(
        typeof message === "string"
          ? message
          : "Unable to start the game."
      );
    };

    socket.on("draw-line", handleDrawLine);
    socket.on("canvas-updated", handleCanvasUpdated);
    socket.on("clear-canvas", handleClearCanvas);
    socket.on("word-selected", handleWordSelected);
    socket.on("word-choices", handleWordChoices);
    socket.on("hint-updated", handleHintUpdated);
    socket.on("game-started", handleGameStarted);
    socket.on("game-state", handleGameState);
    socket.on("round-started", handleRoundStarted);
    socket.on("round-ended", handleRoundEnded);
    socket.on("player-guessed", handlePlayerGuessed);
    socket.on("chat-message", handleChatMessage);
    socket.on("correct-guess", handleCorrectGuess);
    socket.on("guess-limit-reached", handleGuessLimitReached);
    socket.on("room-updated", handleRoomUpdated);
    socket.on("game-ended", handleGameEnded);
    socket.on("start-game-error", handleStartGameError);

    socket.emit("get-game-state", roomCode);

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }

      socket.off("draw-line", handleDrawLine);
      socket.off("canvas-updated", handleCanvasUpdated);
      socket.off("clear-canvas", handleClearCanvas);
      socket.off("word-selected", handleWordSelected);
      socket.off("word-choices", handleWordChoices);
      socket.off("hint-updated", handleHintUpdated);
      socket.off("game-started", handleGameStarted);
      socket.off("game-state", handleGameState);
      socket.off("round-started", handleRoundStarted);
      socket.off("round-ended", handleRoundEnded);
      socket.off("player-guessed", handlePlayerGuessed);
      socket.off("chat-message", handleChatMessage);
      socket.off("correct-guess", handleCorrectGuess);
      socket.off("guess-limit-reached", handleGuessLimitReached);
      socket.off("room-updated", handleRoomUpdated);
      socket.off("game-ended", handleGameEnded);
      socket.off("start-game-error", handleStartGameError);
    };
  }, [socket, roomCode]);

  const selectWord = (word) => {
    if (!isDrawer || selectedWord || gameResults) return;

    socket.emit("select-word", {
      roomCode,
      word,
    });
  };

  const submitGuess = (event) => {
    event.preventDefault();

    const trimmedGuess = guess.trim();

    if (
      !trimmedGuess ||
      isDrawer ||
      correctGuess ||
      guessLimitReached ||
      timeLeft <= 0 ||
      gameResults
    ) {
      return;
    }

    socket.emit("submit-guess", {
      roomCode,
      guess: trimmedGuess,
    });

    setGuess("");
  };

  const sendChatMessage = (text) => {
    const trimmedText = text.trim();

    if (!trimmedText || trimmedText.length > 200 || gameResults) {
      return;
    }

    socket.emit("send-chat-message", {
      roomCode,
      text: trimmedText,
    });
  };

  const handlePlayAgain = () => {
    setRestartError("");
    socket.emit("start-game", roomCode);
  };

 

  if (gameResults) {
  return (
    <GameResults
      gameResults={gameResults}
      restartError={restartError}
      onPlayAgain={handlePlayAgain}
      onLeaveRoom={onLeaveRoom}
    />
  );
}

    

  const sortedScores = Object.entries(scores).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <main className="game-page">
      <GameHeader
  roomCode={roomCode}
  onLeaveRoom={onLeaveRoom}
/>

      <GameStatusBar
  isDrawer={isDrawer}
  selectedWord={selectedWord}
  timeLeft={timeLeft}
/>

     <GameFeedback
  correctGuessMessage={correctGuessMessage}
  restartError={restartError}
  roundEndedWord={roundEndedWord}
/>
      <div className="game-layout">
   
<GameDrawingPanel
  isDrawer={isDrawer}
  selectedWord={selectedWord}
  hint={hint}
  wordChoices={wordChoices}
  onSelectWord={selectWord}
  canvasRef={canvasRef}
  socket={socket}
  roomCode={roomCode}
  timeLeft={timeLeft}
/>


        
<GameSidebar
  sortedScores={sortedScores}
  playerNames={playerNames}
  socket={socket}
  drawerId={drawerId}
  isDrawer={isDrawer}
  timeLeft={timeLeft}
  correctGuess={correctGuess}
  guess={guess}
  setGuess={setGuess}
  submitGuess={submitGuess}
  messages={messages}
  guessLimitReached={guessLimitReached}
  chatMessages={chatMessages}
  onSendChat={sendChatMessage}
/>

      </div>
    </main>
  );

}
export default Game;
