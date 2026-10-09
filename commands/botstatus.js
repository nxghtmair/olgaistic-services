const { SlashCommandBuilder, ActivityType } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botstatus")
    .setDescription("change bot status")
    .addSubcommand(sub =>
      sub
        .setName("set")
        .setDescription("set bot status")
        .addStringOption(opt =>
          opt
            .setName("state")
            .setDescription("online / idle / dnd")
            .setRequired(true)
            .addChoices(
              { name: "online", value: "online" },
              { name: "idle", value: "idle" },
              { name: "dnd", value: "dnd" }
            )
        )
        .addStringOption(opt =>
          opt
            .setName("activity")
            .setDescription("what should the bot be saying")
            .setRequired(true)
        )
    ),

  async execute(interaction, client) {
    if (interaction.user.id !== "1193517948401373257") {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true
      });
    }

    const state = interaction.options.getString("state");
    const activity = interaction.options.getString("activity");

    client.user.setStatus(state);
    client.user.setActivity(activity, { type: ActivityType.Playing });

    await interaction.reply({
      content: "Bot status updated.",
      ephemeral: true
    });
  }
};
