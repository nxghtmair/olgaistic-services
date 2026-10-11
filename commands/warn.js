// commands/warn.js
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ComponentType,
  ButtonStyle
} = require("discord.js");

const fs = require("fs");
const WARN_PATH = "./warnLogs.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a user")
    .addUserOption(opt =>
      opt
        .setName("user")
        .setDescription("User to warn")
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt
        .setName("reason")
        .setDescription("Reason for the warning")
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");

    const guildMember = interaction.guild.members.cache.get(target.id);
    const executorNick =
      interaction.member.nickname || interaction.user.username;
    const targetNick =
      guildMember?.nickname || target.username;

    // Load warn logs
    if (!fs.existsSync(WARN_PATH)) {
      fs.writeFileSync(WARN_PATH, JSON.stringify({ users: {} }, null, 2));
    }

    const data = JSON.parse(fs.readFileSync(WARN_PATH));

    if (!data.users[target.id]) data.users[target.id] = [];

    data.users[target.id].push({
      reason,
      executor: executorNick,
      timestamp: Date.now()
    });

    fs.writeFileSync(WARN_PATH, JSON.stringify(data, null, 2));

    // DM embed to warned user
    const dmEmbed = new EmbedBuilder()
      .setTitle("•·.·''·.·•You disobedient bitch!•·.·''·.·")
      .setDescription(
        `-chews gum- -stares-\nYou've been warned for **${reason}**, what a shame!`
      )
      .setColor("#0A5CFF")
      .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" });

    const dmComp = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          style: ButtonStyle.Secondary,
          label: `-', Sent with hate from: ${executorNick} ꒱ ↷`,
          custom_id: "warn_display",
          disabled: true
        }
      ]
    };

    try {
      await target.send({
        embeds: [dmEmbed],
        components: [dmComp]
      });
    } catch (err) {
      // user has DMs closed
    }

    return interaction.reply({
      content: `✔ Warned **${targetNick}**.`,
      ephemeral: true
    });
  }
};
