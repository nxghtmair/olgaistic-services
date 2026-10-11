// commands/olgaid.js
const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder,
  ComponentType,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");
const Jimp = require("jimp");

const STATS_ROLE_ID = "1558060373972746300";
const DATA_PATH = "./olgaIdData.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("olgaid")
    .setDescription("OlgaID system")
    .addSubcommand(sub =>
      sub
        .setName("account_add")
        .setDescription("Add an Olga account to your OlgaID")
    )
    .addSubcommand(sub =>
      sub
        .setName("account_delete")
        .setDescription("Delete an Olga account from your OlgaID")
    )
    .addSubcommand(sub =>
      sub
        .setName("show")
        .setDescription("Show someone's OlgaID card")
        .addUserOption(opt =>
          opt
            .setName("user")
            .setDescription("User whose OlgaID you want to see")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("stats")
        .setDescription("Show OlgaID stats (admins only)")
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    // Ensure data file exists
    if (!fs.existsSync(DATA_PATH)) {
      fs.writeFileSync(
        DATA_PATH,
        JSON.stringify({ users: {}, statsMessageId: null, statsChannelId: null }, null, 2)
      );
    }

    const data = JSON.parse(fs.readFileSync(DATA_PATH));

    // ─────────────────────────────────────────────
    // /olgaid account_add
    // ─────────────────────────────────────────────
    if (sub === "account_add") {
      const modal = new ModalBuilder()
        .setCustomId("olgaid_add_modal")
        .setTitle("Add Olga Account");

      const usernameField = new TextInputBuilder()
        .setCustomId("olgaid_username")
        .setLabel("Olga account username")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(usernameField));

      return interaction.showModal(modal);
    }

    // ─────────────────────────────────────────────
    // /olgaid account_delete
    // ─────────────────────────────────────────────
    if (sub === "account_delete") {
      const userId = interaction.user.id;
      const accounts = data.users?.[userId] || [];

      if (!accounts.length) {
        return interaction.reply({
          content: "❌ You don't have any Olga accounts registered.",
          ephemeral: true
        });
      }

      const modal = new ModalBuilder()
        .setCustomId("olgaid_delete_modal")
        .setTitle("Delete Olga Account");

      const deleteField = new TextInputBuilder()
        .setCustomId("olgaid_delete_username")
        .setLabel("Type the username to delete")
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder(accounts.join(", "));

      modal.addComponents(new ActionRowBuilder().addComponents(deleteField));

      return interaction.showModal(modal);
    }

    // ─────────────────────────────────────────────
    // /olgaid show  (FULL RESPONSIVE TEXT RENDERER)
    // ─────────────────────────────────────────────
    if (sub === "show") {
      await interaction.deferReply();

      const target = interaction.options.getUser("user");
      const userId = target.id;
      const accounts = data.users?.[userId] || [];

      if (!accounts.length) {
        return interaction.editReply({
          content: "❌ This bitch has no Olga accounts registered."
        });
      }

      const nickname =
        interaction.guild.members.cache.get(userId)?.nickname ||
        target.username;

      // Load template
      const template = await Jimp.read("./assets/olgaid_template.png");

      // Placeholder box
      const boxX = 150;
      const boxY = 200;
      const boxW = 800;
      const boxH = 500;

      // Start with large font
      let fontSize = 64;

      const loadFont = async size => {
        if (size >= 64) return await Jimp.loadFont(Jimp.FONT_SANS_64_BLACK);
        if (size >= 32) return await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
        return await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
      };

      let font = await loadFont(fontSize);
      let lineHeight = fontSize + 10;

      // Shrink font until everything fits
      while (true) {
        let fits = true;

        // Vertical overflow check
        if (accounts.length * lineHeight > boxH) fits = false;

        // Horizontal overflow check
        for (const username of accounts) {
          const width = Jimp.measureText(font, username);
          if (width > boxW - 20) {
            fits = false;
            break;
          }
        }

        if (fits) break;

        fontSize -= 4;
        if (fontSize < 16) break;

        font = await loadFont(fontSize);
        lineHeight = fontSize + 10;
      }

      // Print usernames line-by-line
      let currentY = boxY;

      for (const username of accounts) {
        if (currentY + lineHeight > boxY + boxH) break;

        template.print(
          font,
          boxX,
          currentY,
          {
            text: username,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_TOP
          },
          boxW,
          lineHeight
        );

        currentY += lineHeight;
      }

      const outPath = `./assets/olgaid_${userId}.png`;
      await template.writeAsync(outPath);

      const embed = new EmbedBuilder()
        .setColor("#0A5CFF")
        .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
        .setImage("attachment://olgaid_card.png");

      const comp = {
        type: ComponentType.ActionRow,
        components: [
          {
            type: ComponentType.Button,
            style: ButtonStyle.Secondary,
            label: `↳˳;; ❝ This card belongs to: ${nickname} ᵕ̈೫˚∗`,
            custom_id: "olgaid_display",
            disabled: true
          }
        ]
      };

      return interaction.editReply({
        embeds: [embed],
        components: [comp],
        files: [
          {
            attachment: outPath,
            name: "olgaid_card.png"
          }
        ]
      });
    }

    // ─────────────────────────────────────────────
    // /olgaid stats
    // ─────────────────────────────────────────────
    if (sub === "stats") {
      if (!interaction.member.roles.cache.has(STATS_ROLE_ID)) {
        return interaction.reply({
          content: "❌ You don't have enough perms, bitch.",
          ephemeral: true
        });
      }

      await interaction.deferReply();

      let desc = "";

      for (const uid of Object.keys(data.users)) {
        const accounts = data.users[uid];
        if (!accounts.length) continue;

        desc += `<@${uid}>\n`;
        desc += `olga accounts: ${accounts.join(", ")}\n\n`;
      }

      if (!desc) desc = "No bitch has any Olga accounts yet.";

      const embed = new EmbedBuilder()
        .setTitle("- ̥۪͙۪˚┊❛ OlgaID stats❜┊˚ ̥۪͙۪◌ ")
        .setDescription(desc)
        .setColor("#0A5CFF")
        .setImage(
          "https://cdn.discordapp.com/attachments/1212370536416677949/1558810439494934598/bcedd98b-718d-441b-acb5-6594952e26eb.png"
        )
        .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" });

      const sent = await interaction.editReply({
        embeds: [embed],
        ephemeral: false
      });

      data.statsMessageId = sent.id;
      data.statsChannelId = sent.channel.id;
      fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

      return;
    }
  }
};
