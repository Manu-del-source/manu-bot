const { registerCommand } = require('../lib/commands/registry');

registerCommand('demote', async ({ sock, message, args }) => {
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
      await sock.sendMessage(jid, { text: '❌ Bot must be an admin to demote members.' });
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
        text: '❌ Reply to a message or mention someone to demote.\n\nExample: .demote @username'
      });
      return;
    }

    const target = mentionedJid ? mentionedJid[0] : quotedParticipant;

    await sock.groupParticipantsUpdate(jid, [target], 'demote');
    await sock.sendMessage(jid, {
      text: `✅ @${target.split('@')[0]} has been demoted from admin.`,
      mentions: [target]
    });

  } catch (error) {
    console.error('❌ Demote error:', error.message);
    await sock.sendMessage(jid, { text: '❌ Failed to demote member.' });
  }
});
