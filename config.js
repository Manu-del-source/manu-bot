require('dotenv').config();

module.exports = {
  sessionName: process.env.SESSION_NAME || 'manu-bot',
  ownerNumber: process.env.OWNER_NUMBER || '',
  pairingNumber: process.env.PAIRING_NUMBER || '',
  databaseUrl: process.env.DATABASE_URL || '',
  nodeEnv: process.env.NODE_ENV || 'development'
};
