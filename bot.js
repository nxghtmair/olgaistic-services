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

client.on("error", console.error);
client.on("warn", console.warn);

console.log("ATTEMPTING LOGIN");

client.login(process.env.TOKEN)
  .then(() => {
    console.log("LOGIN SUCCESS");
  })
  .catch(err => {
    console.error(
      "LOGIN ERROR:",
      err
    );
  });