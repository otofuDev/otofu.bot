const co = require('co');
const HatenaCounting = require('../lib/HatenaCounting');

const CountLists = [
  {name: 'SUPER GT 2017 Rd.6 SUZUKA', url: 'http://counting.hatelabo.jp/count/u7pi5kfr92', channel: 'supergt2017'},
  {name: 'モータースポーツファン感謝デー', url: 'http://counting.hatelabo.jp/count/mhimq2tkf3', channel: 'supergt2017'},
];

/**
 *
 */
const setAttachments = (countInfo) => {
  return {
    fallback: countInfo.counter_name + ' ' + countInfo.counter + '日',
    title: countInfo.counter_name,
    title_link: countInfo.counter_url,
    image_url: countInfo.image,
  };
};

/**
 * BOTスクリプト本体.
 * @param {object} bot shrikeボット.
 */
module.exports = (bot) => {
  // BOTに対し `記念日` とメッセージを送信すると路線リストの遅延情報を返す.
  bot.respond(/記念日/, (msg) => {
    co(function*() {
      for (let list of CountLists) {
        const countInfo = yield HatenaCounting.getCounterInfo(list.url);
        const attachments = setAttachments(countInfo);
        msg.send({attachments: [attachments]});
      }
    });
  });

  // 毎朝イベント日を通知する処理.
  bot.jobs.add('0 0 9 * * *', () => {
    co(function*() {
      for (let list of CountLists) {
        const countInfo = yield HatenaCounting.getCounterInfo(list.url);
        const attachments = setAttachments(countInfo);
        const channel = list.channel || bot.default_channel;
        bot.send({attachments: [attachments]}, channel);
      }
    });
  });
};
