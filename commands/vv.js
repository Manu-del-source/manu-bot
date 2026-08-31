const { registerCommand } = require('../lib/commands/registry');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

// Store view-once messages temporarily
const viewOnceStore = new Map();
const VV_STORE_LIMIT = 50;

registerCommand('vv', async ({ sock, message, args }) => {
  try {
    const jid = message.key.remoteJid;
    const quoted = message.message?.extendedTextMessage?.contextInfo;
    const quotedMsg = quoted?.quotedMessage;

    // Check if replying to a view-once message
    if (quotedMsg) {
      const viewOnceMsg = quotedMsg.viewOnceMessage?.message ||
                         quotedMsg.viewOnceMessageV2?.message ||
                         quotedMsg.viewOnceMessageV2Extension?.message;

      if (viewOnceMsg) {
        await sock.sendMessage(jid, { text: '⏳ Downloading view-once media...' });

        try {
          const buffer = await downloadMediaMessage(
            { key: quoted.key || message.key, message: viewOnceMsg },
            'buffer',
            {}
          );

          const caption = viewOnceMsg.imageMessage?.caption ||
                         viewOnceMsg.videoMessage?.caption ||
                         '🔒 View-Once Media';

          const isVideo = !!viewOnceMsg.videoMessage;

          if (isVideo) {
            await sock.sendMessage(jid, {
              video: buffer,
              caption: `👁️‍🗨️ *View-Once Captured*\n\n💬 *Caption:* ${caption}\n\n🤖 MANU-BOT`
            });
          } else {
            await sock.sendMessage(jid, {
              image: buffer,
              caption: `👁️‍🗨️ *View-Once Captured*\n\n💬 *Caption:* ${caption}\n\n🤖 MANU-BOT`
            });
          }

          console.log('✅ View-once media forwarded');
          return;
        } catch (err) {
          console.error('❌ VV download error:', err.message);
          await sock.sendMessage(jid, {
            text: '❌ Failed to download view-once media.'
          });
          return;
        }
      }
    }

    // If no quoted message, show instructions
    await sock.sendMessage(jid, {
      text: `👁️‍🗨️ *View-Once Viewer*\n\n` +
        `*How to use:*\n` +
        `1. Reply to a view-once message with .vv\n` +
        `2. The bot will download and forward it to you\n\n` +
        `*Example:*\n` +
        `Reply to view-once image → .vv\n\n` +
        `💡 *Auto Mode:* Anti-VV is enabled, view-once messages are automatically captured and sent to the owner.`
    });

  } catch (error) {
    console.error('❌ VV error:', error);
    await sock.sendMessage(message.key.remoteJid, {
      text: '❌ Error with view-once command.'
    });
  }
});

// Export store for use in connection.js
module.exports.viewOnceStore = viewOnceStore;
