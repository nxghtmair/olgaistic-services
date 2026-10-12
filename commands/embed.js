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
        .setDescription("Create a single embed")
    )
    .addSubcommand(sub =>
      sub
        .setName("addon")
        .setDescription("Add 2 embeds to an existing message")
        .addStringOption(opt =>
          opt
            .setName("message_id")
            .setDescription("ID of the message")
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    if (!interaction.member.roles.cache.has(EMBED_ROLE_ID)) {
      return interaction.reply({
        content: "❌ Nice try bitch, but ur a bit too young for that.",
        flags: 64
      });
    }

    const sub = interaction.options.getSubcommand();

    // /embed create
    if (sub === "create") {
      const modal = new ModalBuilder()
        .setCustomId("embed_create_modal")
        .setTitle("Create Embed");

      const fields = [
        new TextInputBuilder()
          .setCustomId("title")
          .setLabel("Title")
          .setStyle(TextInputStyle.Short),

        new TextInputBuilder()
          .setCustomId("desc")
          .setLabel("Description")
          .setStyle(TextInputStyle.Paragraph),

        new TextInputBuilder()
          .setCustomId("image")
          .setLabel("Image URL")
          .setStyle(TextInputStyle.Short),

        new TextInputBuilder()
          .setCustomId("attachment")
          .setLabel("Attachment Image URL")
          .setStyle(TextInputStyle.Short)
      ];

      modal.addComponents(
        new ActionRowBuilder().addComponents(fields[0]),
        new ActionRowBuilder().addComponents(fields[1]),
        new ActionRowBuilder().addComponents(fields[2]),
        new ActionRowBuilder().addComponents(fields[3])
      );

      return interaction.showModal(modal);
    }

    // /embed addon
    if (sub === "addon") {
      const msgId = interaction.options.getString("message_id");

      const modal = new ModalBuilder()
        .setCustomId(`embed_addon_modal_${msgId}`)
        .setTitle("Add 2 Embeds");

      const fields = [
        new TextInputBuilder()
          .setCustomId("title_1")
          .setLabel("Title for Embed 1")
          .setStyle(TextInputStyle.Short),

        new TextInputBuilder()
          .setCustomId("desc_1")
          .setLabel("Description for Embed 1")
          .setStyle(TextInputStyle.Paragraph),

        new TextInputBuilder()
          .setCustomId("image_1")
          .setLabel("Image URL for Embed 1")
          .setStyle(TextInputStyle.Short),

        new TextInputBuilder()
          .setCustomId("attachment_1")
          .setLabel("Attachment Image URL for Embed 1")
          .setStyle(TextInputStyle.Short),

        new TextInputBuilder()
          .setCustomId("title_2")
          .setLabel("Title for Embed 2")
          .setStyle(TextInputStyle.Short),

        new TextInputBuilder()
          .setCustomId("desc_2")
          .setLabel("Description for Embed 2")
          .setStyle(TextInputStyle.Paragraph),

        new TextInputBuilder()
          .setCustomId("image_2")
          .setLabel("Image URL for Embed 2")
          .setStyle(TextInputStyle.Short),

        new TextInputBuilder()
          .setCustomId("attachment_2")
          .setLabel("Attachment Image URL for Embed 2")
          .setStyle(TextInputStyle.Short)
      ];

      modal.addComponents(
        new ActionRowBuilder().addComponents(fields[0]),
        new ActionRowBuilder().addComponents(fields[1]),
        new ActionRowBuilder().addComponents(fields[2]),
        new ActionRowBuilder().addComponents(fields[3]),
        new ActionRowBuilder().addComponents(fields[4]),
        new ActionRowBuilder().addComponents(fields[5]),
        new ActionRowBuilder().addComponents(fields[6]),
        new ActionRowBuilder().addComponents(fields[7])
      );

      return interaction.showModal(modal);
    }
  }
};
