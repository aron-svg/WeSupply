const express = require("express");

const app = express();
const port = process.env.PORT || 4000;

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "backend" });
});

app.get("/", (_req, res) => {
  res.json({ message: "WeSupply backend is running" });
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
