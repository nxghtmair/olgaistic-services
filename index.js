
require("dotenv").config();

console.log("Starting Olgafy services...");

process.on("unhandledRejection", (error) => {
  console.error("[ERROR] Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
  console.error("[ERROR] Uncaught exception:", error);
  process.exitCode = 1;
});

// Start the web server
try {
  require("./server.js");
} catch (error) {
  console.error("[WEB] Failed to load server:", error);
}

// Start the Discord bot only when configured
if (!process.env.TOKEN) {
  console.error(
    "[BOT] TOKEN is missing. Configure it in your .env file."
  );
  console.log("[WEB] The web server can still run.");
} else {
  try {
    require("./bot.js");
    console.log("[BOT] Startup requested.");
  } catch (error) {
    console.error("[BOT] Failed to load bot:", error);
  }
}
