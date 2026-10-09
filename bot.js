const { 
  Client, 
  GatewayIntentBits, 
  ActivityType,
  Collection 
} = require("discord.js");
require("dotenv").config();

const statusConfig = require("./status.js");
const stickyRR = require("./stickyrr.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// Register command
client.commands.set("stickyrr", stickyRR);

// Ready
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Apply status
  client.user.setStatus(statusConfig.presence.status);
  client.user.setActivity(statusConfig.presence.activity.name, {
    type: ActivityType[statusConfig.presence.activity.type]
  });

  console.log("Status loaded from status.js");
});

// Interaction handler
client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const cmd = client.commands.get(interaction.commandName);
    if (cmd) return cmd.execute(interaction);
  }

  if (interaction.isModalSubmit()) {
    return stickyRR.handleModal(interaction);
  }

  if (interaction.isButton()) {
    return stickyRR.handleButton(interaction);
  }
});

// Sticky message handler
client.on("messageCreate", async (message) => {
  stickyRR.handleMessage(message);
});

client.login(process.env.TOKEN);
