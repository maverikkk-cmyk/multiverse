const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

const logFile = path.join(config.paths.database, 'system.log');

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, message, error) => {
  let output = `[${getTimestamp()}] [${level}]: ${message}`;
  if (error) {
    output += `\nStack: ${error.stack || error}`;
  }
  return output;
};

const writeToFile = (text) => {
  try {
    fs.ensureDirSync(config.paths.database);
    fs.appendFileSync(logFile, text + '\n', 'utf8');
  } catch (err) {
    console.error('Failed to write log to file:', err);
  }
};

const logger = {
  info: (message) => {
    const formatted = formatMessage('INFO', message);
    console.log(formatted);
    writeToFile(formatted);
  },

  warn: (message) => {
    const formatted = formatMessage('WARN', message);
    console.warn(formatted);
    writeToFile(formatted);
  },

  error: (message, error = null) => {
    const formatted = formatMessage('ERROR', message, error);
    console.error(formatted);
    writeToFile(formatted);
  },

  debug: (message) => {
    if (process.env.NODE_ENV !== 'production') {
      const formatted = formatMessage('DEBUG', message);
      console.log(formatted);
      writeToFile(formatted);
    }
  },

  getLogs: (linesCount = 100) => {
    try {
      if (!fs.existsSync(logFile)) return 'No logs available.';
      const content = fs.readFileSync(logFile, 'utf8');
      const lines = content.trim().split('\n');
      return lines.slice(-linesCount).join('\n');
    } catch (err) {
      return `Failed to read logs: ${err.message}`;
    }
  },

  clearLogs: () => {
    try {
      if (fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, '', 'utf8');
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }
};

module.exports = logger;
