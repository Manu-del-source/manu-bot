const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys');

const pino = require('pino');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');

async function startWhatsApp() {
  const { state, saveCreds } =
    await useMultiFileAuthState('./sessions');

  const { version, isLatest } =
    await fetchLatestBaileysVersion();

  console.log(`📱 Baileys WA version: ${version.join('.')}`);
  console.log(`📌 Latest: ${isLatest ? 'yes' : 'no'}`);

  const sock = makeWASocket({
    auth: state,
    version,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    printQRInTerminal: false
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({
    connection,
    lastDisconnect,
    qr
  }) => {

    if (qr) {
      console.log('');
      console.log('================================');
      console.log('📱 SCAN THIS QR WITH WHATSAPP');
      console.log('================================');
      qrcode.generate(qr, { small: true });
      console.log('');
    }

    if (connection === 'connecting') {
      console.log('🔄 Connecting to WhatsApp...');
    }

    if (connection === 'open') {
      console.log('');
      console.log('================================');
      console.log('✅ MANU-BOT CONNECTED');
      console.log('================================');
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
        statusCode === DisconnectReason.loggedOut
      ) {
        console.log(
          '❌ Session logged out. A new QR will be required.'
        );
        return;
      }

      console.log('🔄 Reconnecting in 5 seconds...');

      setTimeout(() => {
        startWhatsApp().catch(error => {
          console.error(
            '❌ Reconnection failed:',
            error.message
          );
        });
      }, 5000);
    }
  });

  return sock;
}

module.exports = { startWhatsApp };
