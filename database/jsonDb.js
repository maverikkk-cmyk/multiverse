const fs = require('fs-extra');
const config = require('../config');
const logger = require('../utils/logger');

const initializeDatabase = () => {
  try {
    fs.ensureDirSync(config.paths.database);

    if (!fs.existsSync(config.paths.dbFiles.users)) {
      fs.writeJsonSync(config.paths.dbFiles.users, {}, { spaces: 2 });
      logger.info('Initialized users database file.');
    }

    if (!fs.existsSync(config.paths.dbFiles.system)) {
      const defaultSystemSchema = {
        settings: {
          maintenanceMode: config.settings.maintenanceMode,
          theme: config.settings.defaultTheme,
          language: config.settings.defaultLanguage
        },
        stats: {
          totalCommandsUsed: 0,
          commandsBreakdown: {},
          totalUsers: 0
        },
        bannedUsers: []
      };
      fs.writeJsonSync(config.paths.dbFiles.system, defaultSystemSchema, { spaces: 2 });
      logger.info('Initialized system database file.');
    }
  } catch (error) {
    logger.error('Database initialization failed:', error);
  }
};

initializeDatabase();

const jsonDb = {
  getUsers: () => {
    try {
      return fs.readJsonSync(config.paths.dbFiles.users);
    } catch (error) {
      logger.error('Failed to read users database:', error);
      return {};
    }
  },

  saveUsers: (data) => {
    try {
      fs.writeJsonSync(config.paths.dbFiles.users, data, { spaces: 2 });
      return true;
    } catch (error) {
      logger.error('Failed to write users database:', error);
      return false;
    }
  },

  getUser: (userId) => {
    const users = jsonDb.getUsers();
    if (!users[userId]) {
      users[userId] = {
        id: parseInt(userId, 10),
        xp: 0,
        dailyReward: {
          lastClaimed: null
        },
        joinDate: new Date().toISOString(),
        commandsUsed: 0,
        settings: {
          theme: config.settings.defaultTheme,
          language: config.settings.defaultLanguage,
          notifications: true
        }
      };
      jsonDb.saveUsers(users);
      jsonDb.updateSystemStats('totalUsers', Object.keys(users).length);
    }
    return users[userId];
  },

  updateUser: (userId, updatedFields) => {
    const users = jsonDb.getUsers();
    if (!users[userId]) {
      jsonDb.getUser(userId);
    }
    users[userId] = {
      ...users[userId],
      ...updatedFields,
      settings: {
        ...(users[userId]?.settings || {}),
        ...(updatedFields.settings || {})
      },
      dailyReward: {
        ...(users[userId]?.dailyReward || {}),
        ...(updatedFields.dailyReward || {})
      }
    };
    return jsonDb.saveUsers(users);
  },

  getSystem: () => {
    try {
      return fs.readJsonSync(config.paths.dbFiles.system);
    } catch (error) {
      logger.error('Failed to read system database:', error);
      return {};
    }
  },

  saveSystem: (data) => {
    try {
      fs.writeJsonSync(config.paths.dbFiles.system, data, { spaces: 2 });
      return true;
    } catch (error) {
      logger.error('Failed to write system database:', error);
      return false;
    }
  },

  updateSystemStats: (key, value) => {
    const system = jsonDb.getSystem();
    if (key === 'totalUsers') {
      system.stats.totalUsers = value;
    } else if (key === 'command') {
      system.stats.totalCommandsUsed = (system.stats.totalCommandsUsed || 0) + 1;
      system.stats.commandsBreakdown[value] = (system.stats.commandsBreakdown[value] || 0) + 1;
    }
    return jsonDb.saveSystem(system);
  },

  banUser: (userId) => {
    const system = jsonDb.getSystem();
    const idNum = parseInt(userId, 10);
    if (!system.bannedUsers.includes(idNum)) {
      system.bannedUsers.push(idNum);
      return jsonDb.saveSystem(system);
    }
    return false;
  },

  unbanUser: (userId) => {
    const system = jsonDb.getSystem();
    const idNum = parseInt(userId, 10);
    const index = system.bannedUsers.indexOf(idNum);
    if (index !== -1) {
      system.bannedUsers.splice(index, 1);
      return jsonDb.saveSystem(system);
    }
    return false;
  },

  isBanned: (userId) => {
    const system = jsonDb.getSystem();
    return system.bannedUsers.includes(parseInt(userId, 10));
  }
};

module.exports = jsonDb;
      
