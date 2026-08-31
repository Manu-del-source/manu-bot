const { registerCommand } = require('../lib/commands/registry');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

registerCommand('sticker', async ({ sock, message, args }) => {
  try {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const imageMsg = quoted?.imageMessage || message.message?.imageMessage;
    const videoMsg = quoted?.videoMessage || message.message?.videoMessage;

    if (!imageMsg && !videoMsg) {
      await sock.sendMessage(message.key.remoteJid, {
        text: '🖼️ Reply to an image or send an image with .sticker\n\n*Example:*\n• Send an image with caption `.sticker`\n• Reply to an image with `.sticker`'
      });
      return;
    }

    await sock.sendMessage(message.key.remoteJid, {
      text: '⏳ Creating sticker...'
    });

    const buffer = await downloadMediaMessage(
      imageMsg ? { key: message.key, message: quoted || message.message } : { key: message.key, message: quoted || message.message },
      'buffer',
      {}
    );

    const sticker = new Sticker(buffer, {
      pack: 'MANU-BOT',
      author: 'Manu',
      type: videoMsg ? StickerTypes.VIDEO : StickerTypes.FULL,
      quality: 70
    });

    const stickerBuffer = await sticker.toBuffer();

    await sock.sendMessage(message.key.remoteJid, {
      sticker: stickerBuffer
    });

  } catch (error) {
    console.error('❌ Sticker error:', error.message);
    await sock.sendMessage(message.key.remoteJid, {
      text: '❌ Failed to create sticker. Make sure you sent an image or video.'
    });
  }
});
