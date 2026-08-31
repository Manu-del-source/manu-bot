const { registerCommand } = require('../lib/commands/registry');
const os = require('os');

registerCommand('uptime', async ({ sock, message }) => {
  const uptime = process.uptime();
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
  const memTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(1);

  const uptimeStr = [];
  if (days > 0) uptimeStr.push(`${days}d`);
  if (hours > 0) uptimeStr.push(`${hours}h`);
  if (minutes > 0) uptimeStr.push(`${minutes}m`);
  uptimeStr.push(`${seconds}s`);

  const bar = '█'.repeat(Math.min(Math.floor(uptime / 86400 * 10), 10)) + '░'.repeat(Math.max(10 - Math.floor(uptime / 86400 * 10), 0));

  await sock.sendMessage(message.key.remoteJid, {
    text: `⏱️ *Bot Uptime*\n\n` +
      `⏱️ *Uptime:* ${uptimeStr.join(' ')}\n` +
      `💾 *Memory:* ${memUsed} MB / ${memTotal} GB\n` +
      `🖥️ *Platform:* ${os.platform()}\n` +
      `📦 *Node.js:* ${process.version}\n` +
      `📊 *Uptime bar:* ${bar}\n\n` +
      `_Bot is running smoothly!_`
  });

  console.log(`✅ Uptime sent: ${uptimeStr.join(' ')}`);
});
