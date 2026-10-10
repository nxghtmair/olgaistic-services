const { 
  EmbedBuilder, 
  ComponentType, 
  ButtonStyle 
} = require("discord.js");

const { createCanvas, loadImage } = require("canvas");

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

      // Load template image
      const template = await loadImage("./assets/24template.png");

      const canvas = createCanvas(template.width, template.height);
      const ctx = canvas.getContext("2d");

      // Draw template
      ctx.drawImage(template, 0, 0);

      // White rectangle coordinates (adjust if needed)
      const boxX = 150;
      const boxY = 150;
      const boxW = 900;
      const boxH = 500;

      // Text settings
      ctx.fillStyle = "#000000";
      ctx.font = "40px Arial"; // medium size
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Wrap text
      const words = desc.split(" ");
      let lines = [];
      let currentLine = "";

      for (let word of words) {
        const testLine = currentLine + word + " ";
        const metrics = ctx.measureText(testLine);

        if (metrics.width > boxW - 40) {
          lines.push(currentLine);
          currentLine = word + " ";
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);

      // Draw wrapped text centered vertically
      const lineHeight = 50;
      const totalHeight = lines.length * lineHeight;
      let startY = boxY + (boxH - totalHeight) / 2;

      for (let line of lines) {
        ctx.fillText(line.trim(), boxX + boxW / 2, startY);
        startY += lineHeight;
      }

      // Convert canvas to buffer
      const finalImage = canvas.toBuffer();

      // Build embed
      const embed = new EmbedBuilder()
        .setTitle("🗨️ 24 Announcement")
        .setColor("#0A5CFF")
        .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
        .setImage("attachment://announcement.png");

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
        components: [announcerComponent],
        files: [
          {
            attachment: finalImage,
            name: "announcement.png"
          }
        ]
      });

      return interaction.reply({
        content: "Announcement sent.",
        ephemeral: true
      });
    }
  }
};
