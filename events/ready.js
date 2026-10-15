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
  }
};