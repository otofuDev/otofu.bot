const os = require('os');
const co = require('co');
const client = require('cheerio-httpcli');
const Nightmare = require('nightmare');
const Gyazo = require('gyazo-api');

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

      const nightmare = Nightmare({show: false});
      const windowSize = yield nightmare
        .goto(counting_url)
        .evaluate(() => {
          const _element = document.querySelector('body');
          return {
            width: _element.scrollWidth,
            height: _element.scrollHeight,
          };
        });

      const elementRect = yield nightmare
        .viewport(windowSize.width, windowSize.height)
        .goto(counting_url)
        .evaluate((_selector) => {
          const _element = document.querySelector(_selector);
          const _rect = _element.getBoundingClientRect();

          return {
            x: Math.round(_rect.left),
            y: Math.round(_rect.top),
            width: Math.round(_rect.width),
            height: Math.round(_rect.height),
          };
        }, '.main-count');

      const image_name = os.tmpdir() + '/counting_' + new Date().getTime().toString() + '.png';
      yield nightmare
        .viewport(windowSize.width, windowSize.height)
        .goto(counting_url)
        .screenshot(image_name, elementRect);

      yield nightmare.end();

      const gyazo_client = new Gyazo(GYAZO_ACCESS_TOKEN);
      let gyazo_res = yield gyazo_client.upload(image_name);
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
