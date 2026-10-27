const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const eco = require("../utils/economy");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shopadd")
    .setDescription("Add an item to the economy shop.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName("item")
        .setDescription("Name of the item")
        .setMaxLength(100)
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("cost")
        .setDescription("Price in Turds")
        .setMinValue(1)
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName("role")
        .setDescription("Optional role to grant after purchase")
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: "Only admins can manage the shop.",
        ephemeral: true
      });
    }

    const name = interaction.options.getString("item").trim();
    const cost = interaction.options.getInteger("cost");
    const role = interaction.options.getRole("role");

    if (role && (
      role.id === interaction.guild.id ||
      role.managed ||
      role.position >= interaction.guild.members.me.roles.highest.position
    )) {
      return interaction.reply({
        content: "I can't grant that role. Check the role hierarchy.",
        ephemeral: true
      });
    }

    const data = eco.loadData();
    data.shops[interaction.guildId] ||= [];

    if (data.shops[interaction.guildId].some(
      item => item.name.toLowerCase() === name.toLowerCase()
    )) {
      return interaction.reply({
        content: "An item with that name already exists.",
        ephemeral: true
      });
    }

    data.shops[interaction.guildId].push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      cost,
      roleId: role?.id || null,
      createdBy: interaction.user.id
    });

    data.shops[interaction.guildId].sort((a, b) => a.cost - b.cost);
    eco.saveData(data);

    return interaction.reply({
      embeds: [
        eco.makeEmbed(
          "Shop item added",
          `**Item:** ${name}\n**Cost:** ${eco.money(cost)}\n**Role:** ${role || "None"}`
        )
      ]
    });
  }
};