const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Ping Render every 2 minutes
setInterval(() => {
  fetch("https://olgaistic-services.onrender.com")
    .then(() => console.log("Keep-alive ping sent"))
    .catch(err => console.error("Ping failed:", err));
}, 2 * 60 * 1000);
