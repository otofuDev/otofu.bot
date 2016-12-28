const help = {
  title: 'Example',
  description: [
    '`bot ping` pong を返す',
    '`bot count` 数字を数える',
    '毎朝7:30に「Good Morning!!」とつぶやく',
  ],
};

module.exports = (bot) => {

  bot.respond(/^ping$/i, (msg) => {
    msg.reply('PONG!');
  });

  bot.jobs.add('0 30 7 * * 1-5', () => {
    bot.send('Good Morning!!');
  });

  bot.respond(/^count$/i, (msg) => {
    bot.storage.get('count').then((count = 0) => {
      count += 1;
      msg.send('Count: ' + count);
      bot.storage.set('count', count);
    });
  });

};

module.exports.help = help;
