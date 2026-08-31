module.exports = {
  botName: 'MANU-BOT',
  ownerName: 'Manu',
  ownerNumber: process.env.OWNER_NUMBER || '',
  prefix: '.',
  timezone: 'Africa/Nairobi',
  mode: 'public', // public, private, group

  // Auto Status Features
  autoStatusSeen: process.env.AUTO_STATUS_SEEN === 'true' || true,
  autoStatusReply: process.env.AUTO_STATUS_REPLY === 'true' || false,
  autoStatusReact: process.env.AUTO_STATUS_REACT === 'true' || true,
  autoStatusMsg: process.env.AUTO_STATUS_MSG || '*✅ Seen your status!*',
  autoStatusEmojis: (process.env.AUTO_STATUS_EMOJIS || '❤️,🔥,😍,💯,✨').split(','),

  // Auto React Features
  autoReact: process.env.AUTO_REACT === 'true' || false,
  autoReactEmojis: (process.env.AUTO_REACT_EMOJIS || '❤️,🔥,😍,💯,✨,😎,🤩,💪').split(','),

  // Auto Reply
  autoReply: process.env.AUTO_REPLY === 'true' || false,
  autoReplyMsg: process.env.AUTO_REPLY_MSG || 'Hey! I am MANU-BOT. Type .menu to see commands.',

  // Welcome/Goodbye
  welcome: process.env.WELCOME === 'true' || false,
  welcomeMsg: process.env.WELCOME_MSG || 'Welcome @user to *GROUP*! 🎉\nType .menu to see commands.',
  goodbyeMsg: process.env.GOODBYE_MSG || 'Goodbye @user! 👋\nWe will miss you!',

  // Anti Features
  antiLink: process.env.ANTI_LINK === 'true' || false,
  antiLinkMsg: process.env.ANTI_LINK_MSG || '❌ Links are not allowed here!',
  antiBad: process.env.ANTI_BAD === 'true' || false,
  antiBadWords: (process.env.ANTI_BAD_WORDS || 'bad,ugly,stupid,fuck,shit').split(','),
  antiBadMsg: process.env.ANTI_BAD_MSG || '❌ Please watch your language!',

  // Anti-View-Once (Anti-VV) ✅ ENABLED
  antiVV: process.env.ANTI_VV === 'true' || true,
  antiVVDeliveredTo: process.env.ANTI_VV_DELIVER || 'owner', // 'owner' or 'same'

  // Anti-Delete ✅ ENABLED
  antiDelete: process.env.ANTI_DELETE === 'true' || true,
  antiDeleteDeliveredTo: process.env.ANTI_DELETE_DELIVER || 'owner', // 'owner' or 'same'

  // Presence & Read
  alwaysOnline: process.env.ALWAYS_ONLINE === 'true' || false,
  autoTyping: process.env.AUTO_TYPING === 'true' || false,
  readCmd: process.env.READ_CMD === 'true' || false,
  readMessage: process.env.READ_MESSAGE === 'true' || false,

  // Sticker
  stickerPack: process.env.STICKER_PACK || 'MANU-BOT',
  stickerAuthor: process.env.STICKER_AUTHOR || 'Manu',

  // Menu Image
  menuImageUrl: process.env.MENU_IMAGE_URL || ''
};
