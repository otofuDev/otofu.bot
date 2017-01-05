const co = require('co');
const client = require('cheerio-httpcli');
const PageCapture = require('./PageCapture');
const Gyazo = require('./Gyazo');

const GYAZO_ACCESS_TOKEN = process.env.GYAZO_ACCESS_TOKEN;

class HatenaCounting {
  static getCounterInfo(counting_url) {
    return co(function*() {
      let countingInfo = {};

      // 該当URLのデータをスクレイピング.
      const result = yield client.fetch(counting_url);
      const $ = result.$;
      countingInfo.counter_name = $('.count-name a').text();
      countingInfo.counter_url = $('.count-name a').url();

      // カウンターをキャプチャ.
      const image_buf = yield PageCapture.capture(counting_url, '.main-count');
      // Gyazoへアップロード.
      const gyazo_client = new Gyazo(GYAZO_ACCESS_TOKEN);
      const gyazo_res = yield gyazo_client.upload(image_buf);
      countingInfo.image = gyazo_res.data.url;

      return countingInfo;
    }).then((countingInfo) => {
      return countingInfo;
    }).catch((err) => {
      return err;
    });
  }
}

module.exports = HatenaCounting;
