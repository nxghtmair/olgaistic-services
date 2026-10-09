const { ActivityType } = require("discord.js");
const { load, save } = require("../utils/chatTracker");
const buildLeaderboards = require("../utils/leaderboardBuilder");

module.exports = {
  name: "ready",
  once: true,
  async execute(client, statusConfig) {
    console.log(`Logged in as ${client.user.tag}`);

    // FIXED: ActivityType now works
    client.user.setStatus(statusConfig.presence.status);
    client.user.setActivity(statusConfig.presence.activity.name, {
      type: ActivityType[statusConfig.presence.activity.type]
    });

    const CHANNEL_ID = "1555618153231552584";
    const MESSAGE_ID = "1558117679657652289";

    const channel = await client.channels.fetch(CHANNEL_ID);

    // auto update every 15 seconds
    setInterval(async () => {
      try {
        const msg = await channel.messages.fetch(MESSAGE_ID);

        const { weeklyEmbed, overallEmbed } = buildLeaderboards(client);

        await msg.edit({ embeds: [weeklyEmbed, overallEmbed] });
      } catch (err) {
        console.log("Leaderboard edit error:", err);
      }
    }, 15000);

    // weekly reset every Monday 00:00
    setInterval(() => {
      const now = new Date();
      if (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
        const data = load();
        data.weekly = {};
        data.weekNumber++;
        save(data);
      }
    }, 60000);

    // register slash commands
    await client.application.commands.set(
      client.commands.map(cmd => cmd.data)
    );
  }
};
