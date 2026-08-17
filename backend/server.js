const express = require("express");
const cors = require("cors");
const { getAnswer } = require("./chatbot");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/chat", (req, res) => {
  const { message } = req.body || {};

  if (typeof message !== "string") {
    return res.status(400).json({
      error: "message (string) is required",
    });
  }

  const reply = getAnswer(message);

  res.json({ reply });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

module.exports = app;