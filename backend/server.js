const express = require("express");
const cors = require("cors");
const { getAnswer } = require("./chatbot");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Akshay chatbot backend is running"
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/chat", (req, res) => {
  const { message } = req.body || {};

  if (typeof message !== "string") {
    return res.status(400).json({
      error: "message (string) is required"
    });
  }

  const reply = getAnswer(message);

  res.json({ reply });
});

module.exports = app;