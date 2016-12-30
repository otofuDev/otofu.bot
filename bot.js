const Bot = require('shrike');
const utils = require('shrike-utils');

const bot = new Bot(process.env.SLACK_TOKEN, {
  default_channel: process.env.SLACK_DEFAULT_CHANNEL,
});

bot.storage = new utils.RedisStorage(process.env.REDIS_URL);

bot.jobs = new utils.JobList();

bot.loadDir('./scripts');

bot.start().then(() => {
  if (process.env.NODE_ENV === 'production') {
    bot.jobs.startAll();
  }
});
