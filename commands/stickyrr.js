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

let stickyRRData = {};

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
    if (!interaction.member.roles.cache.has("1558060373972746300")) {
      return interaction.reply({
        content: "You don't have permission to use this command.",
        ephemeral: true,
      });
    }

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
    const roleId = interaction.fields.getTextInputValue("stickyrr_role");
    const emoji = interaction.fields.getTextInputValue("stickyrr_emoji");

    // Load role object
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) {
      return interaction.reply({
        content: "❌ Role not found. Check the ID.",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("⇢ ˗ˏˋ Sticky Reaction Role ࿐ྂ")
      .setDescription(
        `hey bitch, are you interested in being notified about future posts from this channel?\npress the button to obtain the ${role} role !`
      )
      .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
      .setColor("#8B0000");

    const button = new ButtonBuilder()
      .setCustomId(`stickyrr_button_${roleId}`)
      .setEmoji(emoji)
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(button);

    const msg = await interaction.channel.send({ embeds: [embed], components: [row] });

    stickyRRData[interaction.channel.id] = {
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
