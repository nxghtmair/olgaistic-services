const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Create up to 5 embeds")
    .addSubcommand(sub =>
      sub
        .setName("create")
        .setDescription("Create multiple embeds")
    ),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("embed_modal_1")
      .setTitle("Embeds 1 & 2");

    const fields = [
      new TextInputBuilder()
        .setCustomId("title_1")
        .setLabel("Title for Embed 1")
        .setStyle(TextInputStyle.Short)
        .setRequired(false),

      new TextInputBuilder()
        .setCustomId("desc_1")
        .setLabel("Description for Embed 1")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false),

      new TextInputBuilder()
        .setCustomId("title_2")
        .setLabel("Title for Embed 2")
        .setStyle(TextInputStyle.Short)
        .setRequired(false),

      new TextInputBuilder()
        .setCustomId("desc_2")
        .setLabel("Description for Embed 2")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false)
    ];

    modal.addComponents(
      new ActionRowBuilder().addComponents(fields[0]),
      new ActionRowBuilder().addComponents(fields[1]),
      new ActionRowBuilder().addComponents(fields[2]),
      new ActionRowBuilder().addComponents(fields[3])
    );

    await interaction.showModal(modal);
  }
};
