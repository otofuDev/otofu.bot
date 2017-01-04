/**
 * 電車の遅延情報を取得するスクリプト.
 */
const co = require('co');
const YahooTransit = require('../lib/YahooTransit');

/**
 * BOTで `help` とタイプした時に出力されるメッセージ.
 */
const help = {
  title: '電車遅延情報通知',
  description: [
    '`bot 遅延` 現時点での電車の遅延情報を通知する',
  ],
};

/**
 * 遅延情報収集対象の路線.
 */
const lineLists = [
  {name: '大阪環状線', url: 'http://transit.yahoo.co.jp/traininfo/detail/263/0/'},
  {name: 'JR京都線', url: 'http://transit.yahoo.co.jp/traininfo/detail/267/0/'},
  {name: 'JR琵琶湖線', url: 'http://transit.yahoo.co.jp/traininfo/detail/266/0/'},
  {name: '大阪市営長堀鶴見緑地線', url: 'http://transit.yahoo.co.jp/traininfo/detail/327/0/'},
  {name: '名古屋市営上飯田線', url: 'http://transit.yahoo.co.jp/traininfo/detail/400/0/'},
  {name: '名古屋市営名城線', url: 'http://transit.yahoo.co.jp/traininfo/detail/241/0/'},
];

/**
 * cronで遅延情報をredisに保存する際のキーの接頭辞.
 */
const TRAIN_DELAY_KEY = process.env.TRAIN_DELAY_KEY || 'train_delay';

/**
 *
 */
const setAttachments = (lineStatus) => {
  return {
    fallback: lineStatus.name + '：[' + lineStatus.status + ']',
    color: lineStatus.color,
    title: '[' + lineStatus.name + ']の運行状況',
    title_link: lineStatus.url,
    text: '[' + lineStatus.status + ']：' + lineStatus.message,
  };
};

/**
 * BOTスクリプト本体.
 * @param {object} bot shrikeボット.
 */
module.exports = (bot) => {
  // BOTに対し `遅延` とメッセージを送信すると路線リストの遅延情報を返す.
  bot.respond(/遅延/, (msg) => {
    for (let line of lineLists) {
      co(function*() {
        const lineStatus = yield YahooTransit.getStatus(line.url);
        const attachments = setAttachments(lineStatus);
        msg.send({attachments: [attachments]});
      });
    }
  });

  // 路線リストの遅延情報を取得するcronジョブ.
  bot.jobs.add('0 */10 6-9,17-20 * * 1-5', () => {
    for (let line of lineLists) {
      const lineNumber = line.url.replace(/[^\d]/g, '');
      const redis_key = TRAIN_DELAY_KEY + lineNumber;

      co(function*() {
        const lineStatus = yield YahooTransit.getStatus(line.url);

        const beforeTrainStatus = yield bot.storage.get(redis_key);
        if (beforeTrainStatus !== lineStatus.message) {
          bot.storage.set(redis_key, lineStatus.message);

          const attachments = setAttachments(lineStatus);
          bot.send({attachments: [attachments]}, 'delay');
        }
      });
    }
  });
};

/**
 * ヘルプメッセージ.
 */
module.exports.help = help;
