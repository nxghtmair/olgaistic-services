const { EmbedBuilder } = require("discord.js");
const { load } = require("./chatTracker");

const WEEKLY_IMAGE = "https://cdn.discordapp.com/attachments/1523777042414571682/1530338975548706836/Screenshot_2026-07-12_130606.png?ex=6aca117c&is=6ac8bffc&hm=5dd58c4660653aff2bd8d51169d256ab826f9450491600eca5a0c1f5a3c7ccfe&";
const OVERALL_IMAGE = "https://cdn.discordapp.com/attachments/1523777042414571682/1523777588693041222/Snimek_obrazovky_2025-07-10_201141.png?ex=6ac9edb7&is=6ac89c37&hm=fcacc7fa9de1c40dd7e9b2197d8c045faa3cee410ad85dcfce48359a7fbd031a&";

module.exports = function buildLeaderboards(client) {
  const data = load();

  const weeklySorted = Object.entries(data.weekly)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count], i) => `${i + 1}. <@${id}> — **${count} chats**`);

  const overallSorted = Object.entries(data.overall)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count], i) => `${i + 1}. <@${id}> — **${count} chats**`);

  const weeklyEmbed = new EmbedBuilder()
    .setTitle("⇢ ˗ˏˋ 🗨️ Weekly leaderboard࿐ྂ")
    .setDescription(weeklySorted.join("\n") || "No chats yet.")
    .setImage(WEEKLY_IMAGE)
    .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
    .addFields({ name: "Week", value: `**${data.weekNumber}**` })
    .setColor("#8B0000");

  const overallEmbed = new EmbedBuilder()
    .setTitle("≡;- ꒰ °🗨️Overall leaderboard꒱")
    .setDescription(overallSorted.join("\n") || "No chats yet.")
    .setImage(OVERALL_IMAGE)
    .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
    .addFields({ name: "Week", value: `**${data.weekNumber}**` })
    .setColor("#8B0000");

  return { weeklyEmbed, overallEmbed };
};
