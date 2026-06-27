const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

module.exports = {
  name: 'Search',
  category: 'Search',
  commands: ['wikipedia', 'dictionary', 'movie', 'news', 'country'],

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const command = msg.text.split(' ')[0].toLowerCase().substring(1);
    const query = args.join(' ');

    if (!query) {
      return bot.sendMessage(chatId, `❌ Usage: \`/${command} [search query]\``, { parse_mode: 'Markdown' });
    }

    try {
      if (command === 'wikipedia') {
        const url = `${config.apis.wikipedia}?action=query&format=json&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(query)}`;
        const res = await axios.get(url);
        const pages = res.data?.query?.pages;
        const pageId = Object.keys(pages)[0];
        
        if (pageId === '-1' || !pages[pageId].extract) {
          return bot.sendMessage(chatId, '❌ No structured Wikipedia entry matches your target query terms.');
        }

        const extract = pages[pageId].extract.substring(0, 3500);
        return bot.sendMessage(chatId, `📚 *WIKIPEDIA ENCYCLOPEDIA ENTRY*\n\n📖 *Subject:* ${pages[pageId].title}\n\n${extract}`);
      }

      if (command === 'dictionary') {
        const url = `${config.apis.dictionary}/${encodeURIComponent(query)}`;
        const res = await axios.get(url).catch(() => null);
        
        if (!res || !res.data?.[0]) {
          return bot.sendMessage(chatId, '❌ Word tracking array returned no definable dictionary metadata.');
        }

        const data = res.data[0];
        const definition = data.meanings?.[0]?.definitions?.[0]?.definition || 'No definition text.';
        const partOfSpeech = data.meanings?.[0]?.partOfSpeech || 'N/A';

        return bot.sendMessage(chatId, `📖 *LEXICAL DICTIONARY TERM*\n\n🔤 *Word:* \`${data.word}\` (${partOfSpeech})\n\n💡 *Definition:* ${definition}`, { parse_mode: 'Markdown' });
      }

      if (command === 'movie') {
        if (!config.apis.omdb) return bot.sendMessage(chatId, '⚠️ Configuration Error: OMDb integration string data is missing.');
        const url = `http://www.omdbapi.com/?apikey=${config.apis.omdb}&t=${encodeURIComponent(query)}`;
        const res = await axios.get(url);

        if (res.data.Response === 'False') {
          return bot.sendMessage(chatId, `❌ OMDb Engine Error: ${res.data.Error || 'Movie not found.'}`);
        }

        const movieData = `🎬 *CINEMATIC PROFILING MATRIX*\n\n` +
                          `🎥 *Title:* ${res.data.Title}\n` +
                          `📅 *Year:* ${res.data.Year}\n` +
                          `⭐ *IMDb Rating:* ${res.data.imdbRating}\n" +
                          `🎭 *Genre:* ${res.data.Genre}\n` +
                          `📝 *Plot Outline:* ${res.data.Plot}`;

        if (res.data.Poster && res.data.Poster !== 'N/A') {
          return bot.sendPhoto(chatId, res.data.Poster, { caption: movieData });
        }
        return bot.sendMessage(chatId, movieData);
      }

      if (command === 'news') {
        if (!config.apis.news) return bot.sendMessage(chatId, '⚠️ Configuration Error: NewsAPI operational token is missing.');
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=3&apiKey=${config.apis.news}`;
        const res = await axios.get(url);

        if (!res.data.articles || res.data.articles.length === 0) {
          return bot.sendMessage(chatId, '❌ No timely current event print pieces found match your target query matrix.');
        }

        let newsReport = `📰 *NEWS HEADLINE CORRELATIONS FOR: ${query.toUpperCase()}*\n\n`;
        res.data.articles.forEach((art, index) => {
          newsReport += `${index + 1}️⃣ *${art.title}*\n🌐 _Source: ${art.source.name}_\n🔗 ${art.url}\n\n`;
        });

        return bot.sendMessage(chatId, newsReport, { disable_web_page_preview: true });
      }

      if (command === 'country') {
        const url = `${config.apis.countries}/name/${encodeURIComponent(query)}`;
        const res = await axios.get(url);

        if (!res.data || res.data.length === 0) {
          return bot.sendMessage(chatId, '❌ Country search query failed to locate structured geography profiles.');
        }

        const data = res.data[0];
        const nativeName = Object.values(data.name.nativeName || {})[0]?.common || 'N/A';
        
        const geographyStats = `🗺️ *GEOGRAPHIC DATA COMPILATION*\n\n` +
                               `🇺🇳 *Common Name:* ${data.name.common}\n` +
                               `🏛️ *Capital Core:* ${data.capital?.[0] || 'N/A'}\n` +
                               `🌍 *Continent Zone:* ${data.continents?.[0] || 'N/A'}\n` +
                               `👥 *Population Pool:* ${data.population.toLocaleString()}\n` +
                               `🗣️ *Native Designation:* ${nativeName}`;

        if (data.flags?.png) {
          return bot.sendPhoto(chatId, data.flags.png, { caption: geographyStats });
        }
        return bot.sendMessage(chatId, geographyStats);
      }

    } catch (error) {
      logger.error(`Search routing module faulted execution chain on /${command}:`, error);
      return bot.sendMessage(chatId, '❌ Search processing pipeline failed downstream connectivity protocols.');
    }
  }
};
          
