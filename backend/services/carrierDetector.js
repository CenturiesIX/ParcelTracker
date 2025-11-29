const patterns = [
  { key: 'ups', regex: /\b1Z[0-9A-Z]{16}\b/i },
  { key: 'fedex', regex: /\b(\d{12}|\d{15}|\d{20})\b/ },
  { key: 'usps', regex: /\b\d{20,22}\b/ },
  { key: 'dhl', regex: /\b\d{10}\b/ },
  { key: 'lasership', regex: /\b(LL|LX)[0-9]{8,}/i },
  { key: 'amazon', regex: /\b(TBA|QX)[A-Z0-9]{12}\b/i },
];

const detect = (trackingNumber) => {
  const cleaned = trackingNumber.replace(/\s+/g, '');
  const match = patterns.find((p) => p.regex.test(cleaned));
  return match ? match.key : null;
};

module.exports = {
  detect,
  patterns,
};
