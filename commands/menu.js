const { registerCommand } = require('../lib/commands/registry');

registerCommand('menu', async ({ sock, message }) => {
  try {
    const time = new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' });
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const text =
      `╔════════════════════════╗\n` +
      `║     🤖 *MANU-BOT*      ║\n` +
      `║   Your WhatsApp Bot     ║\n` +
      `╚════════════════════════╝\n\n` +
      `📅 ${date}\n` +
      `🕐 ${time}\n` +
      `👨‍💻 Owner: Manu\n` +
      `⚡ Prefix: .\n` +
      `📊 Version: 2.0\n\n` +
      `┌────────────────────────┐\n` +
      `│   📌 *GENERAL MENU*    │\n` +
      `├────────────────────────┤\n` +
      `│ .menu   ─ Show menu    │\n` +
      `│ .help   ─ Show help    │\n` +
      `│ .ping   ─ Test bot     │\n` +
      `│ .alive  ─ Check alive  │\n` +
      `│ .info   ─ Bot info     │\n` +
      `│ .uptime ─ Bot uptime   │\n` +
      `│ .owner  ─ Show owner   │\n` +
      `│ .quote  ─ Random quote │\n` +
      `│ .joke   ─ Random joke  │\n` +
      `│ .fact   ─ Random fact  │\n` +
      `└────────────────────────┘\n\n` +
      `┌────────────────────────┐\n` +
      `│  📥 *DOWNLOADS*        │\n` +
      `├────────────────────────┤\n` +
      `│ .play   ─ Play song    │\n` +
      `│ .video  ─ Download vid │\n` +
      `└────────────────────────┘\n\n` +
      `┌────────────────────────┐\n` +
      `│  🎨 *MEDIA*            │\n` +
      `├────────────────────────┤\n` +
      `│ .sticker ─ Make sticker│\n` +
      `│ .tts     ─ Text to speech│\n` +
      `│ .translate ─ Translate │\n` +
      `└────────────────────────┘\n\n` +
      `┌────────────────────────┐\n` +
      `│  👥 *GROUP*            │\n` +
      `├────────────────────────┤\n` +
      `│ .tagall   ─ Tag everyone│\n` +
      `│ .kick     ─ Kick member│\n` +
      `│ .promote  ─ Make admin │\n` +
      `│ .demote   ─ Remove admin│\n` +
      `│ .add      ─ Add member │\n` +
      `│ .delete   ─ Delete msg │\n` +
      `│ .who      ─ Random pick│\n` +
      `│ .rate     ─ Rate 0-100 │\n` +
      `│ .ship     ─ Ship couple│\n` +
      `└────────────────────────┘\n\n` +
      `┌────────────────────────┐\n` +
      `│  🤖 *AI & TOOLS*       │\n` +
      `├────────────────────────┤\n` +
      `│ .ai      ─ Chat AI     │\n` +
      `│ .weather ─ Weather     │\n` +
      `│ .report  ─ Report issue│\n` +
      `└────────────────────────┘\n\n` +
      `┌────────────────────────┐\n` +
      `│  🛡️ *PROTECTION*       │\n` +
      `├────────────────────────┤\n` +
      `│ .vv      ─ View-once   │\n` +
      `└────────────────────────┘\n\n` +
      `┌────────────────────────┐\n` +
      `│  ⚙️ *SETTINGS*         │\n` +
      `├────────────────────────┤\n` +
      `│ .autostatus ─ Toggle   │\n` +
      `└────────────────────────┘\n\n` +
      `╔════════════════════════╗\n` +
      `║  💡 *Quick Tips*       ║\n` +
      `║ • Reply image → .sticker║\n` +
      `║ • .play <song name>    ║\n` +
      `║ • .ai <your question>  ║\n` +
      `║ • .weather <city>      ║\n` +
      `╚════════════════════════╝\n\n` +
      `┌────────────────────────┐\n` +
      `│  👁️‍🗨️ *AUTO FEATURES*    │\n` +
      `├────────────────────────┤\n` +
      `│ ✅ Status Seen: ON     │\n` +
      `│ ✅ Status React: ON    │\n` +
      `│ ✅ Anti-View-Once: ON  │\n` +
      `│ ✅ Anti-Delete: ON     │\n` +
      `│ ⚙️ More: .autostatus   │\n` +
      `└────────────────────────┘\n\n` +
      `╔════════════════════════╗\n` +
      `║  🤖 *MANU-BOT v2.0*    ║\n` +
      `║  Made with ❤️ by Manu  ║\n` +
      `╚════════════════════════╝`;

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
