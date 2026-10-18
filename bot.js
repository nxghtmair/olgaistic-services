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
client.once("ready", () => {
  console.log("READY EVENT FIRED");
});

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

console.log(
  "TOKEN EXISTS:",
  !!process.env.TOKEN
);

console.log(
  "TOKEN LENGTH:",
  process.env.TOKEN?.length
);

console.log("ATTEMPTING LOGIN");

(async () => {
  try {
    const result =
      await client.login(
        process.env.TOKEN
      );

    console.log(
      "LOGIN SUCCESS",
      result?.slice?.(0, 10)
    );
  }
  catch (err) {

    console.error(
      "LOGIN ERROR",
      err
    );
  }
})();