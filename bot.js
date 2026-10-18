const { Client, GatewayIntentBits } =
  require("discord.js");

require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(
    "READY:",
    client.user.tag
  );
});

client.login(process.env.TOKEN);