const { registerCommand } = require('../lib/commands/registry');

registerCommand('menu', async ({ sock, message }) => {
  try {
    const text =
      `╭━━━〔 🤖 MANU-BOT 〕━━━╮\n` +
      `┃\n` +
      `┃ 📌 *GENERAL*\n` +
      `┃ .menu — Show commands\n` +
      `┃ .help — Show help\n` +
      `┃ .ping — Test bot\n` +
      `┃ .alive — Check if alive\n` +
      `┃ .info — Bot info\n` +
      `┃ .uptime — Bot uptime\n` +
      `┃ .owner — Show owner\n` +
      `┃ .quote — Random quote\n` +
      `┃ .joke — Random joke\n` +
      `┃ .fact — Random fact\n` +
      `┃\n` +
      `┃ 📥 *DOWNLOADS*\n` +
      `┃ .play — Play song\n` +
      `┃ .video — Download video\n` +
      `┃\n` +
      `┃ 🎨 *MEDIA*\n` +
      `┃ .sticker — Make sticker\n` +
      `┃ .tts — Text to speech\n` +
      `┃ .translate — Translate text\n` +
      `┃\n` +
      `┃ 👥 *GROUP*\n` +
      `┃ .tagall — Tag everyone\n` +
      `┃ .kick — Kick member\n` +
      `┃ .promote — Make admin\n` +
      `┃ .demote — Remove admin\n` +
      `┃ .add — Add member\n` +
      `┃ .delete — Delete message\n` +
      `┃ .who — Random person\n` +
      `┃ .rate — Rate something\n` +
      `┃ .ship — Ship two people\n` +
      `┃\n` +
      `┃ 🤖 *AI & TOOLS*\n` +
      `┃ .ai — Chat with AI\n` +
      `┃ .weather — Check weather\n` +
      `┃ .report — Report issue\n` +
      `┃\n` +
      `┃ 🛡️ *PROTECTION*\n` +
      `┃ .vv — View view-once\n` +
      `┃\n` +
      `┃ ⚙️ *SETTINGS*\n` +
      `┃ .autostatus — Toggle features\n` +
      `┃\n` +
      `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
      `💡 Reply to image with .sticker`;

    await sock.sendMessage(message.key.remoteJid, {
      text: text
    });
    console.log('✅ Menu sent successfully');
  } catch (error) {
    console.error('❌ Menu error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: '❌ Error loading menu. Please try again.'
    });
  }
});
