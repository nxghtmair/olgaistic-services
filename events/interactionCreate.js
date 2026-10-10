const { EmbedBuilder, ComponentType, ButtonStyle } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client, stickyRR) {

    // Slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      return command.execute(interaction, client);
    }

    // StickyRR modal
    if (interaction.isModalSubmit() && interaction.customId === "stickyrr_modal") {
      return stickyRR.handleModal(interaction);
    }

    // StickyRR button
    if (interaction.isButton() && interaction.customId.startsWith("stickyrr_button_")) {
      return stickyRR.handleButton(interaction);
    }

    // Embed creator modal
    if (interaction.isModalSubmit() && interaction.customId === "embed_create_modal") {
      const title = interaction.fields.getTextInputValue("embed_title");
      const desc = interaction.fields.getTextInputValue("embed_desc");
      const color = interaction.fields.getTextInputValue("embed_color");
      const image = interaction.fields.getTextInputValue("embed_image");
      const thumb = interaction.fields.getTextInputValue("embed_thumb");

      const embed = new EmbedBuilder()
        .setDescription(desc)
        .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" });

      if (title) embed.setTitle(title);
      if (color) embed.setColor(color);
      else embed.setColor("#3498db");
      if (image) embed.setImage(image);
      if (thumb) embed.setThumbnail(thumb);

      await interaction.channel.send({ embeds: [embed] });

      return interaction.reply({
        content: "✔ embed sent",
        ephemeral: true
      });
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
        .setColor("#0A5CFF") // azurite blue
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
