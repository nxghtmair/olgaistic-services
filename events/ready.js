module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}`);

    client.user.setPresence({
      activities: [{ name: "🎃👻Olgafy: The new era of Olgas" }],
      status: "online"
    });

    // REGISTER SLASH COMMANDS
    await client.application.commands.set(
      client.commands.map(cmd => cmd.data)
    );

    console.log("Slash commands registered");
  }
};
