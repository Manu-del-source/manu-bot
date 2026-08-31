const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
  isJidBroadcast,
  isJidGroup,
  getContentType,
  downloadMediaMessage
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');

const { getCommand } =
  require('../commands/registry');

require('../commands/load');

const settings = require('../../settings');

// Store recent messages for anti-delete
const messageStore = new Map();
const STORE_LIMIT = 5000;

async function startWhatsApp() {
  const { state, saveCreds } =
    await useMultiFileAuthState('./sessions');

  const { version, isLatest } =
    await fetchLatestBaileysVersion();

  console.log(
    `📱 Baileys WA version: ${version.join('.')}`
  );

  console.log(
    `📌 Latest: ${isLatest ? 'yes' : 'no'}`
  );

  const sock = makeWASocket({
    auth: state,
    version,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    printQRInTerminal: false,
    markOnlineOnConnect: settings.alwaysOnline
  });

  sock.ev.on('creds.update', saveCreds);

  // ==================== MESSAGE HANDLER ====================

  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const message = messages[0];

      if (!message) return;

      // ---- STORE MESSAGE FOR ANTI-DELETE ----
      if (settings.antiDelete) {
        const msgId = message.key.id;
        if (msgId) {
          messageStore.set(msgId, {
            ...message,
            storeTime: Date.now()
          });

          // Clean old messages
          if (messageStore.size > STORE_LIMIT) {
            const oldest = messageStore.keys().next().value;
            messageStore.delete(oldest);
          }
        }
      }      // ---- STATUS BROADCAST (LATEST ONLY) ----
      if (isJidBroadcast(message.key.remoteJid)) {
        // Track last processed status per sender
        if (!sock._lastStatusSeen) sock._lastStatusSeen = {};
        
        const senderId = message.key.participant || message.key.remoteJid;
        const msgTimestamp = message.messageTimestamp || 0;
        const lastSeen = sock._lastStatusSeen[senderId] || 0;
        
        // Only process if this is a NEWER status than the last one we processed
        if (msgTimestamp <= lastSeen) {
          return; // Skip old/duplicate status
        }
        
        // Update the last seen timestamp
        sock._lastStatusSeen[senderId] = msgTimestamp;
        
        // Auto Status Seen + React (fire and forget for speed)
        if (settings.autoStatusSeen || settings.autoStatusReact) {
          const tasks = [];
          if (settings.autoStatusSeen) {
            tasks.push(sock.readMessages([message.key]).catch(() => {}));
          }
          if (settings.autoStatusReact) {
            const emoji = settings.autoStatusEmojis[
              Math.floor(Math.random() * settings.autoStatusEmojis.length)
            ];
            tasks.push(sock.sendMessage(message.key.remoteJid, {
              react: { text: emoji, key: message.key }
            }).catch(() => {}));
          }
          await Promise.allSettled(tasks);
        }

        // Auto Status Reply
        if (settings.autoStatusReply) {
          await sock.sendMessage(message.key.remoteJid, {
            text: settings.autoStatusMsg
          }).catch(() => {});
        }

        return;
      }

      // ---- OWN MESSAGE ----
      // Note: own messages are allowed through for command processing
      // Uncomment below to ignore own messages:
      // if (message.key.fromMe) {
      //   console.log('↩ Ignoring own message');
      //   return;
      // }

      // ---- READ MESSAGE ----
      if (settings.readMessage) {
        await sock.readMessages([message.key]);
      }

      // ---- AUTO TYPING ----
      if (settings.autoTyping) {
        await sock.sendPresenceUpdate('composing', message.key.remoteJid);
      }

      // ---- ANTI-VIEW-ONCE (ANTI-VV) ----
      if (settings.antiVV) {
        const viewOnceMsg = message.message?.viewOnceMessage?.message ||
                          message.message?.viewOnceMessageV2?.message ||
                          message.message?.viewOnceMessageV2Extension?.message;

        if (viewOnceMsg) {
          console.log('👁️‍🗨️ View-once message detected!');

          try {
            const buffer = await downloadMediaMessage(
              { key: message.key, message: viewOnceMsg },
              'buffer',
              {}
            );

            const caption = viewOnceMsg.imageMessage?.caption ||
                          viewOnceMsg.videoMessage?.caption ||
                          '🔒 View-Once Media';

            const isVideo = !!viewOnceMsg.videoMessage;
            const senderNumber = message.key.participant || message.key.remoteJid;
            const sender = senderNumber.split('@')[0];

            // Determine where to deliver
            let targetJid;
            if (settings.antiVVDeliveredTo === 'owner' && settings.ownerNumber) {
              targetJid = settings.ownerNumber + '@s.whatsapp.net';
            } else {
              targetJid = message.key.remoteJid;
            }

            const header = `👁️‍🗨️ *VIEW-ONCE CAPTURED*\n\n` +
                          `👤 *From:* @${sender}\n` +
                          `📍 *Chat:* ${message.key.remoteJid}\n` +
                          `💬 *Caption:* ${caption}\n\n` +
                          `_Anti-View-Once by MANU-BOT_`;

            if (isVideo) {
              await sock.sendMessage(targetJid, {
                video: buffer,
                caption: header,
                mentions: [senderNumber]
              });
            } else {
              await sock.sendMessage(targetJid, {
                image: buffer,
                caption: header,
                mentions: [senderNumber]
              });
            }

            console.log(`👁️‍🗨️ Anti-VV: View-once captured from ${sender}`);

          } catch (error) {
            console.error('❌ Anti-VV error:', error.message);
          }

          return;
        }
      }

      // ---- MESSAGE TEXT EXTRACTION ----
      const messageText =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        '';

      if (!messageText) {
        return;
      }

      const text = messageText.trim();

      console.log(`💬 Text: ${text}`);

      // ---- ANTI LINK ----
      if (settings.antiLink && isJidGroup(message.key.remoteJid)) {
        const urlRegex = /https?:\/\/[^\s]+|www\.[^\s]+|chat\.whatsapp\.com\/[^\s]+|wa\.me\/[^\s]+/gi;
        if (urlRegex.test(text)) {
          const senderNumber = message.key.participant || message.key.remoteJid;
          const groupMeta = await sock.groupMetadata(message.key.remoteJid);
          const senderIsAdmin = groupMeta.participants.find(
            p => p.id === senderNumber
          )?.admin;

          if (!senderIsAdmin) {
            // Delete the message
            await sock.sendMessage(message.key.remoteJid, {
              delete: message.key
            });

            await sock.sendMessage(message.key.remoteJid, {
              text: settings.antiLinkMsg
            });

            console.log('🔗 Anti-link: message deleted');
            return;
          }
        }
      }

      // ---- ANTI BAD WORDS ----
      if (settings.antiBad && isJidGroup(message.key.remoteJid)) {
        const lowerText = text.toLowerCase();
        const hasBadWord = settings.antiBadWords.some(word =>
          lowerText.includes(word.toLowerCase())
        );

        if (hasBadWord) {
          const senderNumber = message.key.participant || message.key.remoteJid;
          const groupMeta = await sock.groupMetadata(message.key.remoteJid);
          const senderIsAdmin = groupMeta.participants.find(
            p => p.id === senderNumber
          )?.admin;

          if (!senderIsAdmin) {
            await sock.sendMessage(message.key.remoteJid, {
              delete: message.key
            });

            await sock.sendMessage(message.key.remoteJid, {
              text: settings.antiBadMsg
            });

            console.log('🚫 Anti-bad: message deleted');
            return;
          }
        }
      }

      // ---- AUTO REPLY ----
      if (settings.autoReply && !text.startsWith(settings.prefix)) {
        await sock.sendMessage(message.key.remoteJid, {
          text: settings.autoReplyMsg
        });
        console.log('💬 Auto reply sent');
        return;
      }

      // ---- AUTO REACT ----
      if (settings.autoReact) {
        const emoji = settings.autoReactEmojis[
          Math.floor(Math.random() * settings.autoReactEmojis.length)
        ];
        await sock.sendMessage(message.key.remoteJid, {
          react: { text: emoji, key: message.key }
        });
        console.log(`😍 Auto reacted: ${emoji}`);
      }

      // ---- COMMAND HANDLING ----
      if (!text.startsWith(settings.prefix)) {
        console.log(
          `ℹ Not a command. Prefix is "${settings.prefix}"`
        );
        return;
      }

      const commandText =
        text
          .slice(settings.prefix.length)
          .trim();

      if (!commandText) {
        return;
      }

      const parts =
        commandText.split(/\s+/);

      const commandName = parts.shift().toLowerCase();

      const args = parts;

      console.log(
        `📥 Command detected: ${settings.prefix}${commandName}`
      );

      // ---- READ COMMAND ----
      if (settings.readCmd) {
        await sock.readMessages([message.key]);
      }

      const command =
        getCommand(commandName);

      if (!command) {
        console.log(
          `❌ Unknown command: ${settings.prefix}${commandName}`
        );

        await sock.sendMessage(
          message.key.remoteJid,
          {
            text:
              `❌ Unknown command: ${settings.prefix}${commandName}\n\n` +
              `Use ${settings.prefix}menu to see available commands.`
          }
        );

        return;
      }

      console.log(
        `⚙ Executing: ${settings.prefix}${commandName}`
      );

      try {
        await command({
          sock,
          message,
          args,
          command: commandName
        });

        console.log(
          `✅ Command completed: ${settings.prefix}${commandName}`
        );
      } catch (cmdError) {
        console.error(
          `❌ Command ${settings.prefix}${commandName} failed:`,
          cmdError.message || cmdError
        );
        try {
          await sock.sendMessage(
            message.key.remoteJid,
            { text: `❌ Command failed. Please try again.` }
          );
        } catch (sendErr) {
          console.error('❌ Failed to send error message:', sendErr.message);
        }
      }

    } catch (error) {
      console.error(
        '❌ Command handling error:',
        error
      );
    }
  });

  // ==================== ANTI-DELETE HANDLER ====================

  sock.ev.on('message-receipt.update', async (update) => {
    try {
      if (!settings.antiDelete) return;

      for (const { key, receipt } of update) {
        // Check if message was retracted/deleted
        if (receipt && receipt.retractCount > 0) {
          const msgId = key.id;

          if (messageStore.has(msgId)) {
            const originalMsg = messageStore.get(msgId);
            console.log(`🗑️ Anti-delete: Message ${msgId} was deleted`);

            // Get sender info
            const senderNumber = originalMsg.key.participant || originalMsg.key.remoteJid;
            const sender = senderNumber.split('@')[0];
            const chatJid = originalMsg.key.remoteJid;

            // Determine where to deliver
            let targetJid;
            if (settings.antiDeleteDeliveredTo === 'owner' && settings.ownerNumber) {
              targetJid = settings.ownerNumber + '@s.whatsapp.net';
            } else {
              targetJid = chatJid;
            }

            // Try to resend the deleted message
            const msgContent = originalMsg.message;

            if (msgContent?.conversation) {
              // Text message
              await sock.sendMessage(targetJid, {
                text: `🗑️ *DELETED MESSAGE*\n\n` +
                      `👤 *From:* @${sender}\n` +
                      `📍 *Chat:* ${chatJid}\n` +
                      `💬 *Message:* ${msgContent.conversation}\n\n` +
                      `_Anti-Delete by MANU-BOT_`,
                mentions: [senderNumber]
              });
            } else if (msgContent?.extendedTextMessage?.text) {
              // Extended text message
              await sock.sendMessage(targetJid, {
                text: `🗑️ *DELETED MESSAGE*\n\n` +
                      `👤 *From:* @${sender}\n` +
                      `📍 *Chat:* ${chatJid}\n` +
                      `💬 *Message:* ${msgContent.extendedTextMessage.text}\n\n` +
                      `_Anti-Delete by MANU-BOT_`,
                mentions: [senderNumber]
              });
            } else if (msgContent?.imageMessage) {
              // Image message
              try {
                const buffer = await downloadMediaMessage(
                  originalMsg,
                  'buffer',
                  {}
                );
                await sock.sendMessage(targetJid, {
                  image: buffer,
                  caption: `🗑️ *DELETED IMAGE*\n\n` +
                           `👤 *From:* @${sender}\n` +
                           `📍 *Chat:* ${chatJid}\n` +
                           `💬 *Caption:* ${msgContent.imageMessage.caption || 'No caption'}\n\n` +
                           `_Anti-Delete by MANU-BOT_`,
                  mentions: [senderNumber]
                });
              } catch (err) {
                console.error('Anti-delete image error:', err.message);
              }
            } else if (msgContent?.videoMessage) {
              // Video message
              try {
                const buffer = await downloadMediaMessage(
                  originalMsg,
                  'buffer',
                  {}
                );
                await sock.sendMessage(targetJid, {
                  video: buffer,
                  caption: `🗑️ *DELETED VIDEO*\n\n` +
                           `👤 *From:* @${sender}\n` +
                           `📍 *Chat:* ${chatJid}\n` +
                           `💬 *Caption:* ${msgContent.videoMessage.caption || 'No caption'}\n\n` +
                           `_Anti-Delete by MANU-BOT_`,
                  mentions: [senderNumber]
                });
              } catch (err) {
                console.error('Anti-delete video error:', err.message);
              }
            } else if (msgContent?.audioMessage) {
              // Audio message
              try {
                const buffer = await downloadMediaMessage(
                  originalMsg,
                  'buffer',
                  {}
                );
                await sock.sendMessage(targetJid, {
                  audio: buffer,
                  mimetype: 'audio/mpeg',
                  ptt: false
                });
                await sock.sendMessage(targetJid, {
                  text: `🗑️ *DELETED AUDIO*\n\n` +
                        `👤 *From:* @${sender}\n` +
                        `📍 *Chat:* ${chatJid}\n\n` +
                        `_Anti-Delete by MANU-BOT_`,
                  mentions: [senderNumber]
                });
              } catch (err) {
                console.error('Anti-delete audio error:', err.message);
              }
            } else if (msgContent?.stickerMessage) {
              // Sticker message
              try {
                const buffer = await downloadMediaMessage(
                  originalMsg,
                  'buffer',
                  {}
                );
                await sock.sendMessage(targetJid, {
                  sticker: buffer
                });
                await sock.sendMessage(targetJid, {
                  text: `🗑️ *DELETED STICKER*\n\n` +
                        `👤 *From:* @${sender}\n` +
                        `📍 *Chat:* ${chatJid}\n\n` +
                        `_Anti-Delete by MANU-BOT_`,
                  mentions: [senderNumber]
                });
              } catch (err) {
                console.error('Anti-delete sticker error:', err.message);
              }
            } else {
              // Other message types
              await sock.sendMessage(targetJid, {
                text: `🗑️ *DELETED MESSAGE*\n\n` +
                      `👤 *From:* @${sender}\n` +
                      `📍 *Chat:* ${chatJid}\n` +
                      `ℹ️ *Type:* ${getContentType(msgContent) || 'Unknown'}\n\n` +
                      `_Anti-Delete by MANU-BOT_`,
                mentions: [senderNumber]
              });
            }

            messageStore.delete(msgId);
            console.log(`✅ Anti-delete: Message resent from ${sender}`);
          }
        }
      }
    } catch (error) {
      console.error('❌ Anti-delete handler error:', error);
    }
  });

  // ==================== GROUP EVENTS ====================

  sock.ev.on('group-participants.update', async (update) => {
    try {
      const { id, participants, action } = update;
      const groupMetadata = await sock.groupMetadata(id);
      const groupName = groupMetadata.subject;

      // Welcome message
      if (action === 'add' && settings.welcome) {
        for (const participant of participants) {
          const welcomeMsg = settings.welcomeMsg
            .replace('@user', `@${participant.split('@')[0]}`)
            .replace('GROUP', groupName);

          await sock.sendMessage(id, {
            text: welcomeMsg,
            mentions: [participant]
          });
          console.log(`👋 Welcome: ${participant} joined ${groupName}`);
        }
      }

      // Goodbye message
      if (action === 'remove' && settings.welcome) {
        for (const participant of participants) {
          const goodbyeMsg = settings.goodbyeMsg
            .replace('@user', `@${participant.split('@')[0]}`)
            .replace('GROUP', groupName);

          await sock.sendMessage(id, {
            text: goodbyeMsg,
            mentions: [participant]
          });
          console.log(`👋 Goodbye: ${participant} left ${groupName}`);
        }
      }

      // Admin events
      if (action === 'promote') {
        for (const participant of participants) {
          await sock.sendMessage(id, {
            text: `🎉 @${participant.split('@')[0]} has been promoted to admin!`,
            mentions: [participant]
          });
          console.log(`👑 Promoted: ${participant}`);
        }
      }

      if (action === 'demote') {
        for (const participant of participants) {
          await sock.sendMessage(id, {
            text: `📉 @${participant.split('@')[0]} has been demoted from admin.`,
            mentions: [participant]
          });
          console.log(`👑 Demoted: ${participant}`);
        }
      }

    } catch (error) {
      console.error('❌ Group event error:', error);
    }
  });

  // ==================== CONNECTION EVENTS ====================

  sock.ev.on(
    'connection.update',
    ({
      connection,
      lastDisconnect,
      qr
    }) => {

      if (qr) {
        console.log('');
        console.log('================================');
        console.log('📱 SCAN THIS QR WITH WHATSAPP');
        console.log('================================');

        qrcode.generate(qr, {
          small: true
        });

        console.log('');
      }

      if (connection === 'connecting') {
        console.log(
          '🔄 Connecting to WhatsApp...'
        );
      }

      if (connection === 'open') {
        console.log('');
        console.log('================================');
        console.log('✅ MANU-BOT CONNECTED');
        console.log('================================');
        console.log('');

        // Set online presence if enabled
        if (settings.alwaysOnline) {
          sock.sendPresenceUpdate('available');
          console.log('🟢 Always online: enabled');
        }

        // Log auto features status
        console.log('📋 Auto Features:');
        console.log(`  👁️ Auto Status Seen: ${settings.autoStatusSeen}`);
        console.log(`  😍 Auto Status React: ${settings.autoStatusReact}`);
        console.log(`  💬 Auto Status Reply: ${settings.autoStatusReply}`);
        console.log(`  📨 Auto React: ${settings.autoReact}`);
        console.log(`  💬 Auto Reply: ${settings.autoReply}`);
        console.log(`  👋 Welcome/Goodbye: ${settings.welcome}`);
        console.log(`  🔗 Anti-Link: ${settings.antiLink}`);
        console.log(`  🚫 Anti-Bad: ${settings.antiBad}`);
        console.log(`  👁️‍🗨️ Anti-View-Once: ${settings.antiVV}`);
        console.log(`  🗑️ Anti-Delete: ${settings.antiDelete}`);
        console.log(`  🟢 Always Online: ${settings.alwaysOnline}`);
        console.log('');
      }

      if (connection === 'close') {

        const statusCode =
          new Boom(lastDisconnect?.error)
            ?.output?.statusCode;

        const reason =
          DisconnectReason[statusCode] || 'UNKNOWN';

        console.log('');
        console.log('================================');
        console.log('⚠️ CONNECTION CLOSED');
        console.log('================================');
        console.log(`Status: ${statusCode}`);
        console.log(`Reason: ${reason}`);
        console.log('================================');

        if (
          statusCode ===
          DisconnectReason.loggedOut
        ) {
          console.log(
            '❌ Session logged out. A new QR will be required.'
          );

          return;
        }

        console.log(
          '🔄 Reconnecting in 5 seconds...'
        );

        setTimeout(() => {
          startWhatsApp().catch(error => {
            console.error(
              '❌ Reconnection failed:',
              error.message
            );
          });
        }, 5000);
      }
    }
  );

  return sock;
}

module.exports = {
  startWhatsApp
};
