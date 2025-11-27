const express = require('express');
const path = require('path');
const cors = require('cors');
const trackRoute = require('./routes/track');
const historyRoute = require('./routes/history');
const settingsRoute = require('./routes/settings');
const { errorHandler } = require('./util/errorHandler');
require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/track', trackRoute);
app.use('/api/history', historyRoute);
app.use('/api/settings', settingsRoute);

app.use((req, res) => {
  res.status(404).json({ success: false, data: null, message: 'Not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Tracketta server running on port ${PORT}`);
});
