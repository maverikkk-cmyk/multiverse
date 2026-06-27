"use strict";

/**
 * -------------------------------------------------------
 * MultiVerse Bot
 * Logger Utility
 * -------------------------------------------------------
 * Features:
 * - Daily log files
 * - Colored console logs
 * - Log levels
 * - Auto log directory creation
 * - Error stack logging
 * -------------------------------------------------------
 */

const fs = require("fs-extra");
const path = require("path");
const config = require("../config");

const LOG_DIR = config.paths.logs;

fs.ensureDirSync(LOG_DIR);

function pad(value) {
    return String(value).padStart(2, "0");
}

function currentDate() {
    const d = new Date();

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function currentTime() {
    const d = new Date();

    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const COLORS = {
    reset: "\x1b[0m",
    blue: "\x1b[34m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m"
};

const LEVELS = {
    info: 0,
    success: 1,
    warn: 2,
    error: 3,
    debug: 4
};

const activeLevel = config.logger.level.toLowerCase();

function shouldLog(level) {
    if (!(activeLevel in LEVELS)) return true;
    return LEVELS[level] >= LEVELS[activeLevel];
}

function write(level, message) {

    if (!shouldLog(level)) return;

    const stamp = `[${currentDate()} ${currentTime()}]`;

    const line = `${stamp} [${level.toUpperCase()}] ${message}`;

    const logfile = path.join(LOG_DIR, `${currentDate()}.log`);

    fs.appendFileSync(logfile, line + "\n");

    let color = COLORS.reset;

    switch (level) {
        case "info":
            color = COLORS.cyan;
            break;

        case "success":
            color = COLORS.green;
            break;

        case "warn":
            color = COLORS.yellow;
            break;

        case "error":
            color = COLORS.red;
            break;

        case "debug":
            color = COLORS.magenta;
            break;
    }

    console.log(color + line + COLORS.reset);
}

const logger = {

    info(message) {
        write("info", message);
    },

    success(message) {
        write("success", message);
    },

    warn(message) {
        write("warn", message);
    },

    error(message) {

        if (message instanceof Error) {
            write("error", `${message.message}\n${message.stack}`);
            return;
        }

        write("error", String(message));
    },

    debug(message) {
        write("debug", message);
    }
};

/**
 * Global Exception Logging
 */

process.on("uncaughtException", err => {
    logger.error(err);
});

process.on("unhandledRejection", err => {
    logger.error(err);
});

module.exports = logger;
