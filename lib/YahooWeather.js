const co = require('co');
const client = require('cheerio-httpcli');
const ScreenShot = require('./ScreenShot');

const replaceEmoji = [
  [/晴れ?/, ':sunny:'],
  [/曇り?/, ':cloud:'],
  [/雨/, ':umbrella:'],
  [/雪/, 'snowflake'],
  [/時々/, ' / '],
  [/後/, ' -> '],
];

class YahooWeather {
  static getWeather(weather_url, day) {
    return co(function*() {
      let weatherInfo = {};
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
          weather: replaceEmoji.reduce((w, e) => {return w.replace.apply(w, e);}, $weather.find('.pict').text()),
          temp_high: $weather.find('.temp .high em').text(),
          temp_low: $weather.find('.temp .low em').text(),
        };
      }

      const gyazo_res = yield ScreenShot.capture(weather_url, selector[day]);
      weatherInfo.image = gyazo_res.url;

      return Promise.resolve(weatherInfo);

    }).then((weatherInfo) => {
      return weatherInfo;
    }).catch((err) => {
      return {err: err};
    });
  }
}

module.exports = YahooWeather;
