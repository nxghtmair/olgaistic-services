const { load, save } = require("../utils/chatTracker");

module.exports = {
  name: "messageCreate",
  async execute(message, stickyRR) {
    if (message.author.bot) return;

    // Sticky RR handler
    if (stickyRR && stickyRR.handleMessage) {
      stickyRR.handleMessage(message);
    }

    const data = load();

    // overall
    if (!data.overall[message.author.id]) data.overall[message.author.id] = 0;
    data.overall[message.author.id]++;

    // weekly
    if (!data.weekly[message.author.id]) data.weekly[message.author.id] = 0;
    data.weekly[message.author.id]++;

    save(data);
  }
};
