const { registerCommand } = require('../lib/commands/registry');

registerCommand('add', async ({ sock, message, args }) => {
  const jid = message.key.remoteJid;

  if (!jid.endsWith('@g.us')) {
    await sock.sendMessage(jid, { text: '❌ This command only works in groups.' });
    return;
  }

  if (!args.length) {
    await sock.sendMessage(jid, {
      text: '❌ Provide a phone number to add.\n\nExample: .add 254712345678'
    });
    return;
  }

  try {
    const groupMetadata = await sock.groupMetadata(jid);
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const botIsAdmin = groupMetadata.participants.find(p => p.id === botNumber)?.admin;

    if (!botIsAdmin) {
      await sock.sendMessage(jid, { text: '❌ Bot must be an admin to add members.' });
      return;
    }

    const senderNumber = message.key.participant || message.key.remoteJid;
    const senderIsAdmin = groupMetadata.participants.find(p => p.id === senderNumber)?.admin;

    if (!senderIsAdmin) {
      await sock.sendMessage(jid, { text: '❌ Only admins can use this command.' });
      return;
    }

    let number = args[0].replace(/[^0-9]/g, '');
    if (number.startsWith('0')) number = '254' + number.slice(1);
    if (!number.startsWith('+')) number = '+' + number;

    const target = number.replace('+', '') + '@s.whatsapp.net';

    const memberCount = groupMetadata.participants.length;
    if (memberCount >= 1024) {
      await sock.sendMessage(jid, { text: '❌ Group is full (max 1024 members).' });
      return;
    }

    const result = await sock.groupParticipantsUpdate(jid, [target], 'add');

    if (result && result.status === 403) {
      await sock.sendMessage(jid, {
        text: `❌ Failed to add @${number}. They might need an invite link.`,
        mentions: [target]
      });
      return;
    }

    await sock.sendMessage(jid, {
      text: `✅ @${number} has been added to the group!`,
      mentions: [target]
    });

  } catch (error) {
    console.error('❌ Add error:', error.message);
    await sock.sendMessage(jid, { text: '❌ Failed to add member. Make sure the number is valid.' });
  }
});
