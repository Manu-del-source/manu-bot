const { registerCommand } = require('../lib/commands/registry');

registerCommand('who', async ({ sock, message, args }) => {
  const jid = message.key.remoteJid;

  if (!jid.endsWith('@g.us')) {
    await sock.sendMessage(jid, { text: '❌ This command only works in groups.' });
    return;
  }

  try {
    const groupMetadata = await sock.groupMetadata(jid);
    const participants = groupMetadata.participants;
    const randomParticipant = participants[Math.floor(Math.random() * participants.length)];

    const question = args.length > 0 ? args.join(' ') : 'is the GOAT 🐐';

    await sock.sendMessage(jid, {
      text: `🎯 *Who ${question}?*\n\nThe answer is...\n\n@${randomParticipant.id.split('@')[0]} 🎉`,
      mentions: [randomParticipant.id]
    });

  } catch (error) {
    console.error('❌ Who error:', error.message);
    await sock.sendMessage(jid, { text: '❌ Failed to pick a random member.' });
  }
});
