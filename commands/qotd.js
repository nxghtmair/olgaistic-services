// commands/qotd.js
const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits
} = require("discord.js");

const QOTD_ROLE_ID = "1558801002214457384";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("qotd")
    .setDescription("Question Of The Day")
    .addSubcommand(sub =>
      sub
        .setName("create")
        .setDescription("Create QOTD embed")
    ),

  async execute(interaction) {
    if (interaction.options.getSubcommand() !== "create") return;

    const member = interaction.member;
    if (!member.roles.cache.has(QOTD_ROLE_ID)) {
      return interaction.reply({
        content: "❌ You don't have enough perms, bitch.",
        ephemeral: true
      });
    }

    const modal = new ModalBuilder()
      .setCustomId("qotd_create_modal")
      .setTitle("Create QOTD");

    const descField = new TextInputBuilder()
      .setCustomId("qotd_desc")
      .setLabel("QOTD Description")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(descField)
    );

    await interaction.showModal(modal);
  }
};
