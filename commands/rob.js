const { SlashCommandBuilder } = require("discord.js");
const eco = require("../utils/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("rob")
    .setDescription("Try to rob another member's wallet.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("Member to rob")
        .setRequired(true)
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("user");

    if (target.bot || target.id === interaction.user.id) {
      return interaction.reply({
        content: "You can't rob yourself or a bot, bitch.",
        ephemeral: true
      });
    }

    const data = eco.loadData();
    const robber = eco.getUser(data, interaction.guildId, interaction.user.id);
    const victim = eco.getUser(data, interaction.guildId, target.id);

    const remaining = eco.cooldown(
      data, interaction.guildId, interaction.user.id, "rob", 300_000
    );

    if (remaining) {
      eco.saveData(data);
      return interaction.reply({
        content: `You need to lay low for ${remaining} seconds.`,
        ephemeral: true
      });
    }

    if (victim.wallet < 1) {
      eco.saveData(data);
      return interaction.reply({
        content: `${target} has no wallet money to steal.`,
        ephemeral: true
      });
    }

    if (Math.random() < 0.70) {
      const maxSteal = Math.floor(victim.wallet * 0.30);

      if (maxSteal < 1) {
        eco.saveData(data);
        return interaction.reply({
          content: `${target} doesn't have enough wallet money to rob.`,
          ephemeral: true
        });
      }

      const amount = Math.floor(Math.random() * maxSteal) + 1;

      victim.wallet -= amount;
      victim.stolen += amount;
      robber.wallet += amount;
      robber.earned += amount;

      return eco.finish(
        interaction, data,
        `You successfully robbed ${target} and stole **${eco.money(amount)}**!`,
        "🦹 Robbery successful"
      );
    }

    const fine = Math.min(
      robber.wallet,
      Math.max(1, Math.floor(Math.random() * 250) + 25)
    );

    robber.wallet -= fine;
    robber.lost += fine;
    victim.wallet += fine;

    return eco.finish(
      interaction, data,
      `You tried to rob ${target}, but bitch caught you and you had to pay **${eco.money(fine)}**!`,
      "🚨 Robbery failed"
    );
  }
};