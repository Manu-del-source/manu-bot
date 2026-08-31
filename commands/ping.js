const { registerCommand } = require('../lib/commands/registry');

registerCommand('ping', async ({ sock, message }) => {
  try {
    const start = Date.now();
    const sent = await sock.sendMessage(message.key.remoteJid, {
      text: '🏓 Pinging...'
    });
    const end = Date.now();
    const latency = end - start;

    await sock.sendMessage(message.key.remoteJid, {
      text: `🏓 *Pong!*\n\n⚡ Latency: ${latency}ms\n🤖 Bot: MANU-BOT\n📦 Version: 1.0.0`
    });
    console.log(`✅ Ping responded: ${latency}ms`);
  } catch (error) {
    console.error('❌ Ping error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: '🏓 Pong!'
    });
  }
});
