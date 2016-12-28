const Bot = require('shrike');
const utils = require('shrike-utils');
const express = require('express');
const bodyParser = require('body-parser');

const bot = new Bot(process.env.SLACK_TOKEN, {
  default_channel: process.env.SLACK_DEFAULT_CHANNEL,
});

bot.jobs = new utils.JobList();

bot.http = express();
bot.http.use(bodyParser.json());

bot.loadDir('./scripts');

bot.start().then(() => {
  bot.jobs.startAll();
  bot.http.listen(process.env.PORT || 80);
});
