const express = require('express');
const router = express.Router();
const carrierDetector = require('../services/carrierDetector');
const scraperUPS = require('../services/scraperUPS');
const scraperFedEx = require('../services/scraperFedEx');
const scraperUSPS = require('../services/scraperUSPS');
const scraperDHL = require('../services/scraperDHL');
const scraperLaserShip = require('../services/scraperLaserShip');
const scraperAmazon = require('../services/scraperAmazon');
const { saveHistory } = require('../util/formatting');
const { run } = require('../db/database');

const scrapers = {
  ups: scraperUPS,
  fedex: scraperFedEx,
  usps: scraperUSPS,
  dhl: scraperDHL,
  lasership: scraperLaserShip,
  amazon: scraperAmazon,
};

router.post('/', async (req, res, next) => {
  try {
    const { trackingNumber, carrier } = req.body || {};
    if (!trackingNumber || typeof trackingNumber !== 'string') {
      return res.status(400).json({ success: false, data: null, message: 'Tracking number is required' });
    }

    const normalizedNumber = trackingNumber.trim();
    const detectedCarrier = carrier && carrier !== 'auto' ? carrier : carrierDetector.detect(normalizedNumber);

    if (!detectedCarrier || !scrapers[detectedCarrier]) {
      return res.status(400).json({ success: false, data: null, message: 'Unsupported or undetected carrier' });
    }

    const scraper = scrapers[detectedCarrier];
    const result = await scraper(normalizedNumber);

    if (!result || !result.trackingNumber) {
      return res.status(502).json({ success: false, data: null, message: 'Unable to retrieve tracking data' });
    }

    const normalizedResult = {
      carrierKey: detectedCarrier,
      carrierName: result.carrierName || detectedCarrier.toUpperCase(),
      trackingNumber: result.trackingNumber,
      currentStatus: result.currentStatus || 'Status unavailable',
      estimatedDelivery: result.estimatedDelivery || null,
      lastUpdated: result.lastUpdated || null,
      origin: result.origin || null,
      destination: result.destination || null,
      checkpoints: Array.isArray(result.checkpoints) ? result.checkpoints : [],
    };

    if (normalizedResult.trackingNumber && normalizedResult.currentStatus) {
      const historyRow = saveHistory(normalizedResult);
      await run(
        'INSERT INTO history (trackingNumber, carrier, status, lastUpdated, createdAt) VALUES (?, ?, ?, ?, datetime("now"))',
        [historyRow.trackingNumber, historyRow.carrier, historyRow.status, historyRow.lastUpdated]
      );
    }

    res.json({ success: true, data: normalizedResult, message: 'Tracking retrieved' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
