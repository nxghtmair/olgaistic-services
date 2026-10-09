const { EmbedBuilder } = require("discord.js");
const { load } = require("./chatTracker");

const WEEKLY_IMAGE = "https://cdn.discordapp.com/attachments/1523777042414571682/1523777584867840030/Snimek_obrazovky_2025-07-09_225314.png?ex=6ac9edb6&is=6ac89c36&hm=175ca4bfe6a4ae405f9f305b9241b3eb6cc72ba8ea310bb2d07d7466c4c598c0&";
const OVERALL_IMAGE = "https://cdn.discordapp.com/attachments/1523777042414571682/1523777421931839499/Snimek_obrazovky_2025-07-09_165432.png?ex=6ac9ed8f&is=6ac89c0f&hm=b99982ddfc16835479656d521162f402c26da11e2ae3ad6ec3dd730e0b97adb0&";

module.exports = function buildLeaderboards(client) {
  const data = load();

  // weekly sorted
  const weeklySorted = Object.entries(data.weekly)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count], i) => `${i + 1}. <@${id}> — **${count} chats**`);

  // overall sorted
  const overallSorted = Object.entries(data.overall)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count], i) => `${i + 1}. <@${id}> — **${count} chats**`);

  const weeklyEmbed = new EmbedBuilder()
    .setTitle("⇢ ˗ˏˋ 🗨️ Weekly leaderboard࿐ྂ")
    .setDescription(weeklySorted.join("\n") || "No chats yet.")
    .setImage(WEEKLY_IMAGE)
    .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
    .addFields({
      name: "Week",
      value: `**${data.weekNumber}**`,
      inline: false
    })
    .setColor("#8B0000");

  const overallEmbed = new EmbedBuilder()
    .setTitle("≡;- ꒰ °🗨️Overall leaderboard꒱")
    .setDescription(overallSorted.join("\n") || "No chats yet.")
    .setImage(OVERALL_IMAGE)
    .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
    .addFields({
      name: "Week",
      value: `**${data.weekNumber}**`,
      inline: false
    })
    .setColor("#8B0000");

  return { weeklyEmbed, overallEmbed };
};
