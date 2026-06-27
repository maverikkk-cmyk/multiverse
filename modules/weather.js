const axios = require('axios');
const config = require('../config');
const cache = require('../utils/cache');
const logger = require('../utils/logger');

module.exports = {
  name: 'Weather',
  category: 'Weather',
  commands: ['weather', 'forecast'],

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const command = msg.text.split(' ')[0].toLowerCase().substring(1);
    const location = args.join(' ');

    if (!location) {
      return bot.sendMessage(chatId, `❌ Usage: /${command} [City Name]\nExample: /${command} New York`);
    }

    try {
      // 1. Geocoding Lookup via Open-Meteo Geocoding API
      const geoCacheKey = `geo:${location.toLowerCase().replace(/\s+/g, '')}`;
      let geoData = cache.get(geoCacheKey);

      if (!geoData) {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
        const geoRes = await axios.get(geoUrl);
        if (!geoRes.data.results || geoRes.data.results.length === 0) {
          return bot.sendMessage(chatId, `❌ Location \`${location}\` could not be resolved. Please verify the structural naming pattern.`, { parse_mode: 'Markdown' });
        }
        geoData = geoRes.data.results[0];
        cache.set(geoCacheKey, geoData, 3600); // Cache geocoding for 1 hour
      }

      const { latitude, longitude, name, country } = geoData;
      const weatherCacheKey = `weather:${latitude}:${longitude}:${command}`;
      let cachedResponse = cache.get(weatherCacheKey);

      if (cachedResponse) {
        return bot.sendMessage(chatId, cachedResponse, { parse_mode: 'Markdown' });
      }

      if (command === 'weather') {
        // Fetch Current Metrics, UV, and Air Quality (AQI) parameters
        const url = `${config.apis.openMeteo}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&daily=uv_index_max&timezone=auto`;
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi&timezone=auto`;

        const [weatherRes, aqiRes] = await Promise.all([
          axios.get(url),
          axios.get(aqiUrl).catch(() => ({ data: { current: { us_aqi: 'N/A' } } }))
        ]);

        const current = weatherRes.data.current;
        const uvMax = weatherRes.data.daily.uv_index_max[0];
        const aqi = aqiRes.data?.current?.us_aqi || 'N/A';

        const weatherOutput = `🌦 *CURRENT METEOROLOGICAL CONTEXT* 🌦\n\n` +
                              `📍 *Location:* ${name}, ${country}\n` +
                              `🌡 *Temperature:* ${current.temperature_2m}°C (Feels like: ${current.apparent_temperature}°C)\n` +
                              `💧 *Humidity:* ${current.relative_humidity_2m}%\n` +
                              `💨 *Wind Speed:* ${current.wind_speed_10m} km/h\n` +
                              `☀️ *UV Index:* ${uvMax}\n` +
                              `😷 *Air Quality Index (US AQI):* ${aqi}\n\n` +
                              `🌐 _Data provisioned via Open-Meteo telemetry frameworks._`;

        cache.set(weatherCacheKey, weatherOutput, 600); // Cache for 10 minutes
        return bot.sendMessage(chatId, weatherOutput, { parse_mode: 'Markdown' });
      }

      if (command === 'forecast') {
        const url = `${config.apis.openMeteo}/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto`;
        const res = await axios.get(url);
        const daily = res.data.daily;

        let forecastMsg = `📅 *3-DAY METEOROLOGICAL FORECAST* 📅\n` +
                          `📍 *Location:* ${name}, ${country}\n\n`;

        for (let i = 0; i < 3; i++) {
          const date = new Date(daily.time[i]).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          const maxTemp = daily.temperature_2m_max[i];
          const minTemp = daily.temperature_2m_min[i];
          forecastMsg += `• *${date}:* 🌡 High: ${maxTemp}°C | 📉 Low: ${minTemp}°C\n`;
        }

        cache.set(weatherCacheKey, forecastMsg, 1800); // Cache for 30 minutes
        return bot.sendMessage(chatId, forecastMsg, { parse_mode: 'Markdown' });
      }

    } catch (error) {
      logger.error('Meteorological subsystem integration failure:', error);
      return bot.sendMessage(chatId, '❌ Critical failure fetching data from remote meteorological servers.');
    }
  }
};
