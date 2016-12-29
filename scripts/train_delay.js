'use strict';
/**
 * 電車の遅延情報を取得するスクリプト.
 */
const co = require('co');
const client = require('cheerio-httpcli');

/**
 * BOTで `help` とタイプした時に出力されるメッセージ.
 */
const help = {
  title: '電車遅延情報通知',
  description: [
    '`bot 遅延` 現時点での電車の遅延情報を通知する'
  ],
};

/**
 * 遅延情報収集対象の路線.
 */
const lineLists = [
  {name: '阪急京都本線', url: 'http://transit.yahoo.co.jp/traininfo/detail/306/0/'},
  {name: '大阪環状線', url: 'http://transit.yahoo.co.jp/traininfo/detail/263/0/'},
  {name: 'JR京都線', url: 'http://transit.yahoo.co.jp/traininfo/detail/267/0/'},
  {name: 'JR琵琶湖線', url: 'http://transit.yahoo.co.jp/traininfo/detail/266/0/'},
  {name: '大阪市営御堂筋線', url: 'http://transit.yahoo.co.jp/traininfo/detail/321/0/'},
  {name: '大阪市営長堀鶴見緑地線', url: 'http://transit.yahoo.co.jp/traininfo/detail/327/0/'},
];

/**
 * cronで遅延情報をredisに保存する際のキーの接頭辞.
 */
const TRAIN_DELAY_KEY = process.env.TRAIN_DELAY_KEY || 'train_delay';

/**
 * 引数 line で指定した路線の遅延情報を取得する関数.
 *
 * @param {object} line 路線情報オブジェクト.
 * @returns {object} 遅延情報(slack attachments).
 */
const trainDelay = function(line) {
  return co(function*() {
    const result = yield client.fetch(line.url);
    let color = 'danger';
    let trainStatus = 'ERROR';
    let trainMessage = '';

    if (!('error' in result) && ('$' in result)) {
      const $ = result.$;
      trainStatus = $('#mdServiceStatus dt').text().replace($('#mdServiceStatus dt span').text(), '').replace(/\n/g, '');
      trainMessage = $('#mdServiceStatus dd').text().replace(/\n/g, '');

      color = 'good';
      if (trainStatus !== '平常運転') {
        color = 'danger';
      } else if (trainMessage !== '現在､事故･遅延に関する情報はありません。') {
        color = 'warning';
      }
    }

    return {
      fallback: '遅延情報(' + line.name + ')：' + trainStatus,
      color: color,
      title: '[' + line.name + '] の遅延情報です',
      title_link: line.url,
      text: '[' + trainStatus  + ']：' + trainMessage,
    }
  });
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
        const attachments = yield trainDelay(line);
        msg.send({attachments: [attachments]});

      });
    }
  });

  // 路線リストの遅延情報を取得するcronジョブ.
  bot.jobs.add('0 */15 6-22 * * 1-5', () => {
    for (let line of lineLists) {
      const lineNumber = line.url.replace(/[^\d]/g, '');
      const redis_key = TRAIN_DELAY_KEY + lineNumber;

      co(function*() {
        const attachments = yield trainDelay(line);

        const beforeTrainStatus = yield bot.storage.get(redis_key);
        if (beforeTrainStatus !== attachments.text) {
          bot.storage.set(redis_key, attachments.text);
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
