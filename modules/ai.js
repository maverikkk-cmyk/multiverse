const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

module.exports = {
  name: 'AI',
  category: 'AI',
  commands: ['gemini', 'translate', 'explain', 'summarize'],

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const command = msg.text.split(' ')[0].toLowerCase().substring(1);
    const textPayload = args.join(' ');

    if (!textPayload) {
      return bot.sendMessage(chatId, `❌ Usage: \`/${command} [input text or question]\``, { parse_mode: 'Markdown' });
    }

    if (!config.apis.gemini) {
      return bot.sendMessage(chatId, '⚠️ Configuration Error: Gemini API credentials missing on this host environment.');
    }

    await bot.sendMessage(chatId, '🤖 *AI Engine processing input...* Communicating with linguistic modeling arrays.', { parse_mode: 'Markdown' });

    try {
      let refinedPrompt = textPayload;

      if (command === 'translate') {
        refinedPrompt = `Translate the following text into English structurally, preserving tone. If a specific target language or ISO code is specified at the beginning of the text, translate to that target language instead. Text:\n"${textPayload}"`;
      } else if (command === 'explain') {
        refinedPrompt = `Provide a comprehensive, granular, step-by-step technical explanation for the following concept or script block:\n"${textPayload}"`;
      } else if (command === 'summarize') {
        refinedPrompt = `Extract key architectural takeaways and produce a highly consolidated, bulleted executive summary of the following text:\n"${textPayload}"`;
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${config.apis.gemini}`;
      
      const payload = {
        contents: [
          {
            parts: [
              { text: refinedPrompt }
            ]
          }
        ]
      };

      const response = await axios.post(geminiUrl, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        return bot.sendMessage(chatId, '❌ The linguistic model returned an empty layout sequence or was blocked by filtering policies.');
      }

      // Handle Telegram max character transmission limits (4096 bytes) safely
      if (aiResponse.length > 4000) {
        const chunks = aiResponse.match(/[\s\S]{1,4000}/g) || [];
        for (const chunk of chunks) {
          await bot.sendMessage(chatId, chunk);
        }
        return;
      }

      return bot.sendMessage(chatId, aiResponse);

    } catch (error) {
      logger.error(`Linguistic engine processor failure during /${command} compilation:`, error);
      return bot.sendMessage(chatId, '❌ A validation or connection fault occurred while executing network requests against the upstream cognitive API.');
    }
  }
};
