const { ActivityType } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,

  async execute(client, statusConfig) {
    console.log(`Logged in as ${client.user.tag}`);

    // Presence
    client.user.setStatus(
      statusConfig.presence.status
    );

    client.user.setActivity(
      statusConfig.presence.activity.name,
      {
        type:
          ActivityType[
            statusConfig.presence.activity.type
          ]
      }
    );

    // Register slash commands
    await client.application.commands.set(
      client.commands.map(cmd => cmd.data)
    );

    console.log("Commands registered.");
    try {

  const fs = require("fs");

  const dataPath =
    "./utils/chatData.json";

  const guild =
    client.guilds.cache.first();

  if (guild &&
      fs.existsSync(dataPath)) {

    const data =
      JSON.parse(
        fs.readFileSync(dataPath)
      );

    const logChannel =
      guild.channels.cache.get(
        "1560564008526815292"
      );

    if (logChannel) {

      const messages =
        await logChannel.messages.fetch({
          limit: 100
        });

      const log =
        messages.find(
          m =>
          m.author.id === client.user.id &&
          m.embeds.length &&
          m.embeds[0].title ===
          "🤖lb logs"
        );

      if (log) {

        const desc =
          log.embeds[0].description;

        const users = {};

        const regex =
/<@(\d+)>[\s\S]*?XP:\s*(\d+)[\s\S]*?Messages:\s*(\d+)/g;

        let match;

        while (
          (match =
            regex.exec(desc))
        ) {

          users[
            match[1]
          ] = {

            xp:
              Number(match[2]),

            messages:
              Number(match[3])
          };
        }

        data.users =
          users;

        fs.writeFileSync(
          dataPath,
          JSON.stringify(
            data,
            null,
            2
          )
        );

        console.log(
          "XP restored from lb logs."
        );
      }
    }
  }
}
catch (err) {

  console.log(
    "LB restore failed:",
    err.message
  );
}
  }
};

console.log("BOT READY");

client.once("ready", async () => {
  console.log(
    "READY AS:",
    client.user.tag
  );

  const guild =
    client.guilds.cache.first();

  console.log(
    "GUILDS:",
    client.guilds.cache.size
  );

  console.log(
    "GUILD:",
    guild?.name
  );
});