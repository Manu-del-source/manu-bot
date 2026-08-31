const { registerCommand } = require('../lib/commands/registry');

registerCommand('kick', async ({ sock, message, args }) => {
  const jid = message.key.remoteJid;

  if (!jid.endsWith('@g.us')) {
    await sock.sendMessage(jid, { text: '❌ This command only works in groups.' });
    return;
  }

  try {
    const groupMetadata = await sock.groupMetadata(jid);
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botIsAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;

    if (!botIsAdmin) {
      await sock.sendMessage(jid, { text: '❌ Bot must be an admin to kick members.' });
      return;
    }

    const senderNumber = message.key.participant || message.key.remoteJid;
    const senderIsAdmin = groupMetadata.participants.find(p => p.id === senderNumber)?.admin;

    if (!senderIsAdmin) {
      await sock.sendMessage(jid, { text: '❌ Only admins can use this command.' });
      return;
    }

    const mentionedJid = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    const quotedParticipant = message.message?.extendedTextMessage?.contextInfo?.participant;

    if (!mentionedJid && !quotedParticipant) {
      await sock.sendMessage(jid, {
        text: '❌ Reply to a message or mention someone to kick.\n\nExample: .kick @username'
      });
      return;
    }

    const target = mentionedJid ? mentionedJid[0] : quotedParticipant;

    await sock.groupParticipantsUpdate(jid, [target], 'remove');
    await sock.sendMessage(jid, {
      text: `✅ @${target.split('@')[0]} has been kicked from the group.`,
      mentions: [target]
    });

  } catch (error) {
    console.error('❌ Kick error:', error.message);
    await sock.sendMessage(jid, { text: '❌ Failed to kick member.' });
  }
});
