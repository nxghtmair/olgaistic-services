const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

let stickyRRData = {}; // per-channel sticky RR storage

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stickyrr")
    .setDescription("Sticky Reaction Role system")
    .addSubcommand(sub =>
      sub
        .setName("create")
        .setDescription("Create a sticky reaction role")
    ),

  async execute(interaction) {
    // Only allow role 1558060373972746300
    if (!interaction.member.roles.cache.has("1558060373972746300")) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      });
    }

    // Modal
    const modal = new ModalBuilder()
      .setCustomId("stickyrr_modal")
      .setTitle("Sticky Reaction Role Setup");

    const roleInput = new TextInputBuilder()
      .setCustomId("stickyrr_role")
      .setLabel("Role ID to give")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const emojiInput = new TextInputBuilder()
      .setCustomId("stickyrr_emoji")
      .setLabel("Emoji for the button")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(roleInput),
      new ActionRowBuilder().addComponents(emojiInput)
    );

    await interaction.showModal(modal);
  },

  async handleModal(interaction) {
    if (interaction.customId !== "stickyrr_modal") return;

    const roleId = interaction.fields.getTextInputValue("stickyrr_role");
    const emoji = interaction.fields.getTextInputValue("stickyrr_emoji");

    const channel = interaction.channel;

    // Embed
    const embed = new EmbedBuilder()
      .setTitle("⇢ ˗ˏˋ Sticky Reaction Role ࿐ྂ")
      .setDescription(
        `hey bitch, are you interested in being notified about future posts from this channel?\npress the button to obtain the <@${roleId}> role !`
      )
      .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
      .setColor("#8B0000");

    // Button
    const button = new ButtonBuilder()
      .setCustomId(`stickyrr_button_${roleId}`)
      .setEmoji(emoji)
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(button);

    // Send sticky message
    const msg = await channel.send({ embeds: [embed], components: [row] });

    stickyRRData[channel.id] = {
      roleId,
      emoji,
      embed,
      row,
      messageId: msg.id,
    };

    await interaction.reply({
      content: "Sticky Reaction Role created!",
      ephemeral: true,
    });
  },

  async handleButton(interaction) {
    if (!interaction.customId.startsWith("stickyrr_button_")) return;

    const roleId = interaction.customId.split("_")[2];
    const member = interaction.member;

    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
      return interaction.reply({
        content: `Removed <@&${roleId}>`,
        ephemeral: true,
      });
    } else {
      await member.roles.add(roleId);
      return interaction.reply({
        content: `Added <@&${roleId}>`,
        ephemeral: true,
      });
    }
  },

  async handleMessage(message) {
    if (message.author.bot) return;

    const data = stickyRRData[message.channel.id];
    if (!data) return;

    try {
      const oldMsg = await message.channel.messages.fetch(data.messageId).catch(() => null);
      if (oldMsg) await oldMsg.delete().catch(() => {});

      const newMsg = await message.channel.send({
        embeds: [data.embed],
        components: [data.row],
      });

      data.messageId = newMsg.id;
    } catch (err) {
      console.log("Sticky RR error:", err);
    }
  }
};
