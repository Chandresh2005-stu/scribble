
function WordChoices({
  isDrawer,
  selectedWord,
  wordChoices,
  onSelectWord,
}) {
  if (!isDrawer || selectedWord || wordChoices.length === 0) {
    return null;
  }

  return (
    <div className="word-choices">
      <h3 className="word-choices-title">
        Choose a word to draw
      </h3>

      <p className="word-choices-subtitle">
        Select one option to start your turn
      </p>

      <div className="word-choices-list">
        {wordChoices.map((word, index) => (
          <button
            className="word-choice-button"
            key={word}
            onClick={() => onSelectWord(word)}
            type="button"
          >
            <span className="word-choice-number">
              {index + 1}
            </span>
            <span>{word}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default WordChoices;
