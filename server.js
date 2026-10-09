const express = require("express");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3000;

// URL that will be pinged every 2 minutes
const KEEPALIVE_URL = "https://olgaistic-services.onrender.com/"; 
// ↑ sem dej přesně URL tvé služby na Renderu

app.get("/", (req, res) => {
  res.send("Bot is alive!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Keep-alive ping every 2 minutes
setInterval(() => {
  fetch(KEEPALIVE_URL)
    .then(() => console.log("Keep-alive ping sent"))
    .catch(err => console.error("Ping failed:", err));
}, 2 * 60 * 1000); // 2 minutes
