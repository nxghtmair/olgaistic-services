// commands/embed.js
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
    .setDescription("Embed tools")
    .addSubcommand(sub =>
      sub
        .setName("create")
        .setDescription("Create a single embed")
    ),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("embed_create_modal")
      .setTitle("Create Embed");

    const fields = [
      new TextInputBuilder()
        .setCustomId("title")
        .setLabel("Title")
        .setStyle(TextInputStyle.Short)
        .setRequired(false),

      new TextInputBuilder()
        .setCustomId("desc")
        .setLabel("Description")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(false),

      new TextInputBuilder()
        .setCustomId("image")
        .setLabel("Image URL")
        .setStyle(TextInputStyle.Short)
        .setRequired(false),

      new TextInputBuilder()
        .setCustomId("thumb")
        .setLabel("Thumbnail URL")
        .setStyle(TextInputStyle.Short)
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
