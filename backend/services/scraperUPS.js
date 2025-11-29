const axios = require('axios');
const cheerio = require('cheerio');
const { normalizeText, safeValue } = require('../util/formatting');

module.exports = async function scraperUPS(trackingNumber) {
  const url = `https://wwwapps.ups.com/WebTracking/track?track=yes&trackNums=${encodeURIComponent(trackingNumber)}`;
  try {
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);

    const status =
      normalizeText($('#stApp_txtPackageStatus').text()) ||
      normalizeText($('.status-sec .status').text()) ||
      normalizeText($('.currentStatusDetails').text());
    const lastUpdated =
      normalizeText($('#stApp_txtPackageDate').text()) ||
      normalizeText($('.status-sec .date').text()) ||
      normalizeText($('.shipmentProgress .time').first().text());
    const estimated =
      normalizeText($('#stApp_txtPackageETA').text()) ||
      normalizeText($('.package-progress-bar .status').text()) ||
      normalizeText($('[data-test-id="scheduledDeliveryDate"]').text());
    const origin = normalizeText($('#stApp_txtOrigin').text()) || normalizeText($('.origin-destination .origin .addr1').text());
    const destination =
      normalizeText($('#stApp_txtDestination').text()) || normalizeText($('.origin-destination .destination .addr1').text());

    const checkpoints = [];
    $('.activityList .activity, .shipmentProgress .ng-scope, .progress .row').each((_, el) => {
      const time =
        normalizeText($(el).find('.time').text()) ||
        normalizeText($(el).find('.date').text()) ||
        normalizeText($(el).find('.tb-date').text());
      const location =
        normalizeText($(el).find('.location').text()) ||
        normalizeText($(el).find('.tb-location').text());
      const description =
        normalizeText($(el).find('.desc').text()) ||
        normalizeText($(el).find('.tb-status').text()) ||
        normalizeText($(el).find('.status').text());
      if (time || location || description) {
        checkpoints.push({ time: safeValue(time), location: safeValue(location), description: safeValue(description) });
      }
    });

    if (!checkpoints.length && status) {
      checkpoints.push({ time: safeValue(lastUpdated), location: null, description: safeValue(status) });
    }

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
