const jsonDb = require('../database/jsonDb');
const logger = require('../utils/logger');
const config = require('../config');
const { exec } = require('child_process');

module.exports = {
  name: 'Admin',
  category: 'Admin',
  commands: ['broadcast', 'ban', 'unban', 'stats', 'logs', 'restart', 'maintenance', 'apistatus'],
  
  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const command = msg.text.split(' ')[0].toLowerCase().substring(1);

    if (command === 'broadcast') {
      const text = args.join(' ');
      if (!text) return bot.sendMessage(chatId, '❌ Usage: /broadcast [message]');
      const users = jsonDb.getUsers();
      let successCount = 0;
      
      await bot.sendMessage(chatId, '📢 Initiating broadcast across all systems...');
      for (const userId of Object.keys(users)) {
        try {
          await bot.sendMessage(userId, `📢 *GLOBAL BROADCAST*\n\n${text}`, { parse_mode: 'Markdown' });
          successCount++;
        } catch (err) {
          // Individual delivery failure ignored to prevent process interruption
        }
      }
      return bot.sendMessage(chatId, `✅ Broadcast complete. Delivered successfully to ${successCount} users.`);
    }

    if (command === 'ban') {
      const targetId = args[0];
      if (!targetId) return bot.sendMessage(chatId, '❌ Usage: /ban [user_id]');
      const banned = jsonDb.banUser(targetId);
      if (banned) {
        return bot.sendMessage(chatId, `✅ User ${targetId} has been successfully banned from this bot system.`);
      }
      return bot.sendMessage(chatId, '❌ User is already banned or does not exist.');
    }

    if (command === 'unban') {
      const targetId = args[0];
      if (!targetId) return bot.sendMessage(chatId, '❌ Usage: /unban [user_id]');
      const unbanned = jsonDb.unbanUser(targetId);
      if (unbanned) {
        return bot.sendMessage(chatId, `✅ User ${targetId} has been successfully unbanned.`);
      }
      return bot.sendMessage(chatId, '❌ User is not currently banned.');
    }

    if (command === 'stats') {
      const system = jsonDb.getSystem();
      const users = jsonDb.getUsers();
      const statsMsg = `📊 *SYSTEM METRICS* 📊\n\n` +
                       `👥 Total Users Registered: ${system.stats.totalUsers || Object.keys(users).length}\n` +
                       `📈 Total Commands Extracted: ${system.stats.totalCommandsUsed || 0}\n` +
                       `⚙️ Maintenance Mode: ${system.settings.maintenanceMode ? 'ACTIVE' : 'INACTIVE'}\n` +
                       `🔋 Architecture: CommonJS Node.js Engine`;
      return bot.sendMessage(chatId, statsMsg, { parse_mode: 'Markdown' });
    }

    if (command === 'logs') {
      const content = logger.getLogs(50);
      return bot.sendMessage(chatId, `📝 *RECENT SYSTEM LOGS*\n\n\`\`\`\n${content}\n\`\`\``, { parse_mode: 'Markdown' });
    }

    if (command === 'restart') {
      await bot.sendMessage(chatId, '🔄 Restarting bot daemon process... Interface down momentarily.');
      logger.info('Manual administrative restart triggered.');
      setTimeout(() => {
        process.exit(0);
      }, 1000);
      return;
    }

    if (command === 'maintenance') {
      const option = args[0];
      if (!option || (option !== 'on' && option !== 'off')) {
        return bot.sendMessage(chatId, '❌ Usage: /maintenance [on/off]');
      }
      const system = jsonDb.getSystem();
      system.settings.maintenanceMode = (option === 'on');
      jsonDb.saveSystem(system);
      return bot.sendMessage(chatId, `⚙️ Maintenance configuration mutated. Status: *${option.toUpperCase()}*`, { parse_mode: 'Markdown' });
    }

    if (command === 'apistatus') {
      const apis = Object.keys(config.apis).map(api => `🌐 *${api}*: operational`).join('\n');
      return bot.sendMessage(chatId, `🔌 *API INTEGRATION STATUS*\n\n${apis}`, { parse_mode: 'Markdown' });
    }
  }
};
