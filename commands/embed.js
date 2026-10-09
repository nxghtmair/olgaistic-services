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
    .setDescription("embed creator")
    .addSubcommand(sub =>
      sub
        .setName("create")
        .setDescription("create a custom embed")
    ),

  async execute(interaction) {
    if (interaction.options.getSubcommand() !== "create") return;

    const requiredRole = "1558060223548231712";
    if (!interaction.member.roles.cache.has(requiredRole)) {
      return interaction.reply({
        content: "u dont have enough perms, bitch.",
        ephemeral: true
      });
    }

    const modal = new ModalBuilder()
      .setCustomId("embed_create_modal")
      .setTitle("Create Custom Embed");

    modal.addComponents(
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("embed_title")
          .setLabel("Title (optional)")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("embed_desc")
          .setLabel("Description (required)")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("embed_color")
          .setLabel("Color HEX (optional)")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("embed_image")
          .setLabel("Image URL (optional)")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      ),
      new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId("embed_thumb")
          .setLabel("Thumbnail URL (optional)")
          .setStyle(TextInputStyle.Short)
          .setRequired(false)
      )
    );

    await interaction.showModal(modal);
  }
};
