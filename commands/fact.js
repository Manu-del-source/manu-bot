const { registerCommand } = require('../lib/commands/registry');
const fetch = require('node-fetch');

registerCommand('fact', async ({ sock, message }) => {
  try {
    await sock.sendMessage(message.key.remoteJid, { text: '🧠 Getting a fact...' });

    const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en');
    const data = await response.json();

    await sock.sendMessage(message.key.remoteJid, {
      text: `🧠 *Random Fact*\n\n${data.text || data.fact}\n\n_Source: uselessfacts.jsph.pl_`
    });

    console.log('✅ Fact sent');

  } catch (error) {
    // Fallback facts
    const facts = [
      "Honey never spoils. Archaeologists found 3,000-year-old honey in Egyptian tombs that was still edible.",
      "Octopuses have three hearts, nine brains, and blue blood.",
      "A group of flamingos is called a 'flamboyance'.",
      "Bananas are berries, but strawberries aren't.",
      "The inventor of the Pringles can is buried in one.",
      "A day on Venus is longer than a year on Venus.",
      "Cows have best friends and get stressed when separated.",
      "Hot water freezes faster than cold water (Mpemba effect)."
    ];
    const fact = facts[Math.floor(Math.random() * facts.length)];

    await sock.sendMessage(message.key.remoteJid, {
      text: `🧠 *Random Fact*\n\n${fact}`
    });

    console.log('✅ Fact sent (fallback)');
  }
});
