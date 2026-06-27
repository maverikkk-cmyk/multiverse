File Name: modules/fun.js
Purpose: Entertainment engine delivering jokes, memes, roasts, random quotes, truth or dare mechanics, trivia facts, and riddles using public free REST APIs or built-in static databases.
Complete Code:
```javascript
const axios = require('axios');
const config = require('../config');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

const fallbackQuotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt" },
  { text: "The purpose of our lives is to be happy.", author: "Dalai Lama" }
];

const truths = [
  "What is your biggest fear in a relationship?",
  "What is the most embarrassing thing you've ever done?",
  "Have you ever lied to your best friend?"
];

const dares = [
  "Send a screenshot of your home screen to the group chat.",
  "Do 20 pushups right now.",
  "Sing the chorus of your favorite song out loud."
];

const facts = [
  "Honey never spoils. You could theoretically eat 3,000-year-old Egyptian tomb honey.",
  "Bananas are berries, but strawberries aren't.",
  "Wombat poop is cube-shaped."
];

const riddles = [
  { q: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", a: "An echo" },
  { q: "What has keys but can't open a single lock?", a: "A piano" }
];

module.exports = {
  name: 'Fun',
  category: 'Fun',
  commands: ['meme', 'joke', 'roast', 'insult', 'quote', 'truth', 'dare', 'fact', 'riddle'],

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const command = msg.text.split(' ')[0].toLowerCase().substring(1);

    try {
      if (command === 'meme') {
        const res = await axios.get(`${config.apis.cat}/images/search`);
        if (res.data && res.data[0]?.url) {
          return bot.sendPhoto(chatId, res.data[0].url, { caption: '🐱 Here is a random cat asset for your amusement!' });
        }
        return bot.sendMessage(chatId, '❌ Failed to capture image streams at this time.');
      }

      if (command === 'joke') {
        const res = await axios.get(`${config.apis.joke}/joke/Any?type=single`);
        const jokeStr = res.data.joke || `${res.data.setup}\n\n_– ${res.data.delivery}_`;
        return bot.sendMessage(chatId, `😂 *JOKE COMPONENT*\n\n${jokeStr}`, { parse_mode: 'Markdown' });
      }

      if (command === 'roast' || command === 'insult') {
        return bot.sendMessage(chatId, `🔥 *ROAST ENGINE:* You are like a cloud. When you disappear, it's a beautiful day.`);
      }

      if (command === 'quote') {
        const quote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        return bot.sendMessage(chatId, `💬 *INSPIRATIONAL QUOTE*\n\n"${quote.text}"\n\n_— ${quote.author}_`, { parse_mode: 'Markdown' });
      }

      if (command === 'truth') {
        const item = truths[Math.floor(Math.random() * truths.length)];
        return bot.sendMessage(chatId, `❓ *TRUTH:* ${item}`);
      }

      if (command === 'dare') {
        const item = dares[Math.floor(Math.random() * dares.length)];
        return bot.sendMessage(chatId, `⚡ *DARE:* ${item}`);
      }

      if (command === 'fact') {
        const item = facts[Math.floor(Math.random() * facts.length)];
        return bot.sendMessage(chatId, `💡 *DID YOU KNOW?*\n\n${item}`);
      }

      if (command === 'riddle') {
        const sub = args[0] ? args[0].toLowerCase() : null;
        const cacheKey = `riddle:${chatId}`;
        
        if (sub === 'answer') {
          const stored = cache.get(cacheKey);
          if (!stored) return bot.sendMessage(chatId, '❌ No active riddle running in this thread context.');
          cache.delete(cacheKey);
          return bot.sendMessage(chatId, `🧠 *ANSWER:* ${stored}`);
        }

        const item = riddles[Math.floor(Math.random() * riddles.length)];
        cache.set(cacheKey, item.a, 120);
        return bot.sendMessage(chatId, `🧠 *RIDDLE TIME*\n\n${item.q}\n\n💡 _Think carefully! Reply with_ \`/riddle answer\` _to reveal the solution._`, { parse_mode: 'Markdown' });
      }

    } catch (error) {
      logger.error(`Fun engine module operational exception on /${command}:`, error);
      return bot.sendMessage(chatId, '❌ An unexpected glitch hit the entertainment routing processor.');
    }
  }
};

```
  
