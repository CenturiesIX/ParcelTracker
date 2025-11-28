const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeText, safeValue } = require('../util/formatting');

module.exports = async function scraperUSPS(trackingNumber) {
  const url = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`;
  try {
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);
    const status =
      normalizeText($('.delivery_status').text()) ||
      normalizeText($('.status_feed .status').first().text()) ||
      normalizeText($('.latest-status div').first().text());
    const estimated =
      normalizeText($('.expectedDeliveryDate, .delivery-date').first().text()) ||
      normalizeText($('#estDeliveryDate').text());
    const lastUpdated =
      normalizeText($('.status_feed .date-time').first().text()) ||
      normalizeText($('.date-time').first().text());
    const origin = normalizeText($('.origin .location').text()) || normalizeText($('.from .city-state').text());
    const destination = normalizeText($('.destination .location').text()) || normalizeText($('.to .city-state').text());

    const checkpoints = [];
    $('.status_feed .tb-status-item, .tracking-progress .event').each((_, el) => {
      const time = normalizeText($(el).find('.date-time, .status_date').text());
      const location = normalizeText($(el).find('.location, .status_location').text());
      const description =
        normalizeText($(el).find('.status, .event-text, .status_summary').text()) || normalizeText($(el).text());
      if (time || location || description) {
        checkpoints.push({ time: safeValue(time), location: safeValue(location), description: safeValue(description) });
      }
    });

    if (!checkpoints.length && status) {
      checkpoints.push({ time: safeValue(lastUpdated), location: null, description: safeValue(status) });
    }

    return {
      carrierName: 'USPS',
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
      carrierName: 'USPS',
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
