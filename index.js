
require("dotenv").config();

console.log("Starting Olgafy services...");

process.on("unhandledRejection", (error) => {
  console.error("[ERROR] Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("[ERROR] Uncaught exception:", error);
  process.exitCode = 1;
});

async function start() {
  // Start the website
  try {
    require("./server.js");
  } catch (error) {
    console.error("[WEB] Failed to load server:", error);
  }

  if (!process.env.TOKEN) {
    console.error("[BOT] TOKEN is missing.");
    return;
  }

  try {
    const startBot = require("./bot.js");

    console.log("[BOT] Starting Discord login...");

    await startBot();

    console.log("[BOT] Discord login completed.");
  } catch (error) {
    console.error("[BOT] Startup failed:", error);
  }
}

start();
