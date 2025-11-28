const normalizeText = (text) => (text ? text.replace(/\s+/g, ' ').trim() : '');

const safeValue = (value, fallback = null) => {
  const normalized = normalizeText(value);
  if (normalized.length === 0 || normalized.toLowerCase() === 'undefined') return fallback;
  return normalized;
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
