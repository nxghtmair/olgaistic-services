const { SlashCommandBuilder } = require("discord.js");
const eco = require("../utils/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deposit")
    .setDescription("Deposit Turds into your bank.")
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Amount to deposit")
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");
    const data = eco.loadData();
    const user = eco.getUser(data, interaction.guildId, interaction.user.id);

    if (user.wallet < amount) {
      return interaction.reply({
        content: `You only have ${eco.money(user.wallet)} in your wallet.`,
        ephemeral: true
      });
    }

    user.wallet -= amount;
    user.bank += amount;

    return eco.finish(
      interaction, data,
      `You deposited **${eco.money(amount)}**.\nWallet: ${eco.money(user.wallet)}\nBank: ${eco.money(user.bank)}`,
      "🏦 Deposit"
    );
  }
};