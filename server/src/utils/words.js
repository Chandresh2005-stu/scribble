
const categories = {
  Mixed: [
    "apple",
    "banana",
    "guitar",
    "elephant",
    "airplane",
    "pizza",
    "rainbow",
    "football",
    "mountain",
    "butterfly",
    "computer",
    "telescope",
    "watermelon",
    "dinosaur",
    "umbrella",
  ],

  Animals: [
    "elephant",
    "butterfly",
    "dinosaur",
    "giraffe",
    "penguin",
    "kangaroo",
    "dolphin",
    "turtle",
    "rabbit",
    "octopus",
  ],

  Food: [
    "apple",
    "banana",
    "pizza",
    "watermelon",
    "sandwich",
    "pancake",
    "hamburger",
    "popcorn",
    "pineapple",
    "ice cream",
  ],

  Nature: [
    "rainbow",
    "mountain",
    "waterfall",
    "volcano",
    "sunflower",
    "lightning",
    "forest",
    "ocean",
    "desert",
    "snowflake",
  ],

  Objects: [
    "guitar",
    "airplane",
    "computer",
    "telescope",
    "umbrella",
    "bicycle",
    "backpack",
    "camera",
    "clock",
    "toothbrush",
  ],
};

function getWords(category = "Mixed", customWords = []) {
  const selectedWords = categories[category] || categories.Mixed;

  const normalizedCustomWords = Array.isArray(customWords)
    ? customWords
        .filter((word) => typeof word === "string")
        .map((word) => word.trim().toLowerCase())
        .filter((word) => word.length > 0 && word.length <= 30)
    : [];

  return [...new Set([...selectedWords, ...normalizedCustomWords])];
}

module.exports = {
  categories,
  getWords,
};
