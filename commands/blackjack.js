const {
  SlashCommandBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags
} = require("discord.js");

const eco = require("../utils/economy");

function drawCard() {
  const ranks = [
    "A", "2", "3", "4", "5", "6", "7",
    "8", "9", "10", "J", "Q", "K"
  ];

  return ranks[Math.floor(Math.random() * ranks.length)];
}

function handValue(hand) {
  let total = 0;
  let aces = 0;

  for (const card of hand) {
    if (card === "A") {
      total += 11;
      aces++;
    } else if (["K", "Q", "J"].includes(card)) {
      total += 10;
    } else {
      total += Number(card);
    }
  }

  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }

  return total;
}

function buildGame(game, ended = false) {
  const container = new ContainerBuilder()
    .setAccentColor(eco.COLOR)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        [
          "# ♠️ Blackjack",
          `**Your hand:** ${game.player.join(" · ")} — **${handValue(game.player)}**`,
          `**Dealer:** ${ended ? game.dealer.join(" · ") : `${game.dealer[0]} · 🂠`}`,
          `**Wager:** ${eco.money(game.amount)}`,
          "",
          ended ? `**${game.result}**` : "Choose **Hit** or **Stand**."
        ].join("\n")
      )
    );

  if (!ended) {
    container.addActionRowComponents(
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`bj_hit_${game.owner}`)
          .setLabel("Hit")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId(`bj_stand_${game.owner}`)
          .setLabel("Stand")
          .setStyle(ButtonStyle.Secondary)
      )
    );
  }

  return container;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blackjack")
    .setDescription("Play blackjack using wallet Turds.")
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Amount to wager")
        .setMinValue(1)
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");
    const data = eco.loadData();
    const user = eco.getUser(data, interaction.guildId, interaction.user.id);

    const remaining = eco.cooldown(
      data, interaction.guildId, interaction.user.id, "blackjack", 300_000
    );

    if (remaining) {
      eco.saveData(data);
      return interaction.reply({
        content: `Your next blackjack game is available in ${remaining} seconds.`,
        ephemeral: true
      });
    }

    if (user.wallet < amount) {
      return interaction.reply({
        content: `You only have ${eco.money(user.wallet)} in your wallet.`,
        ephemeral: true
      });
    }

    user.wallet -= amount;

    const game = {
      owner: interaction.user.id,
      amount,
      guildId: interaction.guildId,
      player: [drawCard(), drawCard()],
      dealer: [drawCard(), drawCard()],
      result: ""
    };

    eco.saveData(data);

    await interaction.reply({
      components: [buildGame(game)],
      flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });

    const message = await interaction.fetchReply();
    const collector = message.createMessageComponentCollector({
      time: 120_000
    });

    let ended = false;

    async function settle(result, payout = 0) {
      if (ended) return;
      ended = true;

      const latest = eco.loadData();
      const player = eco.getUser(latest, game.guildId, game.owner);

      player.wallet += payout;
      if (payout > 0) {
        player.earned += Math.max(0, payout - game.amount);
      } else {
        player.lost += game.amount;
      }

      game.result = `${result}\nPayout: **${eco.money(payout)}**`;
      eco.saveData(latest);

      await interaction.editReply({
        components: [buildGame(game, true)],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
      }).catch(() => {});

      await eco.updateStats(interaction.client, latest).catch(() => {});
      collector.stop();
    }

    async function dealerTurn() {
      while (handValue(game.dealer) < 17) {
        game.dealer.push(drawCard());
      }

      const playerTotal = handValue(game.player);
      const dealerTotal = handValue(game.dealer);

      if (dealerTotal > 21 || playerTotal > dealerTotal) {
        return settle("You win!", amount * 2);
      }

      if (playerTotal === dealerTotal) {
        return settle("Push — your wager is returned.", amount);
      }

      return settle("You lost!", 0);
    }

    if (handValue(game.player) === 21) {
      return dealerTurn();
    }

    collector.on("collect", async button => {
      if (button.user.id !== game.owner) {
        return button.reply({
          content: "This blackjack game isn't yours.",
          ephemeral: true
        });
      }

      if (ended) {
        return button.reply({
          content: "This game has already ended.",
          ephemeral: true
        });
      }

      await button.deferUpdate();

      if (button.customId.startsWith("bj_hit_")) {
        game.player.push(drawCard());

        if (handValue(game.player) > 21) {
          return settle("Bust! You lost.", 0);
        }

        if (handValue(game.player) === 21) {
          return dealerTurn();
        }

        return interaction.editReply({
          components: [buildGame(game)],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
        });
      }

      if (button.customId.startsWith("bj_stand_")) {
        return dealerTurn();
      }
    });

    collector.on("end", async () => {
      if (!ended) {
        await settle("Game timed out — wager lost.", 0);
      }
    });
  }
};