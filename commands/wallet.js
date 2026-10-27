const { SlashCommandBuilder } = require("discord.js");
const eco = require("../utils/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("wallet")
    .setDescription("View a member's Turds card.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to view")
        .setRequired(false)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user") || interaction.user;
    const data = eco.loadData();
    const user = eco.getUser(data, interaction.guildId, target.id);
    const rank = eco.getRank(data, interaction.guildId, target.id);
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    const nickname = member?.displayName || target.username;

    const embed = eco.makeEmbed(
      `${nickname}'s card`,
      [
        `**Wallet**\n${eco.money(user.wallet)}`,
        `**Bank**\n${eco.money(user.bank)}`,
        `**Total wealth**\n${eco.money(user.wallet + user.bank)}`,
        `**Lifetime earned**\n${eco.money(user.earned)}`,
        `**Leaderboard rank**\n${rank ? `#${rank}` : "Unranked"}`
      ].join("\n\n")
    );

    return interaction.reply({ embeds: [embed] });
  }
};