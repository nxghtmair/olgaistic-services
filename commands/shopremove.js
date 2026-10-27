const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const eco = require("../utils/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shopremove")
    .setDescription("Remove an item from the economy shop.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName("item")
        .setDescription("Exact name of the item")
        .setMaxLength(100)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "Only admins can manage the shop.",
        ephemeral: true
      });
    }

    const name = interaction.options.getString("item").trim();
    const data = eco.loadData();
    const items = data.shops[interaction.guildId] || [];

    const index = items.findIndex(
      item => item.name.toLowerCase() === name.toLowerCase()
    );

    if (index === -1) {
      return interaction.reply({
        content: `I couldn't find a shop item named "${name}".`,
        ephemeral: true
      });
    }

    const [removed] = items.splice(index, 1);
    data.shops[interaction.guildId] = items;
    eco.saveData(data);

    return interaction.reply({
      embeds: [
        eco.makeEmbed(
          "Shop item removed",
          `Removed **${removed.name}** from the shop.`
        )
      ]
    });
  }
};