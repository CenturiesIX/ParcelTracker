const errorHandler = (err, req, res, next) => {
  console.error('API error:', err);
  res.status(500).json({ success: false, data: null, message: 'Internal server error' });
};

module.exports = {
  errorHandler,
};
