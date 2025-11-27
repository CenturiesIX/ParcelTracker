const normalizeText = (text) => text ? text.replace(/\s+/g, ' ').trim() : '';

const safeValue = (value, fallback = '') => {
  const normalized = normalizeText(value);
  return normalized.length > 0 ? normalized : fallback;
};

const saveHistory = (result) => ({
  trackingNumber: result.trackingNumber,
  carrier: result.carrierName,
  status: result.currentStatus,
  lastUpdated: result.lastUpdated || null,
});

module.exports = {
  normalizeText,
  safeValue,
  saveHistory,
};
