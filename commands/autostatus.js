const { registerCommand } = require('../lib/commands/registry');
const settings = require('../settings');
const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '..', 'autostatus.json');

// Default settings
const defaults = {
  autoStatusSeen: true,
  autoStatusReact: true,
  autoStatusReply: false,
  autoReact: false,
  autoReply: false,
  welcome: false,
  antiLink: false,
  antiBad: false,
  antiVV: true,
  antiDelete: true,
  alwaysOnline: false,
  autoTyping: false,
  readCmd: false,
  readMessage: false
};

// Load saved settings or use defaults
function loadSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const saved = JSON.parse(data);
      return { ...defaults, ...saved };
    }
  } catch (e) {
    console.log('⚠️ Could not load autostatus settings, using defaults');
  }
  return { ...defaults };
}

// Save settings to file
function saveSettings(state) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(state, null, 2));
    console.log('💾 Autostatus settings saved');
  } catch (e) {
    console.error('❌ Could not save autostatus settings:', e.message);
  }
}

// Initialize state from saved file or defaults
const state = loadSettings();

// Apply loaded settings to the live settings object
Object.keys(state).forEach(key => {
  if (settings.hasOwnProperty(key)) {
    settings[key] = state[key];
  }
});

registerCommand('autostatus', async ({ sock, message, args }) => {
  const jid = message.key.remoteJid;

  if (!args.length || args[0] === 'help') {
    const text =
      `⚙️ *Auto Status Settings*\n\n` +
      `Usage: .autostatus <option> <on/off>\n\n` +
      `*Current Status:*\n` +
      `├ 👁️ seen — Auto see status: ${state.autoStatusSeen ? '✅ ON' : '❌ OFF'}\n` +
      `├ 😍 react — Auto react to status: ${state.autoStatusReact ? '✅ ON' : '❌ OFF'}\n` +
      `├ 💬 reply — Auto reply to status: ${state.autoStatusReply ? '✅ ON' : '❌ OFF'}\n` +
      `├ 📨 reactall — Auto react to all msgs: ${state.autoReact ? '✅ ON' : '❌ OFF'}\n` +
      `├ 💬 replyall — Auto reply to all msgs: ${state.autoReply ? '✅ ON' : '❌ OFF'}\n` +
      `├ 👋 welcome — Welcome/goodbye: ${state.welcome ? '✅ ON' : '❌ OFF'}\n` +
      `├ 🔗 antilink — Anti-link: ${state.antiLink ? '✅ ON' : '❌ OFF'}\n` +
      `├ 🚫 antibad — Anti-bad words: ${state.antiBad ? '✅ ON' : '❌ OFF'}\n` +
      `├ 👁️‍🗨️ antivv — Anti-view-once: ${state.antiVV ? '✅ ON' : '❌ OFF'}\n` +
      `├ 🗑️ antidelete — Anti-delete: ${state.antiDelete ? '✅ ON' : '❌ OFF'}\n` +
      `├ 🟢 online — Always online: ${state.alwaysOnline ? '✅ ON' : '❌ OFF'}\n` +
      `├ ⌨️ typing — Auto typing: ${state.autoTyping ? '✅ ON' : '❌ OFF'}\n` +
      `├ 📖 readcmd — Read commands: ${state.readCmd ? '✅ ON' : '❌ OFF'}\n` +
      `└ 📖 readall — Read all messages: ${state.readMessage ? '✅ ON' : '❌ OFF'}\n\n` +
      `*Examples:*\n` +
      `.autostatus seen on\n` +
      `.autostatus react off\n` +
      `.autostatus all on\n\n` +
      `💾 *Settings are saved permanently*`;

    await sock.sendMessage(jid, { text });
    return;
  }

  const option = args[0].toLowerCase();
  const value = args[1]?.toLowerCase();

  if (!value || !['on', 'off'].includes(value)) {
    await sock.sendMessage(jid, {
      text: '❌ Usage: .autostatus <option> <on/off>\n\nExample: .autostatus seen on'
    });
    return;
  }

  const newValue = value === 'on';
  let updated = false;
  let featureName = '';

  const toggleMap = {
    'seen': ['autoStatusSeen', 'Auto Status Seen'],
    'react': ['autoStatusReact', 'Auto Status React'],
    'reply': ['autoStatusReply', 'Auto Status Reply'],
    'reactall': ['autoReact', 'Auto React (All Messages)'],
    'replyall': ['autoReply', 'Auto Reply (All Messages)'],
    'welcome': ['welcome', 'Welcome/Goodbye'],
    'antilink': ['antiLink', 'Anti-Link'],
    'antibad': ['antiBad', 'Anti-Bad Words'],
    'antivv': ['antiVV', 'Anti-View-Once'],
    'antidelete': ['antiDelete', 'Anti-Delete'],
    'online': ['alwaysOnline', 'Always Online'],
    'typing': ['autoTyping', 'Auto Typing'],
    'readcmd': ['readCmd', 'Read Commands'],
    'readall': ['readMessage', 'Read All Messages']
  };

  if (option === 'all') {
    // Toggle all features
    Object.keys(state).forEach(key => {
      state[key] = newValue;
      if (settings.hasOwnProperty(key)) {
        settings[key] = newValue;
      }
    });
    featureName = 'ALL FEATURES';
    updated = true;
  } else if (toggleMap[option]) {
    const [key, name] = toggleMap[option];
    state[key] = newValue;
    if (settings.hasOwnProperty(key)) {
      settings[key] = newValue;
    }
    featureName = name;
    updated = true;
  } else {
    await sock.sendMessage(jid, {
      text: `❌ Unknown option: ${option}\n\nUse .autostatus help to see all options.`
    });
    return;
  }

  if (updated) {
    // Save to file permanently
    saveSettings(state);

    const emoji = newValue ? '✅' : '❌';
    const status = newValue ? 'ENABLED' : 'DISABLED';

    await sock.sendMessage(jid, {
      text: `${emoji} *${featureName}* has been *${status}*\n\n💾 Saved permanently — survives restart!`
    });

    console.log(`⚙️ ${featureName}: ${status}`);
  }
});

// Export state for other modules
module.exports.state = state;
