const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ComponentType,
  ButtonStyle
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("24")
    .setDescription("24 announcement system")
    .addSubcommand(sub =>
      sub
        .setName("announce")
        .setDescription("create a 24-style announcement")
    ),

  async execute(interaction, client) {
    // role check
    const requiredRole = "1558523948533030912";
    if (!interaction.member.roles.cache.has(requiredRole)) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true
      });
    }

    // show modal
    const modal = new ModalBuilder()
      .setCustomId("24_announce_modal")
      .setTitle("24 Announcement");

    const descInput = new TextInputBuilder()
      .setCustomId("24_desc")
      .setLabel("Announcement text")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(descInput));

    await interaction.showModal(modal);
  }
};
