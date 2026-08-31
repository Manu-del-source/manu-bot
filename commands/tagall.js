const { registerCommand } = require('../lib/commands/registry');

registerCommand('tagall', async ({ sock, message, args }) => {
  const jid = message.key.remoteJid;

  // Only works in groups
  if (!jid.endsWith('@g.us')) {
    await sock.sendMessage(jid, {
      text: '❌ This command only works in groups.'
    });
    return;
  }

  try {
    const groupMetadata = await sock.groupMetadata(jid);
    const participants = groupMetadata.participants;
    const groupName = groupMetadata.subject;

    const customMsg = args.length > 0 ? args.join(' ') : '';

    let text = `📢 *TAG ALL*\n`;
    text += `👥 Group: ${groupName}\n`;
    text += `👤 Amount: ${participants.length} members\n\n`;

    if (customMsg) {
      text += `💬 *Message:* ${customMsg}\n\n`;
    }

    // Mention all participants
    for (const participant of participants) {
      text += `@${participant.id.split('@')[0]}\n`;
    }

    text += `\n🤖 MANU-BOT`;

    const mentions = participants.map(p => p.id);

    await sock.sendMessage(jid, {
      text: text,
      mentions: mentions
    });

  } catch (error) {
    console.error('❌ Tagall error:', error.message);
    await sock.sendMessage(jid, {
      text: '❌ Failed to tag all members.'
    });
  }
});
