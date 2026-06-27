"use strict";

/**
 * --------------------------------------------------------
 * MultiVerse Bot
 * config.js
 * --------------------------------------------------------
 * Loads environment variables and exports a single
 * configuration object for the entire application.
 * --------------------------------------------------------
 */

const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

/**
 * Read ENV with fallback
 * @param {string} key
 * @param {string} fallback
 * @returns {string}
 */
function env(key, fallback = "") {
    return process.env[key] || fallback;
}

/**
 * Convert comma separated admin ids into array
 */
const adminIds = env("ADMIN_IDS")
    .split(",")
    .map(id => id.trim())
    .filter(Boolean);

if (env("ADMIN_ID")) {
    adminIds.push(env("ADMIN_ID"));
}

/**
 * Required variables
 */
const required = [
    "BOT_TOKEN"
];

const missing = required.filter(name => !env(name));

if (missing.length) {
    console.error("\n❌ Missing Required Environment Variables:\n");
    missing.forEach(v => console.error(`• ${v}`));
    console.error("\nPlease update your .env file.\n");
    process.exit(1);
}

const config = {

    app: {
        name: "MultiVerse Bot",
        version: "1.0.0",
        author: "OpenAI",
        environment: env("NODE_ENV", "production"),
        prefix: env("PREFIX", "/"),
        port: Number(env("PORT", 3000))
    },

    telegram: {
        token: env("BOT_TOKEN"),
        username: env("BOT_USERNAME")
    },

    admin: {
        owner: env("ADMIN_ID"),
        admins: [...new Set(adminIds)],
        isAdmin(id) {
            return this.admins.includes(String(id));
        }
    },

    api: {

        gemini: env("GEMINI_API_KEY"),

        news: env("NEWS_API_KEY"),

        omdb: env("OMDB_API_KEY"),

        ocrSpace: env("OCR_SPACE_API_KEY")
    },

    weather: {
        provider: env("WEATHER_PROVIDER", "open-meteo")
    },

    downloader: {
        ytDlpPath: env("YT_DLP_PATH", "yt-dlp")
    },

    cache: {
        ttl: Number(env("CACHE_TTL", 600))
    },

    logger: {
        level: env("LOG_LEVEL", "info")
    },

    defaults: {

        language: env("DEFAULT_LANGUAGE", "hi"),

        theme: env("DEFAULT_THEME", "premium"),

        notification:
            env("DEFAULT_NOTIFICATION", "true").toLowerCase() === "true"
    },

    timeout: Number(env("REQUEST_TIMEOUT", 30000)),

    paths: {

        root: __dirname,

        handlers: path.join(__dirname, "handlers"),

        modules: path.join(__dirname, "modules"),

        database: path.join(__dirname, "database"),

        utils: path.join(__dirname, "utils"),

        assets: path.join(__dirname, "assets"),

        logs: path.join(__dirname, "logs"),

        dbFile: path.resolve(env("DATABASE_PATH", "./database/data.json"))
    }

};

module.exports = Object.freeze(config);
