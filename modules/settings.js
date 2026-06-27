const jsonDb = require('../database/jsonDb');

module.exports = {
  name: 'Settings',
  category: 'Settings',
  commands: ['settings', 'theme', 'language', 'notify'],

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const command = msg.text.split(' ')[0].toLowerCase().substring(1);

    const user = jsonDb.getUser(userId);

    if (command === 'settings') {
      const settingsMsg = `⚙️ *MULTIVERSE INTERFACE CONFIGURATION*\n\n` +
                          `🎨 *Current Theme:* \`${user.settings?.theme || 'dark'}\`\n` +
                          `🌐 *System Language:* \`${(user.settings?.language || 'en').toUpperCase()}\`\n` +
                          `🔔 *Global Notifications:* \`${user.settings?.notifications ? 'ENABLED' : 'DISABLED'}\`\n\n` +
                          `💡 *Adjust Configuration via Commands:* \n` +
                          `• \`/theme [light/dark]\` - Mutate environment contrast.\n` +
                          `• \`/language [en/es/fr]\` - Swap global localized translations.\n` +
                          `• \`/notify [on/off]\` - Adjust systemic transaction alerts.`;
      
      return bot.sendMessage(chatId, settingsMsg, { parse_mode: 'Markdown' });
    }

    if (command === 'theme') {
      const selectedTheme = args[0] ? args[0].toLowerCase() : null;
      if (!selectedTheme || (selectedTheme !== 'light' && selectedTheme !== 'dark')) {
        return bot.sendMessage(chatId, '❌ Invalid Syntax. Parameter syntax structure: `/theme [light/dark]`');
      }

      jsonDb.updateUser(userId, {
        settings: {
          ...user.settings,
          theme: selectedTheme
        }
      });

      return bot.sendMessage(chatId, `✅ *Configuration Updated:* Structural system UI theme shifted to \`${selectedTheme}\`.`, { parse_mode: 'Markdown' });
    }

    if (command === 'language') {
      const selectedLang = args[0] ? args[0].toLowerCase() : null;
      const validLangs = ['en', 'es', 'fr'];
      if (!selectedLang || !validLangs.includes(selectedLang)) {
        return bot.sendMessage(chatId, '❌ Invalid Language. Supported parameters: `/language [en/es/fr]`');
      }

      jsonDb.updateUser(userId, {
        settings: {
          ...user.settings,
          language: selectedLang
        }
      });

      return bot.sendMessage(chatId, `✅ *Configuration Updated:* App localization framework mutated to \`${selectedLang.toUpperCase()}\`.`, { parse_mode: 'Markdown' });
    }

    if (command === 'notify') {
      const statusInput = args[0] ? args[0].toLowerCase() : null;
      if (!statusInput || (statusInput !== 'on' && statusInput !== 'off')) {
        return bot.sendMessage(chatId, '❌ Invalid Input State. Core syntax payload: `/notify [on/off]`');
      }

      const notificationsOn = statusInput === 'on';
      jsonDb.updateUser(userId, {
        settings: {
          ...user.settings,
          notifications: notificationsOn
        }
      });

      return bot.sendMessage(chatId, `✅ *Configuration Updated:* Push operational updates are now *${notificationsOn ? 'ENABLED' : 'DISABLED'}*.`, { parse_mode: 'Markdown' });
    }
  }
};
