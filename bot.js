const { Client, GatewayIntentBits, ActivityType, Collection } = require("discord.js");
require("dotenv").config();

const fs = require("fs");
const path = require("path");

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
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
}

// EVENTS
client.once("ready", () => readyEvent.execute(client, statusConfig));
client.on("messageCreate", (msg) => messageEvent.execute(msg, stickyRR));
client.on("interactionCreate", (interaction) => interactionEvent.execute(interaction, client, stickyRR));

client.login(process.env.TOKEN);
