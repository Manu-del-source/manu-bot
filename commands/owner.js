const { registerCommand } = require('../lib/commands/registry');
const settings = require('../settings');

registerCommand('owner', async ({ sock, message }) => {
  await sock.sendMessage(message.key.remoteJid, {
    text: `👑 *BOT OWNER*\n\n` +
      `📛 *Name:* ${settings.ownerName}\n` +
      `🤖 *Bot:* ${settings.botName}\n` +
      `📞 *Contact:* Send a message to the owner\n\n` +
      `_Powered by MANU-BOT_`
  });
});
