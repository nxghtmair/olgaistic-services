const { SlashCommandBuilder } = require("discord.js");
const eco = require("../utils/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("withdraw")
    .setDescription("Withdraw Turds from your bank.")
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Amount to withdraw")
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");
    const data = eco.loadData();
    const user = eco.getUser(data, interaction.guildId, interaction.user.id);

    if (user.bank < amount) {
      return interaction.reply({
        content: `You only have ${eco.money(user.bank)} in your bank.`,
        ephemeral: true
      });
    }

    user.bank -= amount;
    user.wallet += amount;

    return eco.finish(
      interaction, data,
      `You withdrew **${eco.money(amount)}**.\nWallet: ${eco.money(user.wallet)}\nBank: ${eco.money(user.bank)}`,
      "🏦 Withdrawal"
    );
  }
};