const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const logger = require('./utils/logger');
const jsonDb = require('./database/jsonDb');
const pluginLoader = require('./handlers/pluginLoader');
const messageHandler = require('./handlers/messageHandler');

const initBotApplication = async () => {
  logger.info('Initializing MultiVerse Bot structural initialization protocols...');

  if (!config.token) {
    logger.error('CRITICAL FAULT: Telegram Bot Token payload is completely missing in host environment. Process aborted.');
    process.exit(1);
  }

  try {
    // Instantiate polling thread interface
    const bot = new TelegramBot(config.token, { polling: true });

    // Execute plugin registration routines
    pluginLoader.loadPlugins();

    // Bind event controllers to processing engine
    messageHandler(bot);

    // Register baseline slash operations natively to the Telegram interface framework
    const structuralCommands = [];
    for (const [_, plugin] of pluginLoader.getPlugins().entries()) {
      if (plugin.category !== 'Admin') {
        plugin.commands.forEach(cmd => {
          structuralCommands.push({
            command: cmd.toLowerCase(),
            description: `Triggers the architectural ${plugin.name} runtime workflow module.`
          });
        });
      }
    }

    await bot.setMyCommands(structuralCommands);
    logger.info('Natively provisioned active UI functional command listings.');

    // Fetch administrative registry parameters to broadcast runtime status updates
    const systemState = jsonDb.getSystem();
    if (config.adminIds && config.adminIds.length > 0) {
      config.adminIds.forEach(adminId => {
        bot.sendMessage(adminId, `🚀 *MULTIVERSE BOT RUNTIME ONLINE*\n\n⚙️ Core architecture successfully constructed.\n📂 Database mappings authenticated.\n🔌 Plugins dynamically linked: *${pluginLoader.getPlugins().size}* active.`, { parse_mode: 'Markdown' })
          .catch(() => {});
      });
    }

    logger.info('MultiVerse Bot is fully operational and safely polling downstream sockets.');

    // Handle standard execution lifecycle signal events to cleanly close handles
    process.on('SIGINT', () => {
      logger.warn('SIGINT received. Closing active threads and winding down execution pools.');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.warn('SIGTERM received. Winding down system daemon layers securely.');
      process.exit(0);
    });

  } catch (criticalErr) {
    logger.error('Fatal initialization collision crashed initialization pipeline:', criticalErr);
    process.exit(1);
  }
};

initBotApplication();
