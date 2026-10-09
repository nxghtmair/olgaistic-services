const { SlashCommandBuilder } = require("discord.js");
const { load, save } = require("../utils/chatTracker");
const buildLeaderboards = require("../utils/leaderboardBuilder");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lb")
    .setDescription("leaderboard controls")
    .addSubcommand(sub =>
      sub.setName("refresh").setDescription("refresh leaderboard")
    ),

  async execute(interaction, client) {
    if (interaction.options.getSubcommand() !== "refresh") return;

    const CHANNEL_ID = "1555618153231552584";
    const data = load();
    const channel = await client.channels.fetch(CHANNEL_ID);
    const msg = await channel.messages.fetch(data.leaderboardMessageId);

    const { weeklyEmbed, overallEmbed } = buildLeaderboards(client);

    await msg.edit({ embeds: [weeklyEmbed, overallEmbed] });

    await interaction.reply({ content: "Leaderboard refreshed.", ephemeral: true });
  }
};
