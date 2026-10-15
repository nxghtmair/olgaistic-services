const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require("discord.js");

const EMBED_ROLE_ID = "1558060223548231712";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Embed tools")

    .addSubcommand(sub =>
      sub
        .setName("create")
        .setDescription("Create an embed")
    )

    .addSubcommand(sub =>
      sub
        .setName("addon")
        .setDescription("Add another embed to a message")
        .addStringOption(opt =>
          opt
            .setName("message_id")
            .setDescription("Message ID")
            .setRequired(true)
        )
    ),

  async execute(interaction) {

    if (
      !interaction.member.roles.cache.has(
        EMBED_ROLE_ID
      )
    ) {
      return interaction.reply({
        content:
          "❌ Nice try bitch, but ur a bit too young for that.",
        flags: 64
      });
    }

    const sub =
      interaction.options.getSubcommand();

    // CREATE

    if (sub === "create") {

      const modal = new ModalBuilder()
        .setCustomId("embed_create_modal")
        .setTitle("Create Embed");

      modal.addComponents(
        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("title")
            .setLabel("Title")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),

        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("desc")
            .setLabel("Description")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),

        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("image")
            .setLabel("Image URL")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        )
      );

      return interaction.showModal(modal);
    }

    // ADDON

    if (sub === "addon") {

      const msgId =
        interaction.options.getString(
          "message_id"
        );

      const modal = new ModalBuilder()
        .setCustomId(
          `embed_addon_modal_${msgId}`
        )
        .setTitle("Add Embed");

      modal.addComponents(

        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("title")
            .setLabel("Embed Title")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        ),

        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("desc")
            .setLabel("Embed Description")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false)
        ),

        new ActionRowBuilder().addComponents(
          new TextInputBuilder()
            .setCustomId("image")
            .setLabel("Image URL")
            .setStyle(TextInputStyle.Short)
            .setRequired(false)
        )
      );

      return interaction.showModal(modal);
    }
  }
};