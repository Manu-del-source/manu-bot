const { registerCommand } = require('../lib/commands/registry');
const settings = require('../settings');

registerCommand('report', async ({ sock, message, args }) => {
  const jid = message.key.remoteJid;

  if (!args.length) {
    await sock.sendMessage(jid, {
      text: '📝 *Report Command*\n\nUsage: .report <your issue>\n\nExample: .report The sticker command is not working'
    });
    return;
  }

  try {
    const reportText = args.join(' ');
    const sender = message.key.participant || message.key.remoteJid;
    const senderNumber = sender.split('@')[0];

    // Send report to owner (if owner number is set)
    if (settings.ownerNumber) {
      const ownerJid = settings.ownerNumber + '@s.whatsapp.net';
      await sock.sendMessage(ownerJid, {
        text: `📝 *NEW REPORT*\n\n` +
          `👤 *From:* @${senderNumber}\n` +
          `💬 *Message:* ${reportText}\n` +
          `📍 *Chat:* ${jid}\n\n` +
          `_Reply to this message to respond to the report_`,
        mentions: [sender]
      });
    }

    await sock.sendMessage(jid, {
      text: `✅ *Report Sent!*\n\nYour report has been sent to the bot owner.\n\n` +
        `📝 *Your Report:* ${reportText}\n\n` +
        `_Thank you for helping us improve!_`
    });

  } catch (error) {
    console.error('❌ Report error:', error.message);
    await sock.sendMessage(jid, { text: '❌ Failed to send report.' });
  }
});
