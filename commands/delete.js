const { registerCommand } = require('../lib/commands/registry');

registerCommand('delete', async ({ sock, message }) => {
  const jid = message.key.remoteJid;

  try {
    const quoted = message.message?.extendedTextMessage?.contextInfo;

    if (!quoted) {
      await sock.sendMessage(jid, {
        text: '❌ Reply to a message to delete it.\n\nExample: Reply to message → .delete'
      });
      return;
    }

    const quotedKey = quoted.stanzaId ? {
      remoteJid: quoted.participant || jid,
      fromMe: false,
      id: quoted.stanzaId
    } : quoted.participant ? {
      remoteJid: jid,
      fromMe: false,
      id: quoted.stanzaId,
      participant: quoted.participant
    } : null;

    if (!quotedKey) {
      await sock.sendMessage(jid, { text: '❌ Could not delete message.' });
      return;
    }

    await sock.sendMessage(jid, { delete: quotedKey });
    console.log('✅ Message deleted');

  } catch (error) {
    console.error('❌ Delete error:', error.message);
    await sock.sendMessage(jid, { text: '❌ Failed to delete message. Bot must be admin.' });
  }
});
