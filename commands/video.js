const { registerCommand } = require('../lib/commands/registry');
const ytdl = require('ytdl-core');

registerCommand('video', async ({ sock, message, args }) => {
  const jid = message.key.remoteJid;

  if (!args.length) {
    await sock.sendMessage(jid, {
      text: '🎬 *Video Command*\n\nUsage: .video <video name>\n\nExample: .video funny cats'
    });
    return;
  }

  try {
    const query = args.join(' ');
    await sock.sendMessage(jid, { text: `🔍 Searching: *${query}*...` });

    let videoUrl;
    let videoTitle;
    let videoDuration;
    let videoViews;

    try {
      const searchResult = await ytdl.getInfo(`ytsearch:${query}`);
      videoUrl = searchResult.videoDetails.video_url;
      videoTitle = searchResult.videoDetails.title;
      videoDuration = searchResult.videoDetails.lengthSeconds;
      videoViews = searchResult.videoDetails.viewCount;
    } catch (searchErr) {
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

    if (parseInt(videoDuration) > 300) {
      await sock.sendMessage(jid, { text: '❌ Video too long! Maximum 5 minutes.' });
      return;
    }

    await sock.sendMessage(jid, {
      text: `🎬 *Downloading Video*\n\n` +
        `📝 *Title:* ${videoTitle}\n` +
        `⏱️ *Duration:* ${duration}\n` +
        `👀 *Views:* ${Number(videoViews).toLocaleString()}\n` +
        `🔗 *URL:* ${videoUrl}\n\n` +
        `⏳ Please wait...`
    });

    const stream = ytdl(videoUrl, {
      filter: 'videoandaudio',
      quality: 'highest'
    });

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    await sock.sendMessage(jid, {
      video: buffer,
      caption: `🎬 *${videoTitle}*\n\n🤖 MANU-BOT`
    });

    console.log(`✅ Video sent: ${videoTitle}`);

  } catch (error) {
    console.error('❌ Video error:', error.message);
    await sock.sendMessage(jid, {
      text: '❌ Failed to download video. Please try again.'
    });
  }
});

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
