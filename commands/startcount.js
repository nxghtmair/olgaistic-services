const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");

const statePath = "./countState.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("startcount")
    .setDescription("Start counting from a number")
    .addIntegerOption(option =>
      option
        .setName("number")
        .setDescription("Starting number")
        .setRequired(true)
    ),

  async execute(interaction) {

    const number =
      interaction.options.getInteger(
        "number"
      );

    fs.writeFileSync(
      statePath,
      JSON.stringify(
        {
          lastNumber: number - 1,
          lastUserId: null
        },
        null,
        2
      )
    );

    await interaction.reply({
      content:
        `✅ Counting starts at ${number}`,
      ephemeral: true
    });
  }
};