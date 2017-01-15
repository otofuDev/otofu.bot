/**
 * しりとりするスクリプト.
 */

/**
 * BOTで `help` とタイプした時に出力されるメッセージ.
 */
const help = {
  title: 'しりとりbot',
  description: [
    '`bot しりとり ＜ひらがな＞` ',
  ],
};

/**
 * BOTスクリプト本体.
 * @param {object} bot shrikeボット.
 */
module.exports = (bot) => {
  // BOTに対し `しりとり xxx` とメッセージを送信するとしりとりする.
  bot.respond(/しりとり (.*)/i, (msg) => {
    var fs = require('fs'); // fsモジュールを準備

    var rs = fs.ReadStream('./lib/aiueo.txt');
    var readline = require('readline');
    var rl = readline.createInterface(rs, {});

    var str;
    var input = msg.match[1];
    rl.on('line', function(line) {
      str = line.split(':');
      if(str[0] == input){
        msg.send([input, '...', str[1], ' だオン！'].join(''));
      }
    });

    // msg.send(msg.match[1]);
  });
};

/**
 * ヘルプメッセージ.
 */
module.exports.help = help;
