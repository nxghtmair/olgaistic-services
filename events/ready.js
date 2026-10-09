const { load, save } = require("../utils/chatTracker");
const buildLeaderboards = require("../utils/leaderboardBuilder");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);

    const CHANNEL_ID = "1555618153231552584";

    const data = load();
    const channel = await client.channels.fetch(CHANNEL_ID);

    // create message if missing
    if (!data.leaderboardMessageId) {
      const { weeklyEmbed, overallEmbed } = buildLeaderboards(client);
      const msg = await channel.send({ embeds: [weeklyEmbed, overallEmbed] });
      data.leaderboardMessageId = msg.id;
      save(data);
    }

    // auto update every 15 seconds
    setInterval(async () => {
      const data = load();
      const msg = await channel.messages.fetch(data.leaderboardMessageId);

      const { weeklyEmbed, overallEmbed } = buildLeaderboards(client);

      await msg.edit({ embeds: [weeklyEmbed, overallEmbed] });
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
  }
};
