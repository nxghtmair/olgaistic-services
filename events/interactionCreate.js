const {
  EmbedBuilder,
  ComponentType,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");

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

    // 24 ANNOUNCEMENT — SIMPLE VERSION (NO PUREIMAGE)
    if (interaction.isModalSubmit() && interaction.customId === "24_announce_modal") {
      const desc = interaction.fields.getTextInputValue("24_desc");

      const nickname =
        interaction.member.nickname ||
        interaction.user.username;

      const embed = new EmbedBuilder()
        .setTitle("↳ ❝ [24' News] ¡! ❞")
        .setDescription(desc)
        .setColor("#0A5CFF")
        .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
        .setImage("https://cdn.discordapp.com/attachments/1212370536416677949/1558523793025015808/image.png");

      const announcerComponent = {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            label: `🗨️ Announcer: ${nickname}`,
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

    // CONFESSION SYSTEM
    if (interaction.isModalSubmit() && interaction.customId.startsWith("confession_modal_")) {
      const confessionText = interaction.fields.getTextInputValue("confession_text");
      const type = interaction.customId.replace("confession_modal_", "");

      // DM user
      try {
        await interaction.user.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("❍⌇─➭ Confessions ﹀﹀ ︵↷")
              .setDescription("hey bitch, thanks for using our confessions system. u can start spilling, whore.")
              .setColor("#0A5CFF")
              .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
          ]
        });
      } catch (err) {}

      // Counter
      const counterPath = "./confessionCounter.json";
      if (!fs.existsSync(counterPath)) {
        fs.writeFileSync(counterPath, JSON.stringify({ count: 0 }, null, 2));
      }

      let data = JSON.parse(fs.readFileSync(counterPath));
      data.count++;
      fs.writeFileSync(counterPath, JSON.stringify(data, null, 2));

      const confessionNumber = data.count;

      // Confesser name
      let confesserName;
      if (type === "anonymous") {
        confesserName = "Anonymous";
      } else {
        confesserName =
          interaction.member.nickname ||
          interaction.user.username;
      }

      // Confession embed
      const embed = new EmbedBuilder()
        .setTitle(`. . . ⇢ ˗ˏˋ [Confession No. ${confessionNumber}] ࿐ྂ`)
        .setDescription(confessionText)
        .setColor("#0A5CFF")
        .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
        .setImage("https://cdn.discordapp.com/attachments/1212370536416677949/1558581664337362944/44829883-69d6-4467-8cd9-8f645e59d42f.png");

      const confesserComponent = {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            label: `✬ Confesser: ${confesserName} ✬`,
            style: ButtonStyle.Secondary,
            custom_id: "confesser_display",
            disabled: true
          }
        ]
      };

      const channel = await client.channels.fetch("1555989423903080592");

      const sent = await channel.send({
        embeds: [embed],
        components: [confesserComponent]
      });

      await sent.startThread({
        name: "discussion",
        autoArchiveDuration: 1440
      });

      return interaction.reply({
        content: "✔ confession submitted",
        ephemeral: true
      });
    }
  }
};
