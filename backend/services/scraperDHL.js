const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeText, safeValue } = require('../util/formatting');

module.exports = async function scraperDHL(trackingNumber) {
  const url = `https://www.dhl.com/global-en/home/tracking/tracking-express.html?submit=1&tracking-id=${encodeURIComponent(trackingNumber)}`;
  try {
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);
    const status =
      normalizeText($('.status').first().text()) ||
      normalizeText($('.tracking-status .status').text()) ||
      normalizeText($('.checkpoint__description').first().text());
    const estimated =
      normalizeText($('.estimated-delivery').first().text()) ||
      normalizeText($('[data-est-delivery]').attr('data-est-delivery'));
    const lastUpdated =
      normalizeText($('.checkpoint__time').first().text()) ||
      normalizeText($('.checkpoint__date').first().text());
    const origin =
      normalizeText($('.origin-destination .origin .location').text()) ||
      normalizeText($('.c-tracking-result--origin .c-address').text());
    const destination =
      normalizeText($('.origin-destination .destination .location').text()) ||
      normalizeText($('.c-tracking-result--destination .c-address').text());

    const checkpoints = [];
    $('.checkpoint').each((_, el) => {
      const time =
        normalizeText($(el).find('.checkpoint__time').text()) ||
        normalizeText($(el).find('.checkpoint__date').text());
      const location = normalizeText($(el).find('.checkpoint__location').text());
      const description =
        normalizeText($(el).find('.checkpoint__description').text()) ||
        normalizeText($(el).find('.checkpoint__status').text()) ||
        normalizeText($(el).find('.status').text());
      if (time || location || description) {
        checkpoints.push({ time: safeValue(time), location: safeValue(location), description: safeValue(description) });
      }
    });

    if (!checkpoints.length && status) {
      checkpoints.push({ time: safeValue(lastUpdated), location: null, description: safeValue(status) });
    }

    return {
      carrierName: 'DHL',
      trackingNumber,
      currentStatus: safeValue(status, 'Status unavailable'),
      estimatedDelivery: safeValue(estimated, null),
      lastUpdated: safeValue(lastUpdated, null),
      origin: safeValue(origin, null),
      destination: safeValue(destination, null),
      checkpoints,
    };
  } catch (error) {
    return {
      carrierName: 'DHL',
      trackingNumber,
      currentStatus: 'Tracking temporarily unavailable',
      estimatedDelivery: null,
      lastUpdated: null,
      origin: null,
      destination: null,
      checkpoints: [],
    };
  }
};
