// commands/warnlogs.js
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
    .setName("warnlogs")
    .setDescription("Show warn logs of a user")
    .addUserOption(opt =>
      opt
        .setName("user")
        .setDescription("User whose warn logs you want to see")
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const guildMember = interaction.guild.members.cache.get(target.id);
    const targetNick =
      guildMember?.nickname || target.username;

    if (!fs.existsSync(WARN_PATH)) {
      return interaction.reply({
        content: "❌ No warn logs exist yet.",
        ephemeral: true
      });
    }

    const data = JSON.parse(fs.readFileSync(WARN_PATH));
    const logs = data.users?.[target.id] || [];

    if (!logs.length) {
      return interaction.reply({
        content: `❌ ${targetNick} has no warn logs.`,
        ephemeral: true
      });
    }

    let desc = "";
    for (const log of logs) {
      const date = new Date(log.timestamp).toLocaleString();
      desc += `**Reason:** ${log.reason}\n`;
      desc += `**Warned by:** ${log.executor}\n`;
      desc += `**Date:** ${date}\n\n`;
    }

    const embed = new EmbedBuilder()
      .setTitle("↳ *Warn Logs* ༉‧₊˚✧")
      .setDescription(desc)
      .setColor("#0A5CFF")
      .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" });

    const comp = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          style: ButtonStyle.Secondary,
          label: `↳ ${targetNick}'s warnlogs ༉‧₊`,
          custom_id: "warnlogs_display",
          disabled: true
        }
      ]
    };

    return interaction.reply({
      embeds: [embed],
      components: [comp],
      ephemeral: false
    });
  }
};
