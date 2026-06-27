const axios = require('axios');
const crypto = require('crypto');
const config = require('../config');
const logger = require('../utils/logger');

module.exports = {
  name: 'Tools',
  category: 'Tools',
  commands: ['qr', 'qrscan', 'ocr', 'password', 'uuid', 'base64', 'hash', 'calc', 'currency'],

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const command = msg.text.split(' ')[0].toLowerCase().substring(1);
    const payload = args.join(' ');

    try {
      if (command === 'qr') {
        if (!payload) return bot.sendMessage(chatId, '❌ Usage: `/qr [text or link]`', { parse_mode: 'Markdown' });
        const qrUrl = `${config.apis.qrServer}/?size=300x300&data=${encodeURIComponent(payload)}`;
        return bot.sendPhoto(chatId, qrUrl, { caption: '✨ QR Code structural array successfully compiled.' });
      }

      if (command === 'qrscan' || command === 'ocr') {
        if (!msg.reply_to_message || (!msg.reply_to_message.photo && !msg.reply_to_message.document)) {
          return bot.sendMessage(chatId, `❌ Usage: Reply directly to an image asset with \`/${command}\` to parse structure.`, { parse_mode: 'Markdown' });
        }

        const photoObj = msg.reply_to_message.photo ? msg.reply_to_message.photo.pop() : msg.reply_to_message.document;
        const fileId = photoObj.file_id;
        
        await bot.sendMessage(chatId, '⏳ *Downloading asset buffer and extracting visual data stream...*', { parse_mode: 'Markdown' });
        const fileLink = await bot.getFileLink(fileId);

        if (command === 'qrscan') {
          const scanUrl = `https://api.qrserver.com/v1/read-qr-code/?fileurl=${encodeURIComponent(fileLink)}`;
          const res = await axios.get(scanUrl);
          const parsedData = res.data?.[0]?.symbol?.[0]?.data;
          
          if (!parsedData) return bot.sendMessage(chatId, '❌ System failed to parse a legitimate QR structure within the image wrapper.');
          return bot.sendMessage(chatId, `✅ *QR Extraction Complete:*\n\n\`\`\`\n${parsedData}\n\`\`\``, { parse_mode: 'Markdown' });
        }

        if (command === 'ocr') {
          if (!config.apis.ocrSpace) return bot.sendMessage(chatId, '⚠️ OCR space engine API credential strings are missing on host engine.');
          const ocrUrl = `https://api.ocrspace.com/parse/imageurl?apikey=${config.apis.ocrSpace}&url=${encodeURIComponent(fileLink)}`;
          const res = await axios.get(ocrUrl);
          const parsedText = res.data?.ParsedResults?.[0]?.ParsedText;
          
          if (!parsedText) return bot.sendMessage(chatId, '❌ Structural Engine text extraction completed with an empty layout format.');
          return bot.sendMessage(chatId, `📝 *EXTRACTED TEXT STRINGS*\n\n\`\`\`\n${parsedText}\n\`\`\``, { parse_mode: 'Markdown' });
        }
      }

      if (command === 'password') {
        const length = parseInt(args[0], 10) || 16;
        if (length < 6 || length > 64) return bot.sendMessage(chatId, '❌ Password allocation boundaries must reside strictly between 6 and 64 character blocks.');
        const pass = crypto.randomBytes(length).toString('base64').substring(0, length);
        return bot.sendMessage(chatId, `🔐 *Secure Token Generated Successfully:*\n\n\`\`\`\n${pass}\n\`\`\``, { parse_mode: 'Markdown' });
      }

      if (command === 'uuid') {
        const generatedUuid = crypto.randomUUID();
        return bot.sendMessage(chatId, `🆔 *UUIDv4 Vector Allocated:*\n\n\`\`\`\n${generatedUuid}\n\`\`\``, { parse_mode: 'Markdown' });
      }

      if (command === 'base64') {
        const subAction = args[0] ? args[0].toLowerCase() : null;
        const targetText = args.slice(1).join(' ');
        if (!subAction || !targetText) return bot.sendMessage(chatId, '❌ Usage: `/base64 [encode/decode] [text]`', { parse_mode: 'Markdown' });

        if (subAction === 'encode') {
          const result = Buffer.from(targetText).toString('base64');
          return bot.sendMessage(chatId, `🔒 *Encoded Binary Standard:*\n\n\`\`\`\n${result}\n\`\`\``, { parse_mode: 'Markdown' });
        } else {
          const result = Buffer.from(targetText, 'base64').toString('utf8');
          return bot.sendMessage(chatId, `🔓 *Decoded Text Character Strings:*\n\n\`\`\`\n${result}\n\`\`\``, { parse_mode: 'Markdown' });
        }
      }

      if (command === 'hash') {
        const algorithm = args[0] ? args[0].toLowerCase() : null;
        const dataInput = args.slice(1).join(' ');
        const supportedHashes = ['md5', 'sha1', 'sha256'];
        
        if (!algorithm || !dataInput || !supportedHashes.includes(algorithm)) {
          return bot.sendMessage(chatId, '❌ Usage: `/hash [md5/sha1/sha256] [text]`', { parse_mode: 'Markdown' });
        }

        const hashedVal = crypto.createHash(algorithm).update(dataInput).digest('hex');
        return bot.sendMessage(chatId, `🧮 *Cryptographic Matrix Output (${algorithm.toUpperCase()}):*\n\n\`\`\`\n${hashedVal}\n\`\`\``, { parse_mode: 'Markdown' });
      }

      if (command === 'calc') {
        if (!payload) return bot.sendMessage(chatId, '❌ Usage: `/calc [mathematical expression]`\nExample: `/calc 2 + 5 * 10`', { parse_mode: 'Markdown' });
        
        // Block unsafe evaluation characters to enforce isolated structural arithmetic
        if (/[^0-9+\-*/().\s]/g.test(payload)) {
          return bot.sendMessage(chatId, '❌ Evaluation Blocked: Target expression contains malicious strings or programmatic variables.');
        }

        const evaluation = Function(`"use strict"; return (${payload})`)();
        return bot.sendMessage(chatId, `🧮 *ARITHMETIC CALCULATION COMPLETED*\n\n📈 *Expression:* \`${payload}\`\n📊 *Output Result:* \`${evaluation}\``, { parse_mode: 'Markdown' });
      }

      if (command === 'currency') {
        const amount = parseFloat(args[0]);
        const base = args[1] ? args[1].toUpperCase() : 'USD';
        const target = args[2] ? args[2].toUpperCase() : 'EUR';

        if (isNaN(amount) || !args[1] || !args[2]) {
          return bot.sendMessage(chatId, '❌ Usage: `/currency [amount] [from_code] [to_code]`\nExample: `/currency 100 USD EUR`', { parse_mode: 'Markdown' });
        }

        const currUrl = `${config.apis.frankfurter}/latest?amount=${amount}&from=${base}&to=${target}`;
        const res = await axios.get(currUrl);
        const derivedRate = res.data?.rates?.[target];

        if (!derivedRate) return bot.sendMessage(chatId, '❌ Could not pull specific conversion arrays. Check global ISO currency indicators.');
        return bot.sendMessage(chatId, `💱 *FINANCIAL CONVERSION INDEX*\n\n💵 Source Payload: *${amount} ${base}*\n💶 Exchanged Matrix: *${derivedRate} ${target}*`);
      }

    } catch (error) {
      logger.error(`Utility compilation structural fault on command /${command}:`, error);
      return bot.sendMessage(chatId, '❌ Critical utility handler exception returned during operational request tracking.');
    }
  }
};
            
