const { registerCommand } = require('../lib/commands/registry');

registerCommand('promote', async ({ sock, message, args }) => {
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
      await sock.sendMessage(jid, { text: '❌ Bot must be an admin to promote members.' });
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
        text: '❌ Reply to a message or mention someone to promote.\n\nExample: .promote @username'
      });
      return;
    }

    const target = mentionedJid ? mentionedJid[0] : quotedParticipant;

    await sock.groupParticipantsUpdate(jid, [target], 'promote');
    await sock.sendMessage(jid, {
      text: `✅ @${target.split('@')[0]} has been promoted to admin! 🎉`,
      mentions: [target]
    });

  } catch (error) {
    console.error('❌ Promote error:', error.message);
    await sock.sendMessage(jid, { text: '❌ Failed to promote member.' });
  }
});
