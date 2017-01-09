const co = require('co');
const YahooWeather = require('../lib/YahooWeather');

const WeatherLists = [
  {name: '大阪', url: 'http://weather.yahoo.co.jp/weather/jp/27/6200.html', channel: 'weather'},
  {name: '名古屋', url: 'http://weather.yahoo.co.jp/weather/jp/23/5110.html', channel: 'nagoya'},
];

/**
 *
 */
const setAttachments = (weatherInfo, url) => {
  return {
    fallback: '天気予報[' + weatherInfo.area + ']：' + weatherInfo.weather,
    title: '[' + weatherInfo.area + '] ' + weatherInfo.date + 'の天気',
    title_link: url,
    text: weatherInfo.weather + '　最高気温：' + weatherInfo.temp_high + '℃　最低気温：' + weatherInfo.temp_low + '℃',
    image_url: weatherInfo.image,
  };
};

/**
 * BOTスクリプト本体.
 * @param {object} bot shrikeボット.
 */
module.exports = (bot) => {
  // BOTに対し `天気` とメッセージを送信すると路線リストの遅延情報を返す.
  bot.respond(/天気/, (msg) => {
    for (let weatherList of WeatherLists) {
      co(function*() {
        const weatherInfo = yield YahooWeather.getWeather(weatherList.url, 'today');
        const attachments = setAttachments(weatherInfo, weatherList.url);
        msg.send({attachments: [attachments]});
      });
    }
  });

  // 毎朝天気予報を通知する処理.
  bot.jobs.add('0 30 6 * * *', () => {
    for (let weatherList of WeatherLists) {
      co(function*() {
        const weatherInfo = yield YahooWeather.getWeather(weatherList.url, 'today');
        const attachments = setAttachments(weatherInfo, weatherList.url);
        const channel = weatherList.channel || bot.default_channel.name;
        bot.send({attachments: [attachments]}, channel);
      });
    }
  });
};
