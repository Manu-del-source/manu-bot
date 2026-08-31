const { registerCommand } = require('../lib/commands/registry');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

registerCommand('tts', async ({ sock, message, args }) => {
  const jid = message.key.remoteJid;

  if (!args.length) {
    await sock.sendMessage(jid, {
      text: '🔊 *Text to Speech*\n\nUsage: .tts <text>\n\nExample: .tts Hello, how are you?'
    });
    return;
  }

  try {
    const text = args.join(' ');

    if (text.length > 200) {
      await sock.sendMessage(jid, { text: '❌ Text too long! Max 200 characters.' });
      return;
    }

    await sock.sendMessage(jid, { text: '🔊 Generating audio...' });

    // Use Google TTS free API
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error('TTS API failed');
    }

    const buffer = await response.buffer();

    await sock.sendMessage(jid, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      ptt: true
    });

    console.log(`✅ TTS sent: "${text.substring(0, 30)}..."`);

  } catch (error) {
    console.error('❌ TTS error:', error.message);
    await sock.sendMessage(jid, {
      text: '❌ Failed to generate audio. Please try again.'
    });
  }
});
