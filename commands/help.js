const { registerCommand } =
  require('../lib/commands/registry');

registerCommand('help', async ({ sock, message }) => {
  await sock.sendMessage(message.key.remoteJid, {
    text:
      `🤖 *MANU-BOT HELP*\n\n` +
      `📌 *General*\n` +
      `├ .menu — Show all commands\n` +
      `├ .help — Show this help\n` +
      `├ .ping — Test bot response\n` +
      `├ .alive — Check if bot is alive\n` +
      `├ .info — Bot info & stats\n` +
      `├ .owner — Show bot owner\n` +
      `├ .report — Report an issue\n` +
      `├ .quote — Random quote\n` +
      `│\n` +
      `📌 *Downloads*\n` +
      `├ .play — Play song from YouTube\n` +
      `├ .video — Download video from YouTube\n` +
      `│\n` +
      `📌 *Media*\n` +
      `├ .sticker — Convert image/video to sticker\n` +
      `│\n` +
      `📌 *Group*\n` +
      `├ .tagall — Mention everyone\n` +
      `├ .kick — Kick a member\n` +
      `├ .promote — Make someone admin\n` +
      `├ .demote — Remove admin\n` +
      `├ .add — Add a member\n` +
      `├ .who — Pick random person\n` +
      `├ .rate — Rate something 0-100\n` +
      `├ .ship — Ship two people\n` +
      `│\n` +
      `📌 *AI*\n` +
      `└ .ai — Ask AI anything\n\n` +
      `💡 *Tips:*\n` +
      `• Reply to image with .sticker\n` +
      `• Use .play <song name> to download\n` +
      `• Use .ai <question> to chat with AI`
  });
});
