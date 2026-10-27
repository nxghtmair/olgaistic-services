const fs = require("node:fs");
const path = require("node:path");
const {
  EmbedBuilder,
  AttachmentBuilder
} = require("discord.js");

const DATA_PATH = path.join(__dirname, "economyData.json");

const COLOR = 0x0A5CFF;
const FOOTER = "⋇⊶⊰The Olgas: Season 5⊱⊷⋇";
const IMAGE =
  "https://cdn.discordapp.com/attachments/1212370536416677949/1563546443053146235/5f1d97e0-0f83-4bef-a8d3-baaffe71159f.png?ex=6adfffd9&is=6adeae59&hm=cf6f154ac7b0044e2797c7a2e16950dacf83fef99017efe43647a624b2ba5036";

const STATS_MESSAGE_ID = "1563543857528967229";
const LOG_CHANNEL_ID = "1564268244984930414";
const BACKUP_FILENAME = "olgafy-economy-backup.json";
const BACKUP_FORMAT = "olgafy-economy-backup-v1";

function emptyData() {
  return {
    users: {},
    shops: {},
    cooldowns: {},
    games: {},
    version: 1
  };
}

function normalizeData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Invalid economy data.");
  }

  data.users ||= {};
  data.shops ||= {};
  data.cooldowns ||= {};
  data.games ||= {};
  data.version ||= 1;

  return data;
}

function loadData() {
  try {
    return normalizeData(
      JSON.parse(fs.readFileSync(DATA_PATH, "utf8"))
    );
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(
        "[ECONOMY] Could not load local data:",
        error.message
      );
    }

    return emptyData();
  }
}

function saveData(data) {
  normalizeData(data);

  const tempPath = `${DATA_PATH}.tmp`;

  fs.writeFileSync(
    tempPath,
    JSON.stringify(data, null, 2),
    "utf8"
  );

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

  if (!Array.isArray(user.inventory)) {
    user.inventory = [];
  }

  return user;
}

function money(amount) {
  return `${Math.floor(Number(amount) || 0).toLocaleString("en-US")} Turds`;
}

function makeEmbed(title, description) {
  return new EmbedBuilder()
    .setColor(COLOR)
    .setTitle(title)
    .setDescription(String(description).slice(0, 4000))
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
      (
        (Number(b.user.wallet) || 0) +
        (Number(b.user.bank) || 0)
      ) -
      (
        (Number(a.user.wallet) || 0) +
        (Number(a.user.bank) || 0)
      )
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
        // Message is not accessible in this channel.
      }
    }
  }

  return null;
}

async function getLogChannel(client) {
  return (
    client.channels.cache.get(LOG_CHANNEL_ID) ||
    await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null)
  );
}

function makeUserLines(entries, guild) {
  return entries.map((entry, index) => {
    const user = entry.user;
    const member = guild.members.cache.get(entry.id);
    const name = member?.displayName || `<@${entry.id}>`;

    return [
      `**${index + 1}. ${name}**`,
      `Wallet: ${money(user.wallet)}`,
      `Bank: ${money(user.bank)}`,
      `Total: ${money((Number(user.wallet) || 0) + (Number(user.bank) || 0))}`,
      `Earned: ${money(user.earned)}`,
      `Spent: ${money(user.spent)}`,
      `Fines: ${money(user.fines)}`,
      `Stolen: ${money(user.stolen)}`,
      `Lost: ${money(user.lost)}`,
      `Items: ${Array.isArray(user.inventory) ? user.inventory.length : 0}`
    ].join(" • ");
  });
}

function buildStatsDescription(entries, guild) {
  if (!entries.length) {
    return "No economy users yet.";
  }

  const lines = makeUserLines(entries, guild);
  const result = [];
  let length = 0;

  for (const line of lines) {
    const addition = (result.length ? 2 : 0) + line.length;

    if (length + addition > 3800) {
      result.push(
        `…and ${lines.length - result.length} more users. Full data is attached to the backup log.`
      );
      break;
    }

    result.push(line);
    length += addition;
  }

  return result.join("\n\n");
}

function createSnapshot(data) {
  return {
    format: BACKUP_FORMAT,
    createdAt: new Date().toISOString(),
    data: normalizeData(data)
  };
}

async function writeBackup(client, data, guild, entries) {
  const channel = await getLogChannel(client);

  if (!channel?.isTextBased() || !channel.messages) {
    throw new Error(
      `Backup channel ${LOG_CHANNEL_ID} is unavailable or not a text channel.`
    );
  }

  const snapshot = createSnapshot(data);

  const attachment = new AttachmentBuilder(
    Buffer.from(JSON.stringify(snapshot, null, 2), "utf8"),
    { name: BACKUP_FILENAME }
  );

  const description = buildStatsDescription(entries, guild);

  const embed = makeEmbed(
    "Economy stats backup",
    [
      `**Server:** ${guild.name}`,
      `**Users tracked:** ${entries.length}`,
      `**Snapshot:** ${snapshot.createdAt}`,
      "",
      description
    ].join("\n")
  );

  embed.addFields({
    name: "Recovery",
    value: "The attached JSON file contains the complete economy snapshot, including user data, inventories, shops, cooldowns and games.",
    inline: false
  });

  await channel.send({
    embeds: [embed],
    files: [attachment]
  });

  console.log(
    `[ECONOMY] Backup saved to Discord for ${guild.name}.`
  );
}

async function updateStats(client, data, options = {}) {
  normalizeData(data);

  for (const guild of client.guilds.cache.values()) {
    const entries = leaderboard(data, guild.id);

    const embed = makeEmbed(
      "≡;- ꒰ °Economy stats ꒱",
      buildStatsDescription(entries, guild)
    );

    try {
      const message = await findMessage(
        client,
        STATS_MESSAGE_ID
      );

      if (message && message.guildId === guild.id) {
        await message.edit({ embeds: [embed] });
      } else {
        console.warn(
          `[ECONOMY] Stats message ${STATS_MESSAGE_ID} was not found in ${guild.name}.`
        );
      }
    } catch (error) {
      console.error(
        "[ECONOMY] Could not update stats message:",
        error.message
      );
    }

    if (!options.skipLog) {
      try {
        await writeBackup(client, data, guild, entries);
      } catch (error) {
        console.error(
          "[ECONOMY] Could not save Discord backup:",
          error.message
        );
      }
    }
  }
}

async function restoreFromLatestLog(client) {
  const channel = await getLogChannel(client);

  if (!channel?.isTextBased() || !channel.messages) {
    console.warn(
      "[ECONOMY] Backup channel unavailable; using local data."
    );
    return false;
  }

  try {
    const messages = await channel.messages.fetch({
      limit: 100
    });

    const backupMessages = [...messages.values()]
      .filter(message =>
        message.author.id === client.user.id &&
        message.attachments.some(
          attachment => attachment.name === BACKUP_FILENAME
        )
      )
      .sort((a, b) => b.createdTimestamp - a.createdTimestamp);

    for (const message of backupMessages) {
      const attachment = message.attachments.find(
        file => file.name === BACKUP_FILENAME
      );

      try {
        const response = await fetch(attachment.url);

        if (!response.ok) {
          throw new Error(
            `Download failed with HTTP ${response.status}`
          );
        }

        const snapshot = await response.json();

        if (
          snapshot.format !== BACKUP_FORMAT ||
          !snapshot.data ||
          typeof snapshot.data.users !== "object"
        ) {
          throw new Error("Invalid economy backup format.");
        }

        const restoredData = normalizeData(snapshot.data);

        saveData(restoredData);

        console.log(
          `[ECONOMY] Restored economy from Discord backup created ${snapshot.createdAt || "at an unknown time"}.`
        );

        return true;
      } catch (error) {
        console.error(
          "[ECONOMY] Backup could not be restored:",
          error.message
        );
      }
    }

    console.warn(
      "[ECONOMY] No valid Discord backup found; using local economy data."
    );

    // Create an initial backup if the channel has no usable backup.
    const data = loadData();

    if (client.guilds.cache.size > 0) {
      const guild = client.guilds.cache.first();

      await writeBackup(
        client,
        data,
        guild,
        leaderboard(data, guild.id)
      );
    }

    return false;
  } catch (error) {
    console.error(
      "[ECONOMY] Could not read Discord backups:",
      error.message
    );

    return false;
  }
}

async function finish(
  interaction,
  data,
  description,
  title = "Economy"
) {
  // Save locally first, then update the stats and Discord backup.
  saveData(data);

  try {
    await updateStats(interaction.client, data);
  } catch (error) {
    console.error(
      "[ECONOMY] Stats update failed:",
      error.message
    );
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