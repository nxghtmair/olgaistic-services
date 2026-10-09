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

    if (!data.leaderboardMessageId) {
      const { weeklyEmbed, overallEmbed } = buildLeaderboards(client);
      const msg = await channel.send({ embeds: [weeklyEmbed, overallEmbed] });
      data.leaderboardMessageId = msg.id;
      save(data);
    }

    setInterval(async () => {
      const data = load();
      const msg = await channel.messages.fetch(data.leaderboardMessageId);

      const { weeklyEmbed, overallEmbed } = buildLeaderboards(client);

      await msg.edit({ embeds: [weeklyEmbed, overallEmbed] });
    }, 15000);

    setInterval(() => {
      const now = new Date();
      if (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
        const data = load();
        data.weekly = {};
        data.weekNumber++;
        save(data);
      }
    }, 60000);

    await client.application.commands.set(
      client.commands.map(cmd => cmd.data)
    );
  }
};
