// commands/chatstatsch.js
const { SlashCommandBuilder } = require("discord.js");
const { loadData, saveData, updateLeaderboard } = require("../utils/chatXP");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chatstatsch")
    .setDescription("Set chat leaderboard channel")
    .addChannelOption(opt =>
      opt
        .setName("channel")
        .setDescription("Channel where leaderboard will be posted")
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel("channel");

    const data = loadData();
    data.leaderboardChannelId = channel.id;
    data.leaderboardMessageId = null;
    saveData(data);

    await updateLeaderboard(interaction.client);

    return interaction.reply({
      content: `✔ Chat leaderboard channel set to ${channel}.`,
      ephemeral: true
    });
  }
};
