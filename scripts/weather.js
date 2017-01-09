const co = require('co');
const YahooWeather = require('../lib/YahooWeather');

const WeatherLists = [
  {name: '大阪', url: 'http://weather.yahoo.co.jp/weather/jp/27/6200.html', channel: 'weather'},
  {name: '名古屋', url: 'http://weather.yahoo.co.jp/weather/jp/23/5110.html', channel: 'nagoya'},
];

/**
 *
 */
const setAttachments = (weatherInfo, url, pattern) => {
  if (pattern === 'weekly') {
    return {
      fallback: '週の天気',
      text: '週の天気',
      image_url: weatherInfo.image,
    };
  }
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
  // BOTに対し `天気 地名 取得対象` とメッセージを送信すると路線リストの遅延情報を返す.
  bot.respond(/^(?:天気|weather) (.\S+)\s?(今日|today|明日|tomorrow|週|week|weekly)?/i, (msg) => {
    const area = msg.match[1];
    let pattern = msg.match[2] || 'today';

    const filterWeatherList = WeatherLists.filter((item) => {
      return (item.name == area);
    });

    if (filterWeatherList.length === 0) {
      return msg.send('[' + area + '] の天気予報取得URLは未登録です。');
    }

    if (pattern === '今日') {
      pattern = 'today';
    } else if (pattern === '明日') {
      pattern = 'tomorrow';
    } else if (pattern === '週' || pattern === 'week') {
      pattern = 'weekly';
    }

    for (let weatherList of filterWeatherList) {
      co(function*() {
        const weatherInfo = yield YahooWeather.getWeather(weatherList.url, pattern);
        const attachments = setAttachments(weatherInfo, weatherList.url, pattern);
        msg.send({attachments: [attachments]});
      });
    }
  });

  // 毎朝天気予報を通知する処理.
  bot.jobs.add('0 30 6 * * *', () => {
    for (let weatherList of WeatherLists) {
      co(function*() {
        const weatherInfo = yield YahooWeather.getWeather(weatherList.url, 'today');
        const attachments = setAttachments(weatherInfo, weatherList.url, 'today');
        const channel = weatherList.channel || bot.default_channel.name;
        bot.send({attachments: [attachments]}, channel);
      });
    }
  });
};
