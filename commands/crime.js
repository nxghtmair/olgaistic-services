const { SlashCommandBuilder } = require("discord.js");
const eco = require("../utils/economy");

const crimes = [
  "you successfully robbed a grandma on the phone",
  "you stole a suspiciously expensive handbag",
  "you raided a rich person's cookie jar",
  "you stole a delivery van full of snacks",
  "you ran an illegal lemonade stand",
  "you stole the neighborhood's garden gnomes",
  "you hacked a vending machine",
  "you stole a golden toilet seat",
  "you robbed a luxury chocolate store",
  "you stole a suspicious briefcase",
  "you smuggled premium cheese",
  "you stole an entire crate of energy drinks"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("crime")
    .setDescription("Commit a crime for a chance to earn Turds."),

  async execute(interaction) {
    const data = eco.loadData();
    const user = eco.getUser(data, interaction.guildId, interaction.user.id);

    const remaining = eco.cooldown(
      data, interaction.guildId, interaction.user.id, "crime", 120_000
    );

    if (remaining) {
      eco.saveData(data);
      return interaction.reply({
        content: `bitch, the heat is still on! Wait ${remaining} seconds.`,
        ephemeral: true
      });
    }

    if (Math.random() < 0.30) {
      const fine = Math.min(
        user.wallet,
        Math.floor(Math.random() * 451) + 50
      );

      user.wallet -= fine;
      user.fines += fine;

      return eco.finish(
        interaction, data,
        `you're a dumb bitch and you were caught, you got a **${eco.money(fine)}** fine!`,
        "🚨 Crime failed"
      );
    }

    const amount = Math.floor(Math.random() * 451) + 250;
    const crime = crimes[Math.floor(Math.random() * crimes.length)];

    user.wallet += amount;
    user.earned += amount;

    return eco.finish(
      interaction, data,
      `${crime}, and got **${eco.money(amount)}**!`,
      "🤑 Crime successful"
    );
  }
};