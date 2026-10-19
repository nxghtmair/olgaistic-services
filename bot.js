
const {
  Client,
  GatewayIntentBits,
  Collection
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const statusConfig = require("./status.js");

// Commands
const stickyRR = require("./commands/stickyrr.js");

// Events
const readyEvent = require("./events/ready.js");
const messageEvent = require("./events/messageCreate.js");
const interactionEvent = require("./events/interactionCreate.js");

async function startBot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  client.commands = new Collection();

  // Load commands
  const commandsPath = path.join(__dirname, "commands");

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter(file => file.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    if (!command.data || !command.execute) {
      console.log(`[BOT] Invalid command file: ${file}`);
      continue;
    }

    client.commands.set(command.data.name, command);
  }

  // Events
  client.once("ready", () => {
    Promise.resolve(
      readyEvent.execute(client, statusConfig)
    ).catch(error => {
      console.error("[BOT] Ready handler failed:", error);
    });
  });

  client.on("messageCreate", msg => {
    Promise.resolve(
      messageEvent.execute(msg, stickyRR, client)
    ).catch(error => {
      console.error("[BOT] Message handler failed:", error);
    });
  });

  client.on("interactionCreate", interaction => {
    Promise.resolve(
      interactionEvent.execute(interaction, client, stickyRR)
    ).catch(error => {
      console.error("[BOT] Interaction handler failed:", error);
    });
  });

  client.on("error", error => {
    console.error("[BOT] Discord client error:", error);
  });

  // Login
  try {
    await client.login(process.env.TOKEN);
    return client;
  } catch (error) {
    console.error("[BOT] Login failed:", error);
    client.destroy();
    throw error;
  }
}

module.exports = startBot;
