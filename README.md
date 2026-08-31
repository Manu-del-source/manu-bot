# 🤖 MANU-BOT

A powerful WhatsApp bot built with Node.js and Baileys, featuring 29 commands and auto features.

## ✨ Features

### 📋 29 Commands
| Category | Commands |
|----------|----------|
| **General** | menu, help, ping, alive, info, uptime, owner, quote, joke, fact |
| **Downloads** | play, video (YouTube) |
| **Media** | sticker, tts, translate |
| **Group** | tagall, kick, promote, demote, add, delete, who, rate, ship |
| **AI & Tools** | ai, weather, report |
| **Protection** | vv (view-once viewer) |
| **Settings** | autostatus (toggle features) |

### 🤖 Auto Features
- 👁️ Auto status seen
- 😍 Auto status react
- 👁️‍🗨️ Anti-view-once (captures view-once media)
- 🗑️ Anti-delete (resends deleted messages)
- 🔗 Anti-link (delete links in groups)
- 🚫 Anti-bad words
- 👋 Welcome/goodbye messages
- 💬 Auto reply
- 📨 Auto react
- 🟢 Always online

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- WhatsApp account

### Installation

```bash
# Clone the repository
git clone https://github.com/Manu-del-source/manu-bot.git
cd manu-bot

# Install dependencies
npm install

# Start the bot
npm start
```

### First Time Setup

1. Run `npm start`
2. Scan the QR code with WhatsApp (Settings → Linked Devices → Link a Device)
3. Bot will connect and start working!

## ⚙️ Configuration

### Settings File (`settings.js`)

Edit `settings.js` to customize your bot:

```javascript
module.exports = {
  botName: 'MANU-BOT',
  ownerName: 'Manu',
  ownerNumber: 'your_number',  // Your WhatsApp number
  prefix: '.',                  // Command prefix
  // ... more settings
};
```

### Environment Variables (`.env`)

Create a `.env` file for sensitive data:

```env
OWNER_NUMBER=254712345678
OWNER_NAME=Manu
```

## 📱 Commands

### General
| Command | Description |
|---------|-------------|
| `.menu` | Show all commands |
| `.help` | Show help |
| `.ping` | Test bot response |
| `.alive` | Check if bot is alive |
| `.info` | Bot info & stats |
| `.uptime` | Bot uptime |
| `.owner` | Show owner info |
| `.quote` | Random quote |
| `.joke` | Random joke |
| `.fact` | Random fact |

### Downloads
| Command | Description |
|---------|-------------|
| `.play <song>` | Play song from YouTube |
| `.video <video>` | Download video from YouTube |

### Media
| Command | Description |
|---------|-------------|
| `.sticker` | Convert image/video to sticker |
| `.tts <text>` | Text to speech |
| `.translate <lang> <text>` | Translate text |

### Group
| Command | Description |
|---------|-------------|
| `.tagall` | Mention everyone |
| `.kick @user` | Kick a member |
| `.promote @user` | Make someone admin |
| `.demote @user` | Remove admin |
| `.add <number>` | Add a member |
| `.delete` | Delete a message |
| `.who` | Pick random person |
| `.rate <thing>` | Rate something 0-100 |
| `.ship` | Ship two people |

### AI & Tools
| Command | Description |
|---------|-------------|
| `.ai <question>` | Chat with AI |
| `.weather <city>` | Check weather |
| `.report <issue>` | Report issue to owner |

### Protection
| Command | Description |
|---------|-------------|
| `.vv` | View view-once messages |

### Settings
| Command | Description |
|---------|-------------|
| `.autostatus` | Show all settings |
| `.autostatus <option> on/off` | Toggle feature |

#### Toggle Options:
```
seen, react, reply, reactall, replyall, welcome,
antilink, antibad, antivv, antidelete, online,
typing, readcmd, readall, all
```

Example:
```bash
.autostatus seen on
.autostatus react on
.autostatus antivv on
.autostatus antidelete on
```

## 🛡️ Auto Features

### Status Features
- **Auto Status Seen**: Automatically see all status updates
- **Auto Status React**: React to status with random emoji
- **Auto Status Reply**: Reply to status automatically

### Protection Features
- **Anti-View-Once**: Captures view-once photos/videos and sends to owner
- **Anti-Delete**: Resends deleted messages (text, image, video, audio)
- **Anti-Link**: Delete links in groups
- **Anti-Bad Words**: Delete bad words in groups

### Group Features
- **Welcome/Goodbye**: Welcome new members, goodbye leaving members
- **Admin Events**: Notify when someone is promoted/demoted

### Presence Features
- **Always Online**: Always show as online
- **Auto Typing**: Show typing indicator
- **Read Messages**: Auto read all messages
- **Read Commands**: Mark commands as read

## 📁 Project Structure

```
manu-bot/
├── commands/           # All command files
│   ├── menu.js
│   ├── ping.js
│   ├── sticker.js
│   ├── play.js
│   └── ... (29 commands)
├── lib/
│   ├── commands/
│   │   ├── registry.js    # Command registration
│   │   └── load.js        # Load all commands
│   └── whatsapp/
│       └── connection.js  # WhatsApp connection
├── sessions/           # WhatsApp session data
├── settings.js         # Bot settings
├── config.js           # Config from env
├── index.js            # Main entry point
├── package.json
└── autostatus.json     # Saved auto features (auto-created)
```

## 🔧 Troubleshooting

### Bot not responding to commands
1. Make sure bot shows "✅ MANU-BOT CONNECTED"
2. Try clearing sessions: `rm -rf sessions/*` then restart
3. Scan QR code again

### Slow response
1. Clean stale sessions: `rm -rf sessions/*`
2. Restart bot: `npm start`
3. Scan QR again

### Bad MAC errors
These are normal WhatsApp encryption errors. Clean sessions to fix:
```bash
rm -rf sessions/*
npm start
```

### View-once not working
1. Make sure anti-VV is enabled: `.autostatus antivv on`
2. View-once messages are auto-captured and sent to owner

## 📦 Dependencies

- `@whiskeysockets/baileys` - WhatsApp Web API
- `sharp` - Image processing
- `wa-sticker-formatter` - Sticker creation
- `ytdl-core` - YouTube download
- `node-fetch` - HTTP requests
- `pino` - Logger

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This bot is not affiliated with WhatsApp Inc. Use at your own risk. Misuse may result in account bans.

## 👨‍💻 Developer

**Manu** - [GitHub](https://github.com/Manu-del-source)

---

Made with ❤️ by MANU-BOT
