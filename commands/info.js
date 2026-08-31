const { registerCommand } = require('../lib/commands/registry');
const os = require('os');

registerCommand('info', async ({ sock, message }) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
  const memTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);

  const info = `🤖 *MANU-BOT INFO*\n\n` +
    `📛 *Bot Name:* MANU-BOT\n` +
    `👨‍💻 *Developer:* Manu\n` +
    `⏱️ *Uptime:* ${hours}h ${minutes}m ${seconds}s\n` +
    `💾 *Memory:* ${memUsed} MB / ${memTotal} GB\n` +
    `🖥️ *Platform:* ${os.platform()}\n` +
    `📦 *Node.js:* ${process.version}\n` +
    `🔧 *Baileys:* @whiskeysockets/baileys\n\n` +
    `📝 *Commands:* .menu\n` +
    `Prefix: .\n\n` +
    `🤖 Powered by MANU-BOT`;

  await sock.sendMessage(message.key.remoteJid, {
    text: info
  });
});
