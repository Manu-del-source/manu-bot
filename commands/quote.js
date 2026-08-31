const { registerCommand } = require('../lib/commands/registry');

const quotes = [
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Innovation distinguishes between a leader and a follower. — Steve Jobs",
  "Stay hungry, stay foolish. — Steve Jobs",
  "Life is what happens when you're busy making other plans. — John Lennon",
  "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
  "It is during our darkest moments that we must focus to see the light. — Aristotle",
  "The best time to plant a tree was 20 years ago. The second best time is now. — Chinese Proverb",
  "Your time is limited, don't waste it living someone else's life. — Steve Jobs",
  "If life were predictable it would cease to be life. — Eleanor Roosevelt",
  "In the middle of difficulty lies opportunity. — Albert Einstein",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. — Winston Churchill",
  "Believe you can and you're halfway there. — Theodore Roosevelt",
  "The only impossible journey is the one you never begin. — Tony Robbins",
  "Everything you've ever wanted is on the other side of fear. — George Addair",
  "Hardships often prepare ordinary people for an extraordinary destiny. — C.S. Lewis",
  "The mind is everything. What you think you become. — Buddha",
  "Strive not to be a success, but rather to be of value. — Albert Einstein",
  "Security is mostly a superstition. Life is either a daring adventure or nothing. — Helen Keller",
  "Two roads diverged in a wood, and I—I took the one less traveled by, and that has made all the difference. — Robert Frost",
  "I have not failed. I've just found 10,000 ways that won't work. — Thomas Edison"
];

registerCommand('quote', async ({ sock, message }) => {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  await sock.sendMessage(message.key.remoteJid, {
    text: `💡 *Quote of the Day*\n\n_${randomQuote}_`
  });
});
