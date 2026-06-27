const jsonDb = require('../database/jsonDb');

module.exports = {
  name: 'Profile',
  category: 'Profile',
  commands: ['profile', 'daily'],

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const command = msg.text.split(' ')[0].toLowerCase().substring(1);
    
    const user = jsonDb.getUser(userId);

    if (command === 'profile') {
      const formattedDate = new Date(user.joinDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const profileMsg = `👤 *MULTIVERSE CITIZEN PROFILE*\n\n` +
                         `🆔 *User ID:* \`${user.id}\`\n` +
                         `✨ *Experience Points (XP):* ${user.xp || 0} XP\n` +
                         `📅 *Registry Date:* ${formattedDate}\n` +
                         `📊 *System Interactions:* ${user.commandsUsed || 0} commands used\n\n` +
                         `🎨 *Active Theme:* ${user.settings?.theme || 'dark'}\n` +
                         `🌐 *Language Setup:* ${(user.settings?.language || 'en').toUpperCase()}`;

      return bot.sendMessage(chatId, profileMsg, { parse_mode: 'Markdown' });
    }

    if (command === 'daily') {
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;
      const lastClaimed = user.dailyReward?.lastClaimed ? new Date(user.dailyReward.lastClaimed).getTime() : 0;

      if (now - lastClaimed < oneDay) {
        const timeLeft = oneDay - (now - lastClaimed);
        const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        return bot.sendMessage(chatId, `⏳ *Reward Locked:* You have already collected your daily check-in bounty. Return in *${hoursLeft}h ${minutesLeft}m*.`, { parse_mode: 'Markdown' });
      }

      const rewardXp = 100;
      const currentXp = user.xp || 0;

      jsonDb.updateUser(userId, {
        xp: currentXp + rewardXp,
        dailyReward: {
          lastClaimed: new Date().toISOString()
        }
      });

      return bot.sendMessage(chatId, `🎁 *DAILY REWARD CLAIMED!*\n\n🎉 You successfully secured *+${rewardXp} XP*.\n📈 Total Progression Level: *${currentXp + rewardXp} XP*.`, { parse_mode: 'Markdown' });
      
