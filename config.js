const path = require('path');
require('dotenv').config();

const parseAdminIds = (envVal) => {
  try {
    if (!envVal) return [];
    if (envVal.startsWith('[')) {
      return JSON.parse(envVal);
    }
    return envVal.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
  } catch (error) {
    return [];
  }
};

const config = {
  token: process.env.TELEGRAM_BOT_TOKEN || '',
  adminIds: parseAdminIds(process.env.ADMIN_IDS),
  
  apis: {
    gemini: process.env.GEMINI_API_KEY || '',
    omdb: process.env.OMDB_API_KEY || '',
    ocrSpace: process.env.OCR_SPACE_API_KEY || '',
    news: process.env.NEWS_API_KEY || '',
    openMeteo: 'https://api.open-meteo.com/v1',
    joke: 'https://v2.jokeapi.dev',
    countries: 'https://restcountries.com/v3.1',
    frankfurter: 'https://api.frankfurter.app',
    dictionary: 'https://api.dictionaryapi.dev/api/v2/entries/en',
    wikipedia: 'https://en.wikipedia.org/w/api.php',
    qrServer: 'https://api.qrserver.com/v1',
    randomUser: 'https://randomuser.me/api/',
    cat: 'https://api.thecatapi.com/v1',
    dog: 'https://api.thedogapi.com/v1',
    nasa: 'https://api.nasa.gov/planetary/apod'
  },

  settings: {
    defaultTheme: process.env.DEFAULT_THEME || 'dark',
    defaultLanguage: process.env.DEFAULT_LANGUAGE || 'en',
    maintenanceMode: process.env.MAINTENANCE_MODE === 'true'
  },

  paths: {
    database: path.join(__dirname, 'database'),
    modules: path.join(__dirname, 'modules'),
    handlers: path.join(__dirname, 'handlers'),
    utils: path.join(__dirname, 'utils'),
    assets: path.join(__dirname, 'assets'),
    dbFiles: {
      users: path.join(__dirname, 'database', 'users.json'),
      system: path.join(__dirname, 'database', 'system.json')
    }
  }
};

module.exports = config;
