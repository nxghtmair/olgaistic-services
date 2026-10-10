const {
  EmbedBuilder,
  ComponentType,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
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

    // ─────────────────────────────────────────────
    // EMBED CREATE — SINGLE EMBED
    // ─────────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId === "embed_create_modal") {
      const title = interaction.fields.getTextInputValue("title");
      const desc = interaction.fields.getTextInputValue("desc");
      const image = interaction.fields.getTextInputValue("image");
      const thumb = interaction.fields.getTextInputValue("thumb");

      const embed = new EmbedBuilder()
        .setColor("#0A5CFF")
        .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" });

      if (title) embed.setTitle(title);
      if (desc) embed.setDescription(desc);
      if (image) embed.setImage(image);
      if (thumb) embed.setThumbnail(thumb);

      await interaction.channel.send({ embeds: [embed] });

      return interaction.reply({
        content: "✔ Embed created.",
        ephemeral: true
      });
    }

    // ─────────────────────────────────────────────
    // EMBED ADDON — ADD 2 EMBEDS TO EXISTING MESSAGE
    // ─────────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId.startsWith("embed_addon_modal_")) {
      const msgId = interaction.customId.replace("embed_addon_modal_", "");

      const title1 = interaction.fields.getTextInputValue("title_1");
      const desc1 = interaction.fields.getTextInputValue("desc_1");
      const title2 = interaction.fields.getTextInputValue("title_2");
      const desc2 = interaction.fields.getTextInputValue("desc_2");

      const channel = interaction.channel;
      const msg = await channel.messages.fetch(msgId).catch(() => null);

      if (!msg) {
        return interaction.reply({
          content: "❌ Message not found.",
          ephemeral: true
        });
      }

      const newEmbeds = [...msg.embeds];

      if (title1 || desc1) {
        const e1 = new EmbedBuilder()
          .setColor("#0A5CFF")
          .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" });

        if (title1) e1.setTitle(title1);
        if (desc1) e1.setDescription(desc1);

        newEmbeds.push(e1);
      }

      if (title2 || desc2) {
        const e2 = new EmbedBuilder()
          .setColor("#0A5CFF")
          .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" });

        if (title2) e2.setTitle(title2);
        if (desc2) e2.setDescription(desc2);

        newEmbeds.push(e2);
      }

      await msg.edit({ embeds: newEmbeds });

      return interaction.reply({
        content: "✔ Added embeds.",
        ephemeral: true
      });
    }

    // ─────────────────────────────────────────────
    // 24 ANNOUNCEMENT — JIMP IMAGE GENERATION
    // ─────────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId === "24_announce_modal") {
      const desc = interaction.fields.getTextInputValue("24_desc");

      const nickname =
        interaction.member?.nickname ||
        interaction.user.username;

      const Jimp = require("jimp");

      const template = await Jimp.read("./assets/24template.png");

      const boxX = 150;
      const boxY = 150;
      const boxW = 900;
      const boxH = 500;

      const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

      template.print(
        font,
        boxX,
        boxY,
        {
          text: desc,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },
        boxW,
        boxH
      );

      const outPath = "./assets/24output.png";
      await template.writeAsync(outPath);

      const embed = new EmbedBuilder()
        .setTitle("↳ ❝ [24' News] ¡! ❞")
        .setColor("#0A5CFF")
        .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
        .setImage("attachment://24output.png");

      const announcerComponent = {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Secondary,
            label: `🗨️ Announcer: ${nickname}`,
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
            attachment: outPath,
            name: "24output.png"
          }
        ]
      });

      return interaction.reply({
        content: "✔ Announcement sent.",
        ephemeral: true
      });
    }

    // ─────────────────────────────────────────────
    // CONFESSION SYSTEM
    // ─────────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId.startsWith("confession_modal_")) {
      const confessionText = interaction.fields.getTextInputValue("confession_text");
      const type = interaction.customId.replace("confession_modal_", "");

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
      } catch {}

      const counterPath = "./confessionCounter.json";
      if (!fs.existsSync(counterPath)) {
        fs.writeFileSync(counterPath, JSON.stringify({ count: 0 }, null, 2));
      }

      let data = JSON.parse(fs.readFileSync(counterPath));
      data.count++;
      fs.writeFileSync(counterPath, JSON.stringify(data, null, 2));

      const confessionNumber = data.count;

      let confesserName =
        type === "anonymous"
          ? "Anonymous"
          : interaction.member?.nickname || interaction.user.username;

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
            style: ButtonStyle.Secondary,
            label: `✬ Confesser: ${confesserName} ✬`,
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
