const co = require('co');
const ScreenShot = require('../lib/ScreenShot');

module.exports = (bot) => {
  bot.respond(/おみくじ/, (msg) => {
    co(function*(){
      const gyazo_res = yield ScreenShot.capture('http://www.htb.co.jp/suidou/omikuji.html', 'img');
      const attachments = {
        fallback: 'おみくじ',
        title: 'おみくじ',
        image_url: gyazo_res.url,
      };
      msg.send({attachments: [attachments]});
    });
  });
};
