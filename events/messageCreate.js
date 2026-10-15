const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

const COUNT_CHANNEL_ID = "1515690705664741466";
const SUCCESS_EMOJI_ID = "1556263477969166436";
const FAIL_EMOJI_ID = "1556263655392280576";

const statePath = "./countState.json";

const {
  CHAT_CHANNEL_ID,
  loadData,
  saveData,
  getUserData,
  getLevelForXp,
  getNextLevel,
  updateUserRoles,
  recalcOlgaOfChats,
  updateLeaderboard
} = require("../utils/chatXP");

const LEVEL_UP_CHANNEL_ID = "1513932845922385920";

if (!fs.existsSync(statePath)) {
  fs.writeFileSync(statePath, JSON.stringify({ lastNumber: 0, lastUserId: null }, null, 2));
}

let leaderboardIntervalStarted = false;

module.exports = {
  name: "messageCreate",
  async execute(message, stickyRR, client) {
    if (message.author.bot) return;

    if (stickyRR?.handleMessage) stickyRR.handleMessage(message);

    if (message.channel.id === CHAT_CHANNEL_ID) {
      const db = getDb();

let stats =
  await db.collection("chatstats")
  .findOne({
    userId: message.author.id
  });

if (!stats) {
  stats = {
    userId: message.author.id,
    xp: 0,
    messages: 0
  };
}

      let xpGain = 2;
      if (message.attachments.size > 0) xpGain += 4;

      stats.xp += xpGain;
      stats.messages++;

      const oldLevel = getLevelForXp(stats.xp - xpGain);
      const newLevel = getLevelForXp(stats.xp);

      if (oldLevel.key !== newLevel.key) {
        const member = await message.guild.members.fetch(userId).catch(() => null);
        if (member) {
          await updateUserRoles(member, oldLevel.key, newLevel.key);

          const ch = message.guild.channels.cache.get(LEVEL_UP_CHANNEL_ID);
          if (ch) {
            await ch.send({
              embeds: [
                new EmbedBuilder()
                  .setColor("#0A5CFF")
                  .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
                  .setImage("https://cdn.discordapp.com/attachments/1212370536416677949/1559205924869120000/ae7fdb06-9a57-4795-90a8-a0c58864bd6a.png")
                  .setDescription(
                    `congratulations <@${userId}> , your fat ass has advanced from <@&${oldLevel.roleId}> to <@&${newLevel.roleId}> !`
                  )
              ]
            });
          }
        }
      }

      saveData(data);
      await recalcOlgaOfChats(client);

      if (!leaderboardIntervalStarted) {
        leaderboardIntervalStarted = true;

        setInterval(async () => {
          try {
            await updateLeaderboard(client);
          } catch (err) {
            console.log("Leaderboard edit error:", err.message);
          }
        }, 15000);
      }
    }

    if (message.channel.id === COUNT_CHANNEL_ID) {
      let state = JSON.parse(fs.readFileSync(statePath));

      const num = parseInt(message.content.trim(), 10);
      if (isNaN(num)) return;

      const expected = state.lastNumber + 1;

      if (message.author.id === state.lastUserId || num !== expected) {
        await message.react(FAIL_EMOJI_ID).catch(() => {});

        await message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("『 ↳✧･ﾟ Fucked up! 💩")
              .setDescription(`Oh what an uneducated bitch! <@${message.author.id}> has fucked up at ${state.lastNumber} !`)
              .setColor("#0A5CFF")
              .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
          ]
        });

        state.lastNumber = 0;
        state.lastUserId = null;
        fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
        return;
      }

      await message.react(SUCCESS_EMOJI_ID).catch(() => {});
      state.lastNumber = num;
      state.lastUserId = message.author.id;
      fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    }
  }
};
