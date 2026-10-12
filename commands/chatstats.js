// commands/chatstats.js
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ComponentType,
  ButtonStyle
} = require("discord.js");
const {
  loadData,
  getUserData,
  getLevelForXp,
  getNextLevel
} = require("../utils/chatXP");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chatstats")
    .setDescription("Show chat stats of a user")
    .addUserOption(opt =>
      opt
        .setName("user")
        .setDescription("User whose stats you want to see")
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user");
    const guildMember = interaction.guild.members.cache.get(target.id);
    const nick = guildMember?.nickname || target.username;

    const data = loadData();
    const stats = getUserData(data, target.id);

    const currentLevel = getLevelForXp(stats.xp);
    const nextLevel = getNextLevel(stats.xp);
    const xpToNext = nextLevel ? nextLevel.xp - stats.xp : 0;

    const embed = new EmbedBuilder()
      .setTitle("↳˳;; ❝ your progress ᵕ̈೫˚∗ ")
      .setColor("#0A5CFF")
      .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
      .setThumbnail(target.displayAvatarURL({ dynamic: true }))
      .setImage(
        "https://cdn.discordapp.com/attachments/1212370536416677949/1559205924869120000/ae7fdb06-9a57-4795-90a8-a0c58864bd6a.png"
      )
      .setDescription(
        [
          `**User:** ${nick}`,
          `**XP:** ${stats.xp}`,
          `**Messages:** ${stats.messages}`,
          `**Current level:** ${currentLevel.name}`,
          nextLevel
            ? `**XP left until next level (${nextLevel.name}):** ${xpToNext}`
            : `**You are at the highest level, bitch.**`
        ].join("\n")
      );

    const comp = {
      type: ComponentType.ActionRow,
      components: [
        {
          type: ComponentType.Button,
          style: ButtonStyle.Secondary,
          label: `↳ *${nick}'s card* ༉‧₊˚✧`,
          custom_id: "chatstats_display",
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
