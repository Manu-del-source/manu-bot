const { registerCommand } = require('../lib/commands/registry');
const fetch = require('node-fetch');

registerCommand('joke', async ({ sock, message }) => {
  try {
    await sock.sendMessage(message.key.remoteJid, { text: '😂 Getting a joke...' });

    const response = await fetch('https://official-joke-api.appspot.com/random_joke');
    const joke = await response.json();

    await sock.sendMessage(message.key.remoteJid, {
      text: `😂 *Joke*\n\n` +
        `*Setup:* ${joke.setup}\n\n` +
        `*Punchline:* ${joke.punchline}\n\n` +
        `_Type: ${joke.type}_`
    });

    console.log('✅ Joke sent');

  } catch (error) {
    // Fallback jokes
    const jokes = [
      { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" },
      { setup: "Why did the scarecrow win an award?", punchline: "He was outstanding in his field!" },
      { setup: "What do you call a fake noodle?", punchline: "An impasta!" },
      { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!" },
      { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!" }
    ];
    const joke = jokes[Math.floor(Math.random() * jokes.length)];

    await sock.sendMessage(message.key.remoteJid, {
      text: `😂 *Joke*\n\n*Setup:* ${joke.setup}\n\n*Punchline:* ${joke.punchline}`
    });

    console.log('✅ Joke sent (fallback)');
  }
});
