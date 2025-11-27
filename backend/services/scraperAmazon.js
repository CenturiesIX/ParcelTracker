const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeText, safeValue } = require('../util/formatting');

module.exports = async function scraperAmazon(trackingNumber) {
  const url = `https://track.amazon.com/tracking/${encodeURIComponent(trackingNumber)}`;
  try {
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);
    const status = normalizeText($('.tracking-stage .status, .tracking-status-text').first().text());
    const estimated = normalizeText($('.promise-date, .expected-date').first().text());
    const lastUpdated = normalizeText($('.last-update, .snapshot-date').first().text());
    const origin = normalizeText($('.origin .address').text());
    const destination = normalizeText($('.destination .address').text());

    const checkpoints = [];
    $('.checkpoint').each((_, el) => {
      const time = normalizeText($(el).find('.date').text());
      const location = normalizeText($(el).find('.location').text());
      const description = normalizeText($(el).find('.status').text());
      if (time || location || description) {
        checkpoints.push({ time: safeValue(time), location: safeValue(location), description: safeValue(description) });
      }
    });

    return {
      carrierName: 'Amazon Logistics',
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
      carrierName: 'Amazon Logistics',
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
