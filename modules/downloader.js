const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

module.exports = {
  name: 'Downloader',
  category: 'Downloader',
  commands: ['download', 'ytdl'],

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const url = args[0];

    if (!url) {
      return bot.sendMessage(chatId, '❌ Usage: `/download [URL]` or `/ytdl [URL]`\nSupported: Instagram, YouTube, TikTok, Facebook, Pinterest, Threads, X.', { parse_mode: 'Markdown' });
    }

    await bot.sendMessage(chatId, '📥 *Processing media request...* Analyzing streaming streams and payload pipelines.', { parse_mode: 'Markdown' });

    // Ensure assets download path cache layer exists safely
    const downloadDir = config.paths.assets;
    fs.ensureDirSync(downloadDir);

    const outputFilePath = path.join(downloadDir, `dl_${Date.now()}.mp4`);

    // Using localized yt-dlp framework parameters to capture binary media allocations safely
    const commandString = `yt-dlp -f "b[ext=mp4]/b" --max-filesize 45M --no-playlist -o "${outputFilePath}" "${url}"`;

    exec(commandString, async (error, stdout, stderr) => {
      if (error) {
        logger.error(`Media downloader binary thread faulted structural parameters: ${error.message}`);
        return bot.sendMessage(chatId, '❌ *Extraction Failure:* The target media engine could not parse or verify this particular pipeline configuration. Ensure it is a valid, public URL.');
      }

      try {
        if (!fs.existsSync(outputFilePath)) {
          return bot.sendMessage(chatId, '❌ *File Error:* System failed to fetch or write structural binary components to storage arrays.');
        }

        await bot.sendMessage(chatId, '🚀 *Payload resolved.* Transmitting payload assets to client window structure...');
        await bot.sendVideo(chatId, outputFilePath, { caption: '✨ Generated smoothly via MultiVerse Extractor.' });
        
        // Asynchronous clean up to ensure low memory ceiling preservation states
        fs.unlinkSync(outputFilePath);
      } catch (sendError) {
        logger.error('Error shipping extracted binary via network streams:', sendError);
        bot.sendMessage(chatId, '❌ *Transmission Error:* Internal limits intercepted or failed structural validation during binary deployment packaging.');
        if (fs.existsSync(outputFilePath)) {
          fs.unlinkSync(outputFilePath);
        }
      }
    });
  }
};
