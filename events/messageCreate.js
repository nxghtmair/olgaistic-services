const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

// COUNTING SYSTEM CONFIG
const COUNT_CHANNEL_ID = "1515690705664741466";
const SUCCESS_EMOJI_ID = "1556263477969166436";
const FAIL_EMOJI_ID = "1556263655392280576";

const statePath = "./countState.json";

// XP SYSTEM IMPORT
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
const LEADERBOARD_CHANNEL_ID = "1555618153231552584";

// Create state file if missing
if (!fs.existsSync(statePath)) {
  fs.writeFileSync(
    statePath,
    JSON.stringify({ lastNumber: 0, lastUserId: null }, null, 2)
  );
}

let leaderboardIntervalStarted = false;

module.exports = {
  name: "messageCreate",
  async execute(message, stickyRR, client) {
    if (message.author.bot) return;

    // Sticky RR handler
    if (stickyRR && stickyRR.handleMessage) {
      stickyRR.handleMessage(message);
    }

    // ─────────────────────────────────────────────
    // XP SYSTEM
    // ─────────────────────────────────────────────
    if (message.channel.id === CHAT_CHANNEL_ID) {
      const xpData = loadData();
      const userId = message.author.id;
      const userStats = getUserData(xpData, userId);

      let xpGain = 2;
      if (message.attachments.size > 0) xpGain += 4;

      userStats.xp += xpGain;
      userStats.messages += 1;

      const oldLevel = getLevelForXp(userStats.xp - xpGain);
      const newLevel = getLevelForXp(userStats.xp);

      // LEVEL UP
      if (oldLevel.key !== newLevel.key) {
        const member = await message.guild.members.fetch(userId).catch(() => null);
        if (member) {
          await updateUserRoles(member, oldLevel.key, newLevel.key);

          const levelUpChannel = message.guild.channels.cache.get(LEVEL_UP_CHANNEL_ID);
          if (levelUpChannel) {
            await levelUpChannel.send({
              embeds: [
                new EmbedBuilder()
                  .setColor("#0A5CFF")
                  .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" })
                  .setImage(
                    "https://cdn.discordapp.com/attachments/1212370536416677949/1559205924869120000/ae7fdb06-9a57-4795-90a8-a0c58864bd6a.png"
                  )
                  .setDescription(
                    `congratulations <@${userId}> , your fat ass has advanced from <@&${oldLevel.roleId}> to <@&${newLevel.roleId}> !`
                  )
              ]
            });
          }
        }
      }

      saveData(xpData);

      // Recalculate Olga of the chats
      await recalcOlgaOfChats(client);

      // ─────────────────────────────────────────────
      // LEADERBOARD AUTO-EDIT SYSTEM
      // ─────────────────────────────────────────────
      if (!leaderboardIntervalStarted) {
        leaderboardIntervalStarted = true;

        setInterval(async () => {
          try {
            const data = loadData();
            const guild = client.guilds.cache.first();
            const channel = guild.channels.cache.get(LEADERBOARD_CHANNEL_ID);
            if (!channel) return;

            // Build embeds
            const usersArr = Object.entries(data.users).sort((a, b) => b[1].xp - a[1].xp);

            let desc = "";
            let rank = 1;
            for (const [userId, stats] of usersArr) {
              desc += `#${rank} <@${userId}> — XP: ${stats.xp}, messages: ${stats.messages}\n`;
              rank++;
            }
            if (!desc) desc = "No bitch has chatted yet.";

            const olgaId = data.currentOlgaOfChatsId;
            const olgaRoleMention = "<@&1559138180274585640>";
            const olgaUserMention = olgaId ? `<@${olgaId}>` : "no one";

            const leaderboardEmbed = new EmbedBuilder()
              .setTitle("-ˏˋ Chat leaderboard ˊˎ")
              .setDescription(desc)
              .setColor("#0A5CFF")
              .setImage(
                "https://cdn.discordapp.com/attachments/1212370536416677949/1559140867917484073/630ce052-5810-46e0-b237-1b18cb772544.png"
              )
              .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" });

            const olgaEmbed = new EmbedBuilder()
              .setTitle("- ̥۪͙۪˚┊❛ The Olga of the chats ❜┊˚ ̥۪͙۪◌ ")
              .setDescription(`${olgaUserMention} is currently the ${olgaRoleMention}`)
              .setColor("#0A5CFF")
              .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" });

            let msg = null;

            // Try to fetch existing leaderboard message
            if (data.leaderboardMessageId) {
              msg = await channel.messages.fetch(data.leaderboardMessageId).catch(() => null);
            }

            // If message doesn't exist → create new one
            if (!msg) {
              msg = await channel.send({ embeds: [leaderboardEmbed, olgaEmbed] });
              data.leaderboardMessageId = msg.id;
              saveData(data);
              return;
            }

            // Edit existing message
            await msg.edit({ embeds: [leaderboardEmbed, olgaEmbed] });

          } catch (err) {
            console.log("Leaderboard edit error:", err.message);
          }
        }, 15000);
      }
    }

    // ─────────────────────────────────────────────
    // COUNTING SYSTEM
    // ─────────────────────────────────────────────
    if (message.channel.id === COUNT_CHANNEL_ID) {
      let state = JSON.parse(fs.readFileSync(statePath));

      const num = parseInt(message.content.trim(), 10);
      if (isNaN(num)) return;

      const expected = state.lastNumber + 1;

      if (message.author.id === state.lastUserId || num !== expected) {
        await message.react(FAIL_EMOJI_ID).catch(() => {});

        const embed = new EmbedBuilder()
          .setTitle("『 ↳✧･ﾟ Fucked up! 💩")
          .setDescription(
            `Oh what an uneducated bitch! <@${message.author.id}> has fucked up at ${state.lastNumber} !`
          )
          .setColor("#0A5CFF")
          .setFooter({ text: "⋇⊶⊰The Olgas: Season 5⊱⊷⋇" });

        await message.channel.send({ embeds: [embed] });

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
