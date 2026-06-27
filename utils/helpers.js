"use strict";

/**
 * -------------------------------------------------------
 * MultiVerse Bot
 * utils/helpers.js
 * -------------------------------------------------------
 * Common reusable helper functions.
 * -------------------------------------------------------
 */

const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

/**
 * Sleep
 * @param {number} ms
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Random Integer
 */
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Random Array Item
 */
function pick(arr = []) {
    if (!arr.length) return null;
    return arr[random(0, arr.length - 1)];
}

/**
 * Capitalize
 */
function capitalize(text = "") {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Escape Telegram MarkdownV2
 */
function escapeMarkdown(text = "") {
    return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}

/**
 * Format Number
 */
function formatNumber(number) {
    return Number(number || 0).toLocaleString("en-IN");
}

/**
 * Format Date
 */
function formatDate(date = new Date()) {
    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata"
    }).format(date);
}

/**
 * Generate UUID
 */
function uuid() {
    return uuidv4();
}

/**
 * Generate Password
 */
function password(length = 12) {

    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?";

    let out = "";

    for (let i = 0; i < length; i++) {
        out += chars.charAt(random(0, chars.length - 1));
    }

    return out;
}

/**
 * SHA256 Hash
 */
function sha256(text = "") {
    return crypto
        .createHash("sha256")
        .update(String(text))
        .digest("hex");
}

/**
 * Base64 Encode
 */
function base64Encode(text = "") {
    return Buffer.from(String(text)).toString("base64");
}

/**
 * Base64 Decode
 */
function base64Decode(text = "") {
    return Buffer.from(String(text), "base64").toString();
}

/**
 * Is URL
 */
function isURL(text = "") {
    return /^https?:\/\/.+/i.test(text);
}

/**
 * Safe Telegram Send
 */
async function safeSend(bot, chatId, text, options = {}) {

    try {

        return await bot.sendMessage(chatId, text, {
            parse_mode: "Markdown",
            disable_web_page_preview: true,
            ...options
        });

    } catch (err) {

        try {

            return await bot.sendMessage(chatId, text, {
                disable_web_page_preview: true
            });

        } catch (_) {
            return null;
        }

    }

}

/**
 * Split Long Message
 */
function splitMessage(text = "", size = 4000) {

    const output = [];

    for (let i = 0; i < text.length; i += size) {
        output.push(text.substring(i, i + size));
    }

    return output;
}

/**
 * Pagination
 */
function paginate(array = [], page = 1, limit = 10) {

    const start = (page - 1) * limit;

    return array.slice(start, start + limit);
}

/**
 * Progress Bar
 */
function progress(current, total, length = 10) {

    const percent = total === 0 ? 0 : current / total;

    const filled = Math.round(length * percent);

    return "█".repeat(filled) + "░".repeat(length - filled);
}

/**
 * Human File Size
 */
function fileSize(bytes = 0) {

    const sizes = ["B", "KB", "MB", "GB", "TB"];

    if (bytes === 0) return "0 B";

    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    return (
        (bytes / Math.pow(1024, i)).toFixed(2) +
        " " +
        sizes[i]
    );

}

/**
 * Human Time
 */
function duration(seconds = 0) {

    seconds = Number(seconds);

    const h = Math.floor(seconds / 3600);

    const m = Math.floor((seconds % 3600) / 60);

    const s = Math.floor(seconds % 60);

    const out = [];

    if (h) out.push(`${h}h`);
    if (m) out.push(`${m}m`);
    out.push(`${s}s`);

    return out.join(" ");
}

module.exports = {

    sleep,

    random,

    pick,

    capitalize,

    escapeMarkdown,

    formatNumber,

    formatDate,

    uuid,

    password,

    sha256,

    base64Encode,

    base64Decode,

    isURL,

    safeSend,

    splitMessage,

    paginate,

    progress,

    fileSize,

    duration

};
