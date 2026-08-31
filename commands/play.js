const { registerCommand } = require('../lib/commands/registry');
const { YouTube } = require('youtube-sr');
const ytdl = require('ytdl-core');

registerCommand('play', async ({ sock, message, args }) => {
  const jid = message.key.remoteJid;

  if (!args.length) {
    await sock.sendMessage(jid, {
      text: '🎵 *Play Command*\n\nUsage: .play <song name>\n\nExample: .play shape of you'
    });
    return;
  }

  try {
    const query = args.join(' ');
    await sock.sendMessage(jid, { text: `🔍 Searching: *${query}*...` });

    // Search YouTube
    const results = await YouTube.search(query, { limit: 1 });

    if (!results || !results.length) {
      await sock.sendMessage(jid, { text: '❌ No results found.' });
      return;
    }

    const video = results[0];
    const videoUrl = video.url;
    const videoTitle = video.title;
    const videoDuration = video.duration?.seconds || 0;
    const videoViews = video.views || 0;

    const duration = formatDuration(videoDuration);

    if (videoDuration > 600) {
      await sock.sendMessage(jid, { text: '❌ Video too long! Maximum 10 minutes.' });
      return;
    }

    await sock.sendMessage(jid, {
      text: `🎵 *Downloading Audio*\n\n` +
        `📝 *Title:* ${videoTitle}\n` +
        `⏱️ *Duration:* ${duration}\n` +
        `👀 *Views:* ${Number(videoViews).toLocaleString()}\n` +
        `🔗 *URL:* ${videoUrl}\n\n` +
        `⏳ Please wait...`
    });

    const stream = ytdl(videoUrl, {
      filter: 'audioonly',
      quality: 'highestaudio'
    });

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    await sock.sendMessage(jid, {
      audio: buffer,
      mimetype: 'audio/mpeg',
      ptt: false
    });

    console.log(`✅ Audio sent: ${videoTitle}`);

  } catch (error) {
    console.error('❌ Play error:', error.message);
    await sock.sendMessage(jid, {
      text: '❌ Failed to download audio. Please try again.'
    });
  }
});

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
