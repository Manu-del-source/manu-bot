const { registerCommand } = require('../lib/commands/registry');

registerCommand('alive', async ({ sock, message }) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const text =
    `╭━━━〔 🤖 MANU-BOT 〕━━━╮\n` +
    `┃\n` +
    `┃ ⚡ *Bot is Alive!*\n` +
    `┃\n` +
    `┃ 📛 *Name:* MANU-BOT\n` +
    `┃ ⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n` +
    `┃ 📦 *Version:* 1.0.0\n` +
    `┃ 👨‍💻 *Developer:* Manu\n` +
    `┃\n` +
    `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
    `💡 *Tip:* Type .menu to see all commands`;

  await sock.sendMessage(message.key.remoteJid, {
    text: text
  });
});
