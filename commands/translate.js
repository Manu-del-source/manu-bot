const { registerCommand } = require('../lib/commands/registry');
const fetch = require('node-fetch');

const LANGUAGES = {
  'en': 'English', 'sw': 'Swahili', 'fr': 'French', 'es': 'Spanish',
  'de': 'German', 'it': 'Italian', 'pt': 'Portuguese', 'ru': 'Russian',
  'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese', 'ar': 'Arabic',
  'hi': 'Hindi', 'tr': 'Turkish', 'nl': 'Dutch', 'pl': 'Polish'
};

registerCommand('translate', async ({ sock, message, args }) => {
  const jid = message.key.remoteJid;

  if (args.length < 2) {
    await sock.sendMessage(jid, {
      text: '🌍 *Translate*\n\nUsage: .translate <lang> <text>\n\nLanguages: en, sw, fr, es, de, it, pt, ru, ja, ko, zh, ar, hi, tr, nl, pl\n\nExample: .translate sw Hello world'
    });
    return;
  }

  try {
    const lang = args[0].toLowerCase();
    const text = args.slice(1).join(' ');

    if (!LANGUAGES[lang]) {
      await sock.sendMessage(jid, {
        text: `❌ Unknown language: ${lang}\n\nAvailable: ${Object.keys(LANGUAGES).join(', ')}`
      });
      return;
    }

    await sock.sendMessage(jid, { text: `🔄 Translating to ${LANGUAGES[lang]}...` });

    // Use Google Translate free API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);
    const data = await response.json();

    const translated = data[0].map(item => item[0]).join('');
    const detectedLang = data[2] || 'auto';

    await sock.sendMessage(jid, {
      text: `🌍 *Translation*\n\n` +
        `📝 *Original:* ${text}\n` +
        `✅ *Translated (${LANGUAGES[lang]}):* ${translated}\n` +
        `🔍 *Detected:* ${detectedLang}`
    });

    console.log(`✅ Translated: "${text.substring(0, 20)}..." → ${LANGUAGES[lang]}`);

  } catch (error) {
    console.error('❌ Translate error:', error.message);
    await sock.sendMessage(jid, { text: '❌ Translation failed. Please try again.' });
  }
});
