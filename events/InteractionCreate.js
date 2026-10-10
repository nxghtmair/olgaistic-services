const { EmbedBuilder, ComponentType, ButtonStyle } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {

    // Slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      return command.execute(interaction, client);
    }

    // 24 announce modal
    if (interaction.isModalSubmit() && interaction.customId === "24_announce_modal") {
      const desc = interaction.fields.getTextInputValue("24_desc");

      const nickname =
        interaction.member.nickname ||
        interaction.user.username;

      const embed = new EmbedBuilder()
        .setTitle("🗨️ 24 Announcement")
        .setDescription(desc)
        .setColor("#0A5CFF")
        .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
        .setImage("https://cdn.discordapp.com/attachments/1212370536416677949/1558523793025015808/image.png?ex=6acbbfe4&is=6aca6e64&hm=15c1635e8bb4d76f866fb6151800d287686cefc401ce9581c2759dba9e2069a7&");

      const announcerComponent = {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            label: `🗨️Announcer: ${nickname}`,
            style: ButtonStyle.Secondary,
            custom_id: "announcer_display",
            disabled: true
          }
        ]
      };

      const channel = await client.channels.fetch("1553495305591328888");

      await channel.send({
        embeds: [embed],
        components: [announcerComponent]
      });

      return interaction.reply({
        content: "Announcement sent.",
        ephemeral: true
      });
    }
  }
};
