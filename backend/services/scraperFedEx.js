const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeText, safeValue } = require('../util/formatting');

module.exports = async function scraperFedEx(trackingNumber) {
  const url = `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`;
  try {
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);
    const status = normalizeText($('.status-chekpoint, .status').first().text());
    const estimated = normalizeText($('.estimated-delivery, .est-delivery').first().text());
    const lastUpdated = normalizeText($('.last-update, .last-update-time').first().text());
    const origin = normalizeText($('.from-to .from .city').text());
    const destination = normalizeText($('.from-to .to .city').text());

    const checkpoints = [];
    $('.status-bar__status').each((_, el) => {
      const time = normalizeText($(el).find('.status-bar__date').text());
      const location = normalizeText($(el).find('.status-bar__location').text());
      const description = normalizeText($(el).find('.status-bar__content').text());
      if (time || location || description) {
        checkpoints.push({ time: safeValue(time), location: safeValue(location), description: safeValue(description) });
      }
    });

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
