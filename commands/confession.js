// commands/confession.js
const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("confession")
    .setDescription("Create a confession")
    .addStringOption(opt =>
      opt
        .setName("type")
        .setDescription("anonymous or public")
        .setRequired(true)
        .addChoices(
          { name: "anonymous", value: "anonymous" },
          { name: "public", value: "public" }
        )
    ),

  async execute(interaction, client) {
    const type = interaction.options.getString("type");

    const modal = new ModalBuilder()
      .setCustomId(`confession_modal_${type}`)
      .setTitle("Confession");

    const input = new TextInputBuilder()
      .setCustomId("confession_text")
      .setLabel("Write your confession")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    await interaction.showModal(modal);
  }
};
