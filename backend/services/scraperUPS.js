const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeText, safeValue } = require('../util/formatting');

module.exports = async function scraperUPS(trackingNumber) {
  const url = `https://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=${encodeURIComponent(trackingNumber)}`;
  try {
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);
    const status = normalizeText($('#stApp_txtPackageStatus').text()) || normalizeText($('.status-sec .status').text());
    const lastUpdated = normalizeText($('#stApp_txtPackageDate').text());
    const estimated = normalizeText($('#stApp_txtPackageETA').text());
    const origin = normalizeText($('#stApp_txtOrigin').text());
    const destination = normalizeText($('#stApp_txtDestination').text());

    const checkpoints = [];
    $('.activityList .activity').each((_, el) => {
      const time = normalizeText($(el).find('.time').text());
      const location = normalizeText($(el).find('.location').text());
      const description = normalizeText($(el).find('.desc').text());
      if (time || location || description) {
        checkpoints.push({ time: safeValue(time), location: safeValue(location), description: safeValue(description) });
      }
    });

    return {
      carrierName: 'UPS',
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
      carrierName: 'UPS',
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
