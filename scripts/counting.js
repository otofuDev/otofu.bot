const co = require('co');
const HatenaCounting = require('../lib/HatenaCounting');

const CountLists = [
  {name: 'SUPER GT 2017 Rd.6 SUZUKA', url: 'http://counting.hatelabo.jp/count/u7pi5kfr92'},
];

/**
 * BOTスクリプト本体.
 * @param {object} bot shrikeボット.
 */
module.exports = (bot) => {
  // BOTに対し `記念日` とメッセージを送信すると路線リストの遅延情報を返す.
  bot.respond(/記念日/, (msg) => {
    for (let list of CountLists) {
      co(function*() {
        const countInfo = yield HatenaCounting.getCounterInfo(list.url);
        const attachments = {
          fallback: countInfo.counter_name,
          title: countInfo.counter_name,
          title_link: countInfo.counter_url,
          image_url: countInfo.image,
        };

        msg.send({attachments: [attachments]});
      });
    }
  });

  // 毎朝イベント日を通知する処理.
  bot.jobs.add('0 0 9 * * *', () => {
    for (let list of CountLists) {
      co(function*() {
        const countInfo = yield HatenaCounting.getCounterInfo(list.url);
        const attachments = {
          fallback: countInfo.counter_name,
          title: countInfo.counter_name,
          title_link: countInfo.counter_url,
          image_url: countInfo.image,
        };
        bot.send({attachments: [attachments]}, 'supergt2017');
      });
    }
  });
};
