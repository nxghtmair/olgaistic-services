const fs = require("fs");

const DATA_PATH = "./xpData.json";

const CHAT_CHANNEL_ID = "1513932845922385920";
const LEADERBOARD_CHANNEL_ID = "1555618153231552584";
const OLGA_OF_CHATS_ROLE_ID = "1559138180274585640";
const OLGA_OF_CHATS_ANNOUNCE_CHANNEL_ID = "1517175386021040138";

const LEVELS = [
  { key: "rookie", name: "Rookie Olga", roleId: "1559137733077893202", xp: 0 },
  { key: "known", name: "Known Olga", roleId: "1559137885452763236", xp: 200 },
  { key: "settled", name: "Settled Olga", roleId: "1559137781333237800", xp: 500 },
  { key: "social", name: "Social Olga", roleId: "1559137833162375168", xp: 900 },
  { key: "yapping", name: "Yapping Olga", roleId: "1559137959238696980", xp: 1400 },
  { key: "unstoppable", name: "Unstoppable Olga", roleId: "1559138070501130280", xp: 2500 },
  { key: "olga_chats", name: "The olga of the chats", roleId: OLGA_OF_CHATS_ROLE_ID, xp: 4000 }
];

function loadData() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(
      DATA_PATH,
      JSON.stringify(
        {
          users: {},
          leaderboardMessageId: null,
          currentOlgaOfChatsId: null
        },
        null,
        2
      )
    );
  }
  return JSON.parse(fs.readFileSync(DATA_PATH));
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

function getUserData(data, userId) {
  if (!data.users[userId]) {
    data.users[userId] = { xp: 0, messages: 0 };
  }
  return data.users[userId];
}

function getLevelForXp(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xp) current = lvl;
  }
  return current;
}

function getNextLevel(xp) {
  for (const lvl of LEVELS) {
    if (xp < lvl.xp) return lvl;
  }
  return null;
}

async function updateUserRoles(member, oldLevelKey, newLevelKey) {
  const guild = member.guild;

  const oldLevel = LEVELS.find(l => l.key === oldLevelKey);
  const newLevel = LEVELS.find(l => l.key === newLevelKey);

  if (oldLevel && oldLevel.roleId) {
    await member.roles.remove(oldLevel.roleId).catch(() => {});
  }
  if (newLevel && newLevel.roleId) {
    await member.roles.add(newLevel.roleId).catch(() => {});
  }
}

async function recalcOlgaOfChats(client) {
  const data = loadData();

  const eligible = Object.entries(data.users)
    .filter(([id, u]) => u.xp >= 4000)
    .sort((a, b) => b[1].xp - a[1].xp);

  const newOlgaId = eligible.length ? eligible[0][0] : null;
  const oldOlgaId = data.currentOlgaOfChatsId;

  if (newOlgaId === oldOlgaId) return;

  const guild = client.guilds.cache.first();
  if (!guild) return;

  const olgaRole = guild.roles.cache.get(OLGA_OF_CHATS_ROLE_ID);
  const announceChannel = guild.channels.cache.get(OLGA_OF_CHATS_ANNOUNCE_CHANNEL_ID);

  if (oldOlgaId) {
    const oldMember = await guild.members.fetch(oldOlgaId).catch(() => null);
    if (oldMember && olgaRole) {
      await oldMember.roles.remove(olgaRole).catch(() => {});
    }
  }

  if (newOlgaId && olgaRole) {
    const newMember = await guild.members.fetch(newOlgaId).catch(() => null);
    if (newMember) {
      await newMember.roles.add(olgaRole).catch(() => {});
    }
  }

  if (announceChannel && newOlgaId) {
    const oldMention = oldOlgaId ? `<@${oldOlgaId}>` : "no one";
    const newMention = `<@${newOlgaId}>`;

    await announceChannel.send({
      embeds: [
        {
          color: 0x0a5cff,
          footer: { text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" },
          description:
            `- laughs uncontrollably- -slaps hand on forehead- look at ${oldMention} , so naive about being the olga of che chats! ${newMention} is now the Olga of The Chats.`
        }
      ]
    });
  }

  data.currentOlgaOfChatsId = newOlgaId;
  saveData(data);
}

async function updateLeaderboard(client) {
  const data = loadData();
  const guild = client.guilds.cache.first();
  if (!guild) return;

  const channel = guild.channels.cache.get(LEADERBOARD_CHANNEL_ID);
  if (!channel) return;

  const usersArr = Object.entries(data.users).sort((a, b) => b[1].xp - a[1].xp);

  let desc = "";
  let rank = 1;
  for (const [userId, stats] of usersArr) {
    desc += `#${rank} <@${userId}> — XP: ${stats.xp}, messages: ${stats.messages}\n`;
    rank++;
  }
  if (!desc) desc = "No bitch has chatted yet.";

  const olgaId = data.currentOlgaOfChatsId;
  const olgaRoleMention = `<@&${OLGA_OF_CHATS_ROLE_ID}>`;
  const olgaUserMention = olgaId ? `<@${olgaId}>` : "no one";

  const leaderboardEmbed = {
    title: "-ˏˋ Chat leaderboard ˊˎ",
    description: desc,
    color: 0x0a5cff,
    image: {
      url: "https://cdn.discordapp.com/attachments/1212370536416677949/1559140867917484073/630ce052-5810-46e0-b237-1b18cb772544.png"
    },
    footer: { text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" }
  };

  const olgaEmbed = {
    title: "- ̥۪͙۪˚┊❛ The Olga of the chats ❜┊˚ ̥۪͙۪◌ ",
    description: `${olgaUserMention} is currently the ${olgaRoleMention}`,
    color: 0x0a5cff,
    footer: { text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" }
  };

  let msg = null;

  if (data.leaderboardMessageId) {
    msg = await channel.messages.fetch(data.leaderboardMessageId).catch(() => null);
  }

  if (!msg) {
    msg = await channel.send({ embeds: [leaderboardEmbed, olgaEmbed] });
    data.leaderboardMessageId = msg.id;
    saveData(data);
    return;
  }

  await msg.edit({ embeds: [leaderboardEmbed, olgaEmbed] });
}

module.exports = {
  CHAT_CHANNEL_ID,
  LEVELS,
  loadData,
  saveData,
  getUserData,
  getLevelForXp,
  getNextLevel,
  updateUserRoles,
  recalcOlgaOfChats,
  updateLeaderboard
};
