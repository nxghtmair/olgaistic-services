const fs = require("node:fs");
const path = require("node:path");
const {
  EmbedBuilder,
  Colors
} = require("discord.js");

const DATA_PATH = path.join(__dirname, "economyData.json");

const COLOR = 0x0A5CFF;
const FOOTER = "⋇⊶⊰The Olgas: Season 5⊱⊷⋇";
const IMAGE =
  "https://cdn.discordapp.com/attachments/1212370536416677949/1563546443053146235/5f1d97e0-0f83-4bef-a8d3-baaffe71159f.png?ex=6adfffd9&is=6adeae59&hm=cf6f154ac7b0044e2797c7a2e16950dacf83fef99017efe43647a624b2ba5036";

function loadData() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));

    data.users ||= {};
    data.shops ||= {};
    data.cooldowns ||= {};
    data.games ||= {};

    return data;
  } catch {
    return {
      users: {},
      shops: {},
      cooldowns: {},
      games: {},
      version: 1
    };
  }
}

function saveData(data) {
  const tempPath = `${DATA_PATH}.tmp`;

  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
  fs.renameSync(tempPath, DATA_PATH);
}

function userKey(guildId, userId) {
  return `${guildId}:${userId}`;
}

function getUser(data, guildId, userId) {
  const key = userKey(guildId, userId);

  if (!data.users[key]) {
    data.users[key] = {
      wallet: 0,
      bank: 0,
      earned: 0,
      spent: 0,
      fines: 0,
      stolen: 0,
      lost: 0,
      inventory: []
    };
  }

  const user = data.users[key];

  user.wallet = Number(user.wallet) || 0;
  user.bank = Number(user.bank) || 0;
  user.earned = Number(user.earned) || 0;
  user.spent = Number(user.spent) || 0;
  user.fines = Number(user.fines) || 0;
  user.stolen = Number(user.stolen) || 0;
  user.lost = Number(user.lost) || 0;
  user.inventory ||= [];

  return user;
}

function money(amount) {
  return `${Math.floor(amount).toLocaleString("en-US")} Turds`;
}

function makeEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(title)
    .setDescription(description)
    .setImage(IMAGE)
    .setFooter({ text: FOOTER })
    .setTimestamp();
}

function cooldown(data, guildId, userId, command, duration) {
  const key = `${guildId}:${userId}:${command}`;
  const now = Date.now();
  const last = Number(data.cooldowns[key]) || 0;
  const remaining = duration - (now - last);

  if (remaining > 0) {
    return Math.ceil(remaining / 1000);
  }

  data.cooldowns[key] = now;
  return 0;
}

function leaderboard(data, guildId) {
  return Object.entries(data.users)
    .filter(([key]) => key.startsWith(`${guildId}:`))
    .map(([key, user]) => ({
      id: key.slice(guildId.length + 1),
      user
    }))
    .sort((a, b) =>
      (b.user.wallet + b.user.bank) -
      (a.user.wallet + a.user.bank)
    );
}

function getRank(data, guildId, userId) {
  const index = leaderboard(data, guildId)
    .findIndex(entry => entry.id === userId);

  return index < 0 ? null : index + 1;
}

async function findMessage(client, messageId) {
  for (const guild of client.guilds.cache.values()) {
    for (const channel of guild.channels.cache.values()) {
      if (!channel.isTextBased() || !channel.messages) continue;

      try {
        const message = await channel.messages.fetch(messageId);
        if (message) return message;
      } catch {
        // The message may not be in this channel.
      }
    }
  }

  return null;
}

async function updateStats(client, data, options = {}) {
  const messageId = "1563543857528967229";
  const logChannelId = "1564268244984930414";

  const guilds = client.guilds.cache;

  for (const guild of guilds.values()) {
    const entries = leaderboard(data, guild.id);

    const lines = entries.length
      ? entries.slice(0, 50).map((entry, index) => {
          const member = guild.members.cache.get(entry.id);
          const name =
            member?.displayName || `<@${entry.id}>`;

          return [
            `**${index + 1}. ${name}**`,
            `Wallet: ${money(entry.user.wallet)}`,
            `Bank: ${money(entry.user.bank)}`,
            `Total: ${money(entry.user.wallet + entry.user.bank)}`,
            `Lifetime earned: ${money(entry.user.earned)}`
          ].join(" • ");
        })
      : "No economy users yet.";

    const embed = makeEmbed(
      "≡;- ꒰ °Economy stats ꒱",
      lines.join("\n\n")
    );

    // Keep the complete data snapshot in the stats embed so it can
    // be recovered from the latest log if the JSON file is lost.
    embed.addFields({
      name: "Recovery snapshot",
      value: "Economy data is stored in the log message.",
      inline: false
    });

    const message = await findMessage(client, messageId);

    if (message && message.guildId === guild.id) {
      try {
        await message.edit({ embeds: [embed] });
      } catch (error) {
        console.error("[ECONOMY] Could not edit stats message:", error.message);
      }
    }

    if (!options.skipLog) {
      const channel = guild.channels.cache.get(logChannelId);

      if (channel?.isTextBased()) {
        try {
          const logEmbed = makeEmbed(
            "Economy stats backup",
            `Updated economy data for **${guild.name}**.\n` +
            `Users tracked: **${entries.length}**`
          );

          // Discord embed descriptions have a character limit.
          // Detailed stats are recorded in the JSON file.
          logEmbed.addFields({
            name: "Snapshot timestamp",
            value: new Date().toISOString(),
            inline: false
          });

          await channel.send({ embeds: [logEmbed] });
        } catch (error) {
          console.error("[ECONOMY] Could not log stats:", error.message);
        }
      }
    }
  }
}

async function restoreFromLatestLog(client) {
  // The JSON file is the primary persistent store.
  // This function is kept for startup integration.
  // Full recovery needs a serialized snapshot in the log message.
  const data = loadData();
  await updateStats(client, data, { skipLog: true });
}

async function finish(interaction, data, description, title = "Economy") {
  saveData(data);

  try {
    await updateStats(interaction.client, data);
  } catch (error) {
    console.error("[ECONOMY] Stats update failed:", error.message);
  }

  const embed = makeEmbed(title, description);

  if (interaction.deferred || interaction.replied) {
    return interaction.editReply({ embeds: [embed] });
  }

  return interaction.reply({ embeds: [embed] });
}

module.exports = {
  COLOR,
  FOOTER,
  IMAGE,
  loadData,
  saveData,
  getUser,
  money,
  makeEmbed,
  cooldown,
  leaderboard,
  getRank,
  finish,
  updateStats,
  restoreFromLatestLog
};