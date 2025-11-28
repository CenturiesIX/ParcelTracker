const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeText, safeValue } = require('../util/formatting');

module.exports = async function scraperLaserShip(trackingNumber) {
  const url = `https://www.lasership.com/track/${encodeURIComponent(trackingNumber)}`;
  try {
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);
    const status =
      normalizeText($('.tracking-status, .status-header').first().text()) ||
      normalizeText($('.checkpoint .description').first().text());
    const estimated = normalizeText($('.eta-date').first().text()) || normalizeText($('.delivery-date').text());
    const lastUpdated =
      normalizeText($('.last-update').first().text()) ||
      normalizeText($('.checkpoint .date, .checkpoint .time').first().text());
    const origin = normalizeText($('.origin .location').text());
    const destination = normalizeText($('.destination .location').text());

    const checkpoints = [];
    $('.tracking-history .event, .timeline .checkpoint').each((_, el) => {
      const time = normalizeText($(el).find('.date, .time').text());
      const location = normalizeText($(el).find('.location').text());
      const description = normalizeText($(el).find('.description, .details, .status').text());
      if (time || location || description) {
        checkpoints.push({ time: safeValue(time), location: safeValue(location), description: safeValue(description) });
      }
    });

    if (!checkpoints.length && status) {
      checkpoints.push({ time: safeValue(lastUpdated), location: null, description: safeValue(status) });
    }

    return {
      carrierName: 'LaserShip',
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
      carrierName: 'LaserShip',
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
