const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeText, safeValue } = require('../util/formatting');

module.exports = async function scraperFedEx(trackingNumber) {
  const url = `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`;
  try {
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);
    const status =
      normalizeText($('.status-chekpoint, .status').first().text()) ||
      normalizeText($('[data-test-id="statusHeader"] .status').text()) ||
      normalizeText($('body').text().match(/Status:\s*([A-Za-z ]+)/)?.[1]);
    const estimated =
      normalizeText($('.estimated-delivery, .est-delivery').first().text()) ||
      normalizeText($('[data-test-id="estimatedDeliveryDate"]').text());
    const lastUpdated =
      normalizeText($('.last-update, .last-update-time').first().text()) ||
      normalizeText($('[data-test-id="lastUpdated"] .time').text());
    const origin =
      normalizeText($('.from-to .from .city').text()) ||
      normalizeText($('[data-test-id="fromLocation"]').text());
    const destination =
      normalizeText($('.from-to .to .city').text()) ||
      normalizeText($('[data-test-id="toLocation"]').text());

    const checkpoints = [];
    $('.status-bar__status, .travel-history-entry').each((_, el) => {
      const time =
        normalizeText($(el).find('.status-bar__date').text()) ||
        normalizeText($(el).find('.tracking-progress__date').text());
      const location =
        normalizeText($(el).find('.status-bar__location').text()) ||
        normalizeText($(el).find('.tracking-progress__location').text());
      const description =
        normalizeText($(el).find('.status-bar__content').text()) ||
        normalizeText($(el).find('.tracking-progress__details').text());
      if (time || location || description) {
        checkpoints.push({ time: safeValue(time), location: safeValue(location), description: safeValue(description) });
      }
    });

    if (!checkpoints.length && status) {
      checkpoints.push({ time: safeValue(lastUpdated), location: safeValue(origin), description: safeValue(status) });
    }

    return {
      carrierName: 'FedEx',
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
      carrierName: 'FedEx',
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
