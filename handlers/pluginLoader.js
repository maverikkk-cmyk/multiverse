const fs = require('fs-extra');
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

const plugins = new Map();

const pluginLoader = {
  loadPlugins: () => {
    try {
      plugins.clear();
      fs.ensureDirSync(config.paths.modules);
      
      const files = fs.readdirSync(config.paths.modules);
      
      for (const file of files) {
        const fullPath = path.join(config.paths.modules, file);
        if (fs.statSync(fullPath).isFile() && file.endsWith('.js')) {
          try {
            delete require.cache[require.resolve(fullPath)];
            const plugin = require(fullPath);
            
            if (!plugin.name || !plugin.commands || !Array.isArray(plugin.commands) || !plugin.execute) {
              logger.warn(`Skipping invalid plugin file: ${file}. Missing name, commands, or execute function.`);
              continue;
            }
            
            plugins.set(plugin.name, plugin);
            logger.info(`Successfully loaded plugin: [${plugin.name}] from ${file}`);
          } catch (err) {
            logger.error(`Error loading plugin file ${file}:`, err);
          }
        }
      }
      logger.info(`Plugin loader execution completed. Total plugins active: ${plugins.size}`);
    } catch (globalErr) {
      logger.error('Critical failure in plugin loader mechanism:', globalErr);
    }
  },

  getPlugins: () => {
    return plugins;
  },

  getPluginByCommand: (commandName) => {
    const lowerCmd = commandName.toLowerCase();
    for (const [_, plugin] of plugins.entries()) {
      if (plugin.commands.map(c => c.toLowerCase()).includes(lowerCmd)) {
        return plugin;
      }
    }
    return null;
  }
};

module.exports = pluginLoader;
