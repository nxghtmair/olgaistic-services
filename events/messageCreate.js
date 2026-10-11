const { load, save } = require("../utils/chatTracker");
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");

// COUNTING SYSTEM CONFIG
const COUNT_CHANNEL_ID = "1515690705664741466";
const SUCCESS_EMOJI_ID = "1556263477969166436";
const FAIL_EMOJI_ID = "1556263655392280576";

const statePath = "./countState.json";

// Create state file if missing
if (!fs.existsSync(statePath)) {
  fs.writeFileSync(
    statePath,
    JSON.stringify({ lastNumber: 0, lastUserId: null }, null, 2)
  );
}

module.exports = {
  name: "messageCreate",
  async execute(message, stickyRR) {
    if (message.author.bot) return;

    // Sticky RR handler
    if (stickyRR && stickyRR.handleMessage) {
      stickyRR.handleMessage(message);
    }

    // CHAT TRACKER (your original system)
    const data = load();

    if (!data.overall[message.author.id]) data.overall[message.author.id] = 0;
    data.overall[message.author.id]++;

    if (!data.weekly[message.author.id]) data.weekly[message.author.id] = 0;
    data.weekly[message.author.id]++;

    save(data);

    // ─────────────────────────────────────────────
    // COUNTING SYSTEM
    // ─────────────────────────────────────────────
    if (message.channel.id !== COUNT_CHANNEL_ID) return;

    let state = JSON.parse(fs.readFileSync(statePath));

    const num = parseInt(message.content.trim(), 10);
    if (isNaN(num)) return;

    const expected = state.lastNumber + 1;

    // If same user twice OR wrong number → fucked up
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

      // Reset counting
      state.lastNumber = 0;
      state.lastUserId = null;
      fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
      return;
    }

    // Correct count
    await message.react(SUCCESS_EMOJI_ID).catch(() => {});

    state.lastNumber = num;
    state.lastUserId = message.author.id;
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  }
};
