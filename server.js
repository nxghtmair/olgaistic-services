const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT; // Render MUST control the port

app.get("/", (req, res) => {
  res.status(200).send("Bot is alive!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Keep-alive ping every 2 minutes
setInterval(() => {
  fetch("https://olgaistic-services.onrender.com/")
    .catch(() => {});
}, 120000);
 