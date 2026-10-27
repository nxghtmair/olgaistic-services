const { SlashCommandBuilder } = require("discord.js");
const eco = require("../utils/economy");

const jobs = [
  "you cleaned the public restrooms",
  "you washed Olga's car",
  "you delivered groceries to a grandma",
  "you cleaned the nightclub",
  "you walked twelve dogs",
  "you sorted a mountain of laundry",
  "you worked at the Turds factory",
  "you cleaned spilled drinks at the bar",
  "you helped a neighbor move furniture",
  "you sold questionable lemonade",
  "you rescued a cat from a tree",
  "you worked the night shift at the hotel"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("work")
    .setDescription("Work to earn Turds."),

  async execute(interaction) {
    const data = eco.loadData();
    const user = eco.getUser(data, interaction.guildId, interaction.user.id);

    const remaining = eco.cooldown(
      data, interaction.guildId, interaction.user.id, "work", 10_000
    );

    if (remaining) {
      eco.saveData(data);
      return interaction.reply({
        content: "u only just finished working bitch, rest for 10 secs!",
        ephemeral: true
      });
    }

    const amount = Math.floor(Math.random() * 236) + 15;
    const job = jobs[Math.floor(Math.random() * jobs.length)];

    user.wallet += amount;
    user.earned += amount;

    return eco.finish(
      interaction, data,
      `${job} for **${eco.money(amount)}**!`,
      "💼 Work complete"
    );
  }
};