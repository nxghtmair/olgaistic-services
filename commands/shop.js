const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  MessageFlags
} = require("discord.js");

const eco = require("../utils/economy");

const PAGE_SIZE = 10;

function buildShop(items, page) {
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  page = Math.max(0, Math.min(page, pages - 1));

  const shown = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const lines = shown.length
    ? shown.map((item, i) =>
        `**${page * PAGE_SIZE + i + 1}. ${item.name}** — ${eco.money(item.cost)}` +
        (item.roleId ? " • Role included" : "")
      ).join("\n")
    : "The shop is empty. An admin can add items using `/shopadd`.";

  const container = new ContainerBuilder()
    .setAccentColor(eco.COLOR)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ⇢ ˗ˏˋ the shop ࿐ྂ\n\n${lines}\n\n**Page ${page + 1}/${pages}**`
      )
    );

  if (shown.length) {
    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("shop_buy")
          .setPlaceholder("Choose an item to purchase")
          .addOptions(
            shown.map(item => ({
              label: item.name.slice(0, 100),
              description: `${eco.money(item.cost)}${item.roleId ? " • Role included" : ""}`.slice(0, 100),
              value: item.id
            }))
          )
      )
    );
  }

  container.addActionRowComponents(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("shop_prev")
        .setLabel("Previous")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page === 0),
      new ButtonBuilder()
        .setCustomId("shop_next")
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(page >= pages - 1)
    )
  );

  return container;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Browse and purchase items."),

  async execute(interaction) {
    const data = eco.loadData();
    const items = (data.shops[interaction.guildId] || [])
      .slice()
      .sort((a, b) => a.cost - b.cost);

    let page = 0;

    await interaction.reply({
      components: [buildShop(items, page)],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({
      time: 120_000
    });

    collector.on("collect", async component => {
      if (component.user.id !== interaction.user.id) {
        return component.reply({
          content: "This shop menu belongs to the person who opened it.",
          ephemeral: true
        });
      }

      if (component.customId === "shop_prev" ||
          component.customId === "shop_next") {
        page += component.customId === "shop_next" ? 1 : -1;

        const currentData = eco.loadData();
        const currentItems = (currentData.shops[interaction.guildId] || [])
          .slice()
          .sort((a, b) => a.cost - b.cost);

        return component.update({
          components: [buildShop(currentItems, page)]
        });
      }

      if (component.customId === "shop_buy") {
        const currentData = eco.loadData();
        const currentItems = currentData.shops[interaction.guildId] || [];
        const item = currentItems.find(i => i.id === component.values[0]);

        if (!item) {
          return component.reply({
            content: "That item no longer exists. Reopen `/shop`.",
            ephemeral: true
          });
        }

        const buyer = eco.getUser(
          currentData, interaction.guildId, interaction.user.id
        );

        if (buyer.wallet < item.cost) {
          return component.reply({
            content: `You need ${eco.money(item.cost)} in your wallet, but only have ${eco.money(buyer.wallet)}.`,
            ephemeral: true
          });
        }

        if (item.roleId) {
          const role = interaction.guild.roles.cache.get(item.roleId);

          if (!role || !interaction.guild.members.me.permissions.has("ManageRoles") ||
              role.position >= interaction.guild.members.me.roles.highest.position) {
            return component.reply({
              content: "I can't grant the role for this item. Ask an admin to check my Manage Roles permission and role hierarchy.",
              ephemeral: true
            });
          }
        }

        buyer.wallet -= item.cost;
        buyer.spent += item.cost;
        buyer.inventory.push({
          itemId: item.id,
          name: item.name,
          purchasedAt: Date.now()
        });

        eco.saveData(currentData);

        if (item.roleId) {
          try {
            await interaction.guild.members.cache
              .get(interaction.user.id)
              ?.roles.add(item.roleId);
          } catch {
            // Refund if the role grant fails.
            buyer.wallet += item.cost;
            buyer.spent -= item.cost;
            buyer.inventory.pop();
            eco.saveData(currentData);

            return component.reply({
              content: "I couldn't grant that role, so your purchase was cancelled and refunded.",
              ephemeral: true
            });
          }
        }

        await eco.updateStats(interaction.client, currentData).catch(() => {});

        return component.reply({
          content: `You purchased **${item.name}** for ${eco.money(item.cost)}!`,
          ephemeral: true
        });
      }
    });

    collector.on("end", async () => {
      // Disable buttons after the menu expires.
      try {
        const finalData = eco.loadData();
        const finalItems = (finalData.shops[interaction.guildId] || [])
          .slice()
          .sort((a, b) => a.cost - b.cost);

        const container = buildShop(finalItems, page);

        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent("This shop menu has expired. Run `/shop` to open a new one.")
        );

        await interaction.editReply({
          components: [container]
        });
      } catch {}
    });
  }
};