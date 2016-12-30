const co = require('co');
const client = require('cheerio-httpcli');

class YahooTransit {
  static getStatus(line_url) {
    return co(function*() {
      let lineStatus = {
        name: null,
        color: null,
        url: null,
        status: null,
        message: null,
        error: null,
      };

      const result = yield client.fetch(line_url);
      if (!('error' in result) && ('$' in result)) {
        const $ = result.$;
        const trainStatus = $('#mdServiceStatus dt').text().replace($('#mdServiceStatus dt span').text(), '').replace(/\n/g, '');
        const trainMessage = $('#mdServiceStatus dd').text().replace(/\n/g, '');

        let color = 'good';
        if (trainStatus === '運転見合わせ') {
          color = 'danger';
        } else if (trainMessage !== '現在､事故･遅延に関する情報はありません。') {
          color = 'warning';
        }

        lineStatus.name = $('h1.title').text().replace(/\n/g, '');
        lineStatus.color = color;
        lineStatus.status = trainStatus;
        lineStatus.message = trainMessage;
      } else {
        lineStatus.color = 'danger';
        lineStatus.error = '遅延情報取得に失敗しました。';
      }

      lineStatus.url = line_url;
      return lineStatus;
    });
  }
}

module.exports = YahooTransit;
