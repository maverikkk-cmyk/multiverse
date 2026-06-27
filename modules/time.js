const cache = require('../utils/cache');

const internalTimers = new Map();
const activeStopwatches = new Map();

module.exports = {
  name: 'Time',
  category: 'Time',
  commands: ['time', 'calendar', 'timer', 'stopwatch'],

  execute: async (bot, msg, args) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const command = msg.text.split(' ')[0].toLowerCase().substring(1);

    if (command === 'time') {
      const locationInput = args.join(' ');
      
      if (!locationInput || locationInput.toLowerCase() === 'india') {
        const indiaTime = new Date().toLocaleString('en-US', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'full',
          timeStyle: 'medium'
        });
        return bot.sendMessage(chatId, `🕒 *TIME METRICS (INDIA)*\n\n📌 *Zone:* Asia/Kolkata (IST)\n📅 *Current Structural State:* \`${indiaTime}\``, { parse_mode: 'Markdown' });
      }

      try {
        const targetTime = new Date().toLocaleString('en-US', {
          timeZone: locationInput,
          dateStyle: 'full',
          timeStyle: 'medium'
        });
        return bot.sendMessage(chatId, `🕒 *TIME METRICS (WORLD)*\n\n📌 *Zone:* ${locationInput}\n📅 *Current Structural State:* \`${targetTime}\``, { parse_mode: 'Markdown' });
      } catch (e) {
        return bot.sendMessage(chatId, `❌ Invalid IANA Timezone string identifier. Example: \`America/New_York\`, \`Europe/London\`, \`Asia/Tokyo\`.`, { parse_mode: 'Markdown' });
      }
    }

    if (command === 'calendar') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const firstDay = new Date(currentYear, currentMonth, 1).getDay();
      const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      let grid = `📅 *${monthNames[currentMonth]} ${currentYear}*\n\`\`\`\nSu Mo Tu We Th Fr Sa\n`;
      
      for (let i = 0; i < firstDay; i++) {
        grid += "   ";
      }
      
      for (let day = 1; day <= totalDays; day++) {
        let dayStr = day < 10 ? `0${day}` : `${day}`;
        grid += `${dayStr} `;
        if ((day + firstDay) % 7 === 0 || day === totalDays) {
          grid += "\n";
        }
      }
      grid += `\`\`\``;
      return bot.sendMessage(chatId, grid, { parse_mode: 'Markdown' });
    }

    if (command === 'timer') {
      const action = args[0] ? args[0].toLowerCase() : null;
      
      if (action === 'stop') {
        const userTimerKey = `${chatId}:${userId}`;
        if (internalTimers.has(userTimerKey)) {
          clearTimeout(internalTimers.get(userTimerKey));
          internalTimers.delete(userTimerKey);
          return bot.sendMessage(chatId, '✅ Your active execution countdown timer has been aborted.');
        }
        return bot.sendMessage(chatId, '❌ You do not have any active runtime timers running.');
      }

      const duration = parseInt(args[0], 10);
      if (isNaN(duration) || duration <= 0) {
        return bot.sendMessage(chatId, '❌ Usage: `/timer [seconds]` or `/timer stop`', { parse_mode: 'Markdown' });
      }

      const userTimerKey = `${chatId}:${userId}`;
      if (internalTimers.has(userTimerKey)) {
        return bot.sendMessage(chatId, '⚠️ You already possess an operational timer running. Terminate it via `/timer stop` first.', { parse_mode: 'Markdown' });
      }

      await bot.sendMessage(chatId, `⏳ Countdown thread allocated. I will notify you in *${duration}* seconds.`, { parse_mode: 'Markdown' });

      const timeoutId = setTimeout(async () => {
        internalTimers.delete(userTimerKey);
        try {
          await bot.sendMessage(chatId, `⏰ *TIMER ALERT* ⏰\n\n⚡ Allocated duration block of *${duration}s* has fully expired!`, { parse_mode: 'Markdown' });
        } catch (err) {}
      }, duration * 1000);

      internalTimers.set(userTimerKey, timeoutId);
      return;
    }

    if (command === 'stopwatch') {
      const sub = args[0] ? args[0].toLowerCase() : 'status';
      const stopwatchKey = `${chatId}:${userId}`;

      if (sub === 'start') {
        if (activeStopwatches.has(stopwatchKey)) {
          return bot.sendMessage(chatId, '⚠️ An operational stopwatch instance is already ticking for your account context.');
        }
        activeStopwatches.set(stopwatchKey, Date.now());
        return bot.sendMessage(chatId, '⏱ *Stopwatch Thread Initialized!* Execute `/stopwatch lap` or `/stopwatch stop` to capture deltas.', { parse_mode: 'Markdown' });
      }

      if (sub === 'lap' || sub === 'status') {
        const start = activeStopwatches.get(stopwatchKey);
        if (!start) return bot.sendMessage(chatId, '❌ No stopwatch context found. Initialize tracking via `/stopwatch start`.', { parse_mode: 'Markdown' });
        
        const delta = ((Date.now() - start) / 1000).toFixed(2);
        return bot.sendMessage(chatId, `⏱ *STOPWATCH METRIC* \n\n⏳ Continuous Elapsed Runway: *${delta}s*`, { parse_mode: 'Markdown' });
      }

      if (sub === 'stop') {
        const start = activeStopwatches.get(stopwatchKey);
        if (!start) return bot.sendMessage(chatId, '❌ No active stopwatch instance found to terminate.');
        
        const delta = ((Date.now() - start) / 1000).toFixed(2);
        activeStopwatches.delete(stopwatchKey);
        return bot.sendMessage(chatId, `🏁 *STOPWATCH CONCLUDED*\n\n⏱ Total Monitored Runtime: *${delta} seconds*.`, { parse_mode: 'Markdown' });
      }

      return bot.sendMessage(chatId, '❌ Unknown subcommand. Options: `/stopwatch [start/lap/stop]`', { parse_mode: 'Markdown' });
    }
  }
};
          
