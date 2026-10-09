module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "error bitch", ephemeral: true });
    }
  }
};
if (interaction.isModalSubmit() && interaction.customId === "embed_create_modal") {
  const title = interaction.fields.getTextInputValue("embed_title");
  const desc = interaction.fields.getTextInputValue("embed_desc");
  const color = interaction.fields.getTextInputValue("embed_color");
  const image = interaction.fields.getTextInputValue("embed_image");
  const thumb = interaction.fields.getTextInputValue("embed_thumb");

  const embed = new EmbedBuilder()
    .setDescription(desc)
    .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" });

  if (title) embed.setTitle(title);
  if (color) embed.setColor(color);
  else embed.setColor("#3498db");
  if (image) embed.setImage(image);
  if (thumb) embed.setThumbnail(thumb);

  await interaction.channel.send({ embeds: [embed] });

  return interaction.reply({
    content: "✔ embed sent",
    ephemeral: true
  });
}

// gbb v 