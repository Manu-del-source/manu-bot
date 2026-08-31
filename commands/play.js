const { registerCommand } = require('../lib/commands/registry');
const ytdl = require('ytdl-core');
const fetch = require('node-fetch');

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

    // Search YouTube using ytdl-core search
    let videoUrl;
    let videoTitle;
    let videoDuration;
    let videoViews;

    try {
      // Use ytdl-core to search
      const searchResult = await ytdl.getInfo(`ytsearch:${query}`);
      videoUrl = searchResult.videoDetails.video_url;
      videoTitle = searchResult.videoDetails.title;
      videoDuration = searchResult.videoDetails.lengthSeconds;
      videoViews = searchResult.videoDetails.viewCount;
    } catch (searchErr) {
      // Fallback: try direct URL if query looks like a URL
      if (ytdl.validateURL(query)) {
        const info = await ytdl.getInfo(query);
        videoUrl = info.videoDetails.video_url;
        videoTitle = info.videoDetails.title;
        videoDuration = info.videoDetails.lengthSeconds;
        videoViews = info.videoDetails.viewCount;
      } else {
        throw new Error('Could not find video');
      }
    }

    const duration = formatDuration(parseInt(videoDuration));

    if (parseInt(videoDuration) > 600) {
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
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
