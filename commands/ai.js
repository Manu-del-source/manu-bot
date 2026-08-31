const { registerCommand } = require('../lib/commands/registry');
const fetch = require('node-fetch');

registerCommand('ai', async ({ sock, message, args }) => {
  const jid = message.key.remoteJid;

  if (!args.length) {
    await sock.sendMessage(jid, {
      text: '🤖 *AI Chatbot*\n\nUsage: .ai <your question>\n\nExample: .ai What is the meaning of life?'
    });
    return;
  }

  try {
    const question = args.join(' ');

    await sock.sendMessage(jid, { text: '🤔 Thinking...' });

    // Using a free AI API
    const response = await fetch(`https://api.lolhuman.xyz/api/openai?apikey=GITHUB&text=${encodeURIComponent(question)}&model=gpt-3.5-turbo`);

    if (!response.ok) {
      // Fallback to another API
      const fallback = await fetch(`https://vihangayt.com/chatgpt?q=${encodeURIComponent(question)}`);

      if (!fallback.ok) {
        throw new Error('All AI APIs failed');
      }

      const fallbackData = await fallback.json();
      await sock.sendMessage(jid, {
        text: `🤖 *AI Response*\n\n${fallbackData.result || 'Sorry, I could not understand that.'}\n\n_Powered by MANU-BOT_`
      });
      return;
    }

    const data = await response.json();
    await sock.sendMessage(jid, {
      text: `🤖 *AI Response*\n\n${data.result || data.message || 'Sorry, I could not understand that.'}\n\n_Powered by MANU-BOT_`
    });

  } catch (error) {
    console.error('❌ AI error:', error.message);
    await sock.sendMessage(jid, {
      text: '❌ AI service is currently unavailable. Please try again later.'
    });
  }
});
