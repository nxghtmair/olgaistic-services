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
    // EMBED CREATOR — MODAL 1 (Embeds 1 & 2)
    // ─────────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId === "embed_modal_1") {

      client.embedTemp = {
        title_1: interaction.fields.getTextInputValue("title_1"),
        desc_1: interaction.fields.getTextInputValue("desc_1"),
        title_2: interaction.fields.getTextInputValue("title_2"),
        desc_2: interaction.fields.getTextInputValue("desc_2")
      };

      const modal = new ModalBuilder()
        .setCustomId("embed_modal_2")
        .setTitle("Embeds 3 & 4");

      const fields = [
        new TextInputBuilder()
          .setCustomId("title_3")
          .setLabel("Title for Embed 3")
          .setStyle(TextInputStyle.Short)
          .setRequired(false),

        new TextInputBuilder()
          .setCustomId("desc_3")
          .setLabel("Description for Embed 3")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false),

        new TextInputBuilder()
          .setCustomId("title_4")
          .setLabel("Title for Embed 4")
          .setStyle(TextInputStyle.Short)
          .setRequired(false),

        new TextInputBuilder()
          .setCustomId("desc_4")
          .setLabel("Description for Embed 4")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
      ];

      modal.addComponents(
        new ActionRowBuilder().addComponents(fields[0]),
        new ActionRowBuilder().addComponents(fields[1]),
        new ActionRowBuilder().addComponents(fields[2]),
        new ActionRowBuilder().addComponents(fields[3])
      );

      return interaction.showModal(modal);
    }

    // ─────────────────────────────────────────────
    // EMBED CREATOR — MODAL 2 (Embeds 3 & 4)
    // ─────────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId === "embed_modal_2") {

      client.embedTemp.title_3 = interaction.fields.getTextInputValue("title_3");
      client.embedTemp.desc_3 = interaction.fields.getTextInputValue("desc_3");
      client.embedTemp.title_4 = interaction.fields.getTextInputValue("title_4");
      client.embedTemp.desc_4 = interaction.fields.getTextInputValue("desc_4");

      const modal = new ModalBuilder()
        .setCustomId("embed_modal_3")
        .setTitle("Embed 5");

      const fields = [
        new TextInputBuilder()
          .setCustomId("title_5")
          .setLabel("Title for Embed 5")
          .setStyle(TextInputStyle.Short)
          .setRequired(false),

        new TextInputBuilder()
          .setCustomId("desc_5")
          .setLabel("Description for Embed 5")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(false)
      ];

      modal.addComponents(
        new ActionRowBuilder().addComponents(fields[0]),
        new ActionRowBuilder().addComponents(fields[1])
      );

      return interaction.showModal(modal);
    }

    // ─────────────────────────────────────────────
    // EMBED CREATOR — MODAL 3 (Embed 5)
    // ─────────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId === "embed_modal_3") {

      client.embedTemp.title_5 = interaction.fields.getTextInputValue("title_5");
      client.embedTemp.desc_5 = interaction.fields.getTextInputValue("desc_5");

      const embeds = [];

      for (let i = 1; i <= 5; i++) {
        const title = client.embedTemp[`title_${i}`];
        const desc = client.embedTemp[`desc_${i}`];

        if (!title && !desc) continue;

        const embed = new EmbedBuilder()
          .setColor("#0A5CFF")
          .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" });

        if (title) embed.setTitle(title);
        if (desc) embed.setDescription(desc);

        embeds.push(embed);
      }

      if (embeds.length === 0) {
        return interaction.reply({
          content: "❌ You didn't fill out any embed fields.",
          ephemeral: true
        });
      }

      await interaction.channel.send({ embeds });

      return interaction.reply({
        content: `✔ Sent ${embeds.length} embed(s).`,
        ephemeral: true
      });
    }

    // ─────────────────────────────────────────────
    // 24 ANNOUNCEMENT
    // ─────────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId === "24_announce_modal") {
      const desc = interaction.fields.getTextInputValue("24_desc");

      const nickname =
        interaction.member?.nickname ||
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
            type: ButtonStyle.Secondary,
            label: `🗨️ Announcer: ${nickname}`,
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
            type: ButtonStyle.Secondary,
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
