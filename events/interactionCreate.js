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
    // OLGAID — ACCOUNT ADD MODAL
    // ─────────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId === "olgaid_add_modal") {
      const username = interaction.fields.getTextInputValue("olgaid_username");
      const dataPath = "./olgaIdData.json";

      if (!fs.existsSync(dataPath)) {
        fs.writeFileSync(
          dataPath,
          JSON.stringify({ users: {}, statsMessageId: null, statsChannelId: null }, null, 2)
        );
      }

      const data = JSON.parse(fs.readFileSync(dataPath));
      const userId = interaction.user.id;

      if (!data.users[userId]) data.users[userId] = [];
      data.users[userId].push(username);

      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      await updateOlgaIdStatsEmbed(client, data);

      return interaction.reply({
        content: `✔ Added Olga account \`${username}\`.`,
        ephemeral: true
      });
    }

    // ─────────────────────────────────────────────
    // OLGAID — ACCOUNT DELETE MODAL
    // ─────────────────────────────────────────────
    if (interaction.isModalSubmit() && interaction.customId === "olgaid_delete_modal") {
      const username = interaction.fields.getTextInputValue("olgaid_delete_username");
      const dataPath = "./olgaIdData.json";

      if (!fs.existsSync(dataPath)) {
        return interaction.reply({
          content: "❌ You don't have any Olga accounts registered.",
          ephemeral: true
        });
      }

      const data = JSON.parse(fs.readFileSync(dataPath));
      const userId = interaction.user.id;
      const accounts = data.users?.[userId] || [];

      if (!accounts.length) {
        return interaction.reply({
          content: "❌ You don't have any Olga accounts registered.",
          ephemeral: true
        });
      }

      const idx = accounts.indexOf(username);
      if (idx === -1) {
        return interaction.reply({
          content: "❌ That username isn't registered on your OlgaID.",
          ephemeral: true
        });
      }

      accounts.splice(idx, 1);
      data.users[userId] = accounts;

      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      await updateOlgaIdStatsEmbed(client, data);

      return interaction.reply({
        content: `✔ Deleted Olga account \`${username}\`.`,
        ephemeral: true
      });
    }

    // ─────────────────────────────────────────────
    // CONFESSION SYSTEM (unchanged)
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

// helper to rebuild OlgaID stats embed
async function updateOlgaIdStatsEmbed(client, data) {
  if (!data.statsMessageId || !data.statsChannelId) return;

  const channel = await client.channels.fetch(data.statsChannelId).catch(() => null);
  if (!channel) return;

  const msg = await channel.messages.fetch(data.statsMessageId).catch(() => null);
  if (!msg) return;

  let desc = "";

  for (const userId of Object.keys(data.users)) {
    const accounts = data.users[userId];
    if (!accounts.length) continue;

    desc += `<@${userId}>\n`;
    desc += `olga accounts: ${accounts.join(", ")}\n\n`;
  }

  if (!desc) {
    desc = "No bitch has any Olga accounts yet.";
  }

  const embed = new EmbedBuilder()
    .setTitle("- ̥۪͙۪˚┊❛ OlgaID stats❜┊˚ ̥۪͙۪◌ ")
    .setDescription(desc)
    .setColor("#0A5CFF")
    .setImage("https://cdn.discordapp.com/attachments/1212370536416677949/1558810439494934598/bcedd98b-718d-441b-acb5-6594952e26eb.png")
    .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" });

  await msg.edit({ embeds: [embed] });
}
