const { Client, GatewayIntentBits, ActivityType } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Custom bot status
  client.user.setPresence({
    activities: [
      {
        name: "🎃👻Olgafy: Coming Soon ",
        type: ActivityType.Playing
      }
    ],
    status: "online"
  });
});

client.on("messageCreate", (msg) => {
  if (msg.content === "!ping") {
    msg.reply("pong");
  }
});

client.login(process.env.TOKEN);
