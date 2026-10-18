console.log("A");
const {
  Client,
  GatewayIntentBits,
  ActivityType,
  Collection
} = require("discord.js");

console.log("B");
require("dotenv").config();

console.log("C");
const fs = require("fs");

console.log("D");
const path = require("path");

console.log("E");
const statusConfig = require("./status.js");

console.log("F");
const stickyRR = require("./commands/stickyrr.js");

console.log("G");
const readyEvent = require("./events/ready.js");

console.log("H");
const messageEvent = require("./events/messageCreate.js");

console.log("I");
const interactionEvent = require("./events/interactionCreate.js");

console.log("J");

const statusConfig = require("./status.js");

// Commands
const stickyRR = require("./commands/stickyrr.js");

// Events
const readyEvent = require("./events/ready.js");
const messageEvent = require("./events/messageCreate.js");
const interactionEvent = require("./events/interactionCreate.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// LOAD ALL COMMANDS
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  if (!command.data || !command.execute) {
    console.log(`❌ Invalid command file: ${file}`);
    continue;
  }

  client.commands.set(command.data.name, command);
}

// EVENTS
client.once("ready", () =>
  readyEvent.execute(client, statusConfig)
);

client.on("messageCreate", (msg) =>
  messageEvent.execute(msg, stickyRR, client)
);

client.on("interactionCreate", (interaction) =>
  interactionEvent.execute(
    interaction,
    client,
    stickyRR
  )
);
console.log("BOOT 3");
client.login(process.env.TOKEN);