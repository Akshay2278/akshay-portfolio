const fs = require("fs");
const path = require("path");

const knowledge = JSON.parse(
  fs.readFileSync(path.join(__dirname, "data", "knowledge.json"), "utf-8")
);

function normalize(text) {
  return " " + text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim() + " ";
}

function scoreTopic(normalizedMessage, topic) {
  let score = 0;
  for (const kw of topic.keywords) {
    const needle = " " + kw.toLowerCase() + " ";
    if (normalizedMessage.includes(needle)) {
      // Longer / more specific keywords (named entities, multi-word phrases)
      // are much less likely to be generic filler, so weight by length.
      score += kw.trim().length;
    }
  }
  return score;
}

function getAnswer(message) {
  if (!message || !message.trim()) {
    return knowledge.fallback;
  }
  const normalizedMessage = normalize(message);
  let best = null;
  let bestScore = 0;

  for (const topic of knowledge.topics) {
    const score = scoreTopic(normalizedMessage, topic);
    if (score > bestScore) {
      bestScore = score;
      best = topic;
    }
  }

  if (best && bestScore > 0) {
    return best.answer;
  }
  return knowledge.fallback;
}

module.exports = { getAnswer, knowledge };
