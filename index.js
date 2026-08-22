const settings = require('./settings');
const config = require('./config');
const { startWhatsApp } = require('./lib/whatsapp/connection');

async function main() {
  console.log('');
  console.log('================================');
  console.log(`  ${settings.botName}`);
  console.log('================================');
  console.log(`Mode: ${config.nodeEnv}`);
  console.log(`Prefix: ${settings.prefix}`);
  console.log(`Timezone: ${settings.timezone}`);
  console.log('Status: Starting...');
  console.log('================================');
  console.log('');

  try {
    await startWhatsApp();
  } catch (error) {
    console.error('❌ Failed to start WhatsApp:', error);
    process.exit(1);
  }
}

main();
