const { Client, GatewayIntentBits, ActivityType, Collection } = require("discord.js");
require("dotenv").config();

const statusConfig = require("./status.js");

// Commands
const stickyRR = require("./commands/stickyrr.js");

// Events
const readyEvent = require("./events/ready.js");
const messageEvent = require("./events/messageCreate.js");
const interactionEvent = require("./events/InteractionCreate.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
client.commands.set("stickyrr", stickyRR);

client.once("ready", () => readyEvent.execute(client, statusConfig));

client.on("messageCreate", (msg) => messageEvent.execute(msg, stickyRR));

client.on("interactionCreate", (interaction) => interactionEvent.execute(interaction, client, stickyRR));

client.login(process.env.TOKEN);
