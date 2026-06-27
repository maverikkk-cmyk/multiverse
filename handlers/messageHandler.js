const jsonDb = require('../database/jsonDb');
const pluginLoader = require('./pluginLoader');
const logger = require('../utils/logger');
const config = require('../config');

const messageHandler = (bot) => {
  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    
    const userId = msg.from.id;
    const systemData = jsonDb.getSystem();
    
    if (jsonDb.isBanned(userId)) return;
    
    if (systemData.settings.maintenanceMode && !config.adminIds.includes(userId)) {
      await bot.sendMessage(msg.chat.id, '⚠️ The bot is currently undergoing scheduled maintenance. Please try again later.');
      return;
    }
    
    jsonDb.getUser(userId);
  });

  bot.onText(/^\/([a-zA-Z0-9_]+)(?:\s+(.+))?$/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const commandName = match[1].toLowerCase();
    const args = match[2] ? match[2].trim().split(/\s+/) : [];
    
    const systemData = jsonDb.getSystem();
    
    if (jsonDb.isBanned(userId)) return;
    
    if (systemData.settings.maintenanceMode && !config.adminIds.includes(userId)) {
      await bot.sendMessage(chatId, '⚠️ The bot is currently undergoing scheduled maintenance. Please try again later.');
      return;
    }
    
    const user = jsonDb.getUser(userId);
    
    const plugin = pluginLoader.getPluginByCommand(commandName);
    if (!plugin) return;
    
    if (plugin.category === 'Admin' && !config.adminIds.includes(userId)) {
      await bot.sendMessage(chatId, '❌ Access Denied: This command is restricted to administrative accounts only.');
      return;
    }
    
    try {
      jsonDb.updateUser(userId, {
        xp: (user.xp || 0) + 2,
        commandsUsed: (user.commandsUsed || 0) + 1
      });
      
      jsonDb.updateSystemStats('command', commandName);
      
      await plugin.execute(bot, msg, args);
    } catch (error) {
      logger.error(`Error processing command /${commandName}:`, error);
      await bot.sendMessage(chatId, '❌ An unexpected internal error occurred while executing this command.');
    }
  });
};

module.exports = messageHandler;
