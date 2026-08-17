const express = require("express");
const cors = require("cors");
const path = require("path");
const { getAnswer } = require("./chatbot");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve the frontend as static files too, so the whole site can run from one server.
app.use(express.static(path.join(__dirname, "..", "frontend")));

app.post("/api/chat", (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== "string") {
    return res.status(400).json({ error: "message (string) is required" });
  }
  const reply = getAnswer(message);
  res.json({ reply });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
