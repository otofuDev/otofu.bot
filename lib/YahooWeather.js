const os = require('os');
const co = require('co');
const client = require('cheerio-httpcli');
const Nightmare = require('nightmare');
const Gyazo = require('gyazo-api');

const GYAZO_ACCESS_TOKEN = process.env.GYAZO_ACCESS_TOKEN;

class YahooWeather {
  static getWeather(weather_url, day) {
    return co(function*() {
      let weatherInfo = {};
      const image_name = os.tmpdir() + '/weather_' + new Date().getTime().toString() + '.png';
      const selector = {
        today: '.forecastCity td:first-child div',
        tomorrow: '.forecastCity td:nth-child(2) div',
        weekly: '.yjw_table',
      };

      if (day !== 'today' && day !== 'tomorrow' && day !== 'weekly') {
        return Promise.reject({message: '引数の指定が誤っています'});
      }

      // Yahoo!天気より今日・明日の天気予報をスクレイピング.
      if (day === 'today' || day === 'tomorrow') {
        const result = yield client.fetch(weather_url);
        const $ = result.$;
        const $weather = $(selector[day]);
        weatherInfo = {
          area: $('title').text().replace(/の天気.*$/g, ''),
          date: $weather.find('.date').text(),
          weather: $weather.find('.pict').text(),
          temp_high: $weather.find('.temp .high em').text(),
          temp_low: $weather.find('.temp .low em').text(),
        };
      }

      // Yahoo!天気予報より今日・明日・週間の天気を画像で取得.
      const nightmare = Nightmare({show: false});
      // ウィンドウサイズを取得.
      const window_rect = yield nightmare
        .goto(weather_url)
        .evaluate(() => {
          const _element = document.querySelector('body');
          return {
            width: _element.scrollWidth,
            height: _element.scrollHeight,
          };
        });

      // セレクタの範囲取得.
      const element_rect = yield nightmare
        .viewport(window_rect.width, window_rect.height)
        .goto(weather_url)
        .evaluate((_selector) => {
          const _element = document.querySelector(_selector);
          const _rect = _element.getBoundingClientRect();

          return {
            x: Math.round(_rect.left),
            y: Math.round(_rect.top),
            width: Math.round(_rect.width),
            height: Math.round(_rect.height),
          };
        }, selector[day]);

      // スクリーンショット取得.
      yield nightmare
        .viewport(window_rect.width, window_rect.height)
        .goto(weather_url)
        .screenshot(image_name, element_rect);

      yield nightmare.end();

      // 取得したスクリーンショットをGyazoへアップロード.
      const gyazo_client = new Gyazo(GYAZO_ACCESS_TOKEN);
      let gyazo_res = yield gyazo_client.upload(image_name);
      weatherInfo.image = gyazo_res.data.url;

      return Promise.resolve(weatherInfo);

    }).then((weatherInfo) => {
      return weatherInfo;
    }).catch((err) => {
      return {err: err};
    });
  }
}

module.exports = YahooWeather;
