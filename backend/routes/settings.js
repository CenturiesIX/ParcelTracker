const express = require('express');
const router = express.Router();
const { get, run } = require('../db/database');

const defaultSettings = {
  id: 1,
  theme: 'light',
  animationsEnabled: 1,
  defaultCarrier: 'auto',
};

const loadSettings = async () => {
  const existing = await get('SELECT * FROM settings WHERE id = 1');
  if (!existing) {
    await run('INSERT INTO settings (id, theme, animationsEnabled, defaultCarrier) VALUES (1, ?, ?, ?)', [
      defaultSettings.theme,
      defaultSettings.animationsEnabled,
      defaultSettings.defaultCarrier,
    ]);
    return defaultSettings;
  }
  return existing;
};

router.get('/', async (req, res, next) => {
  try {
    const settings = await loadSettings();
    res.json({ success: true, data: settings, message: 'Settings loaded' });
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const { theme, animationsEnabled, defaultCarrier } = req.body;
    const settings = await loadSettings();
    const updated = {
      theme: theme || settings.theme,
      animationsEnabled: typeof animationsEnabled === 'number' ? animationsEnabled : settings.animationsEnabled,
      defaultCarrier: defaultCarrier || settings.defaultCarrier,
    };
    await run('UPDATE settings SET theme = ?, animationsEnabled = ?, defaultCarrier = ? WHERE id = 1', [
      updated.theme,
      updated.animationsEnabled,
      updated.defaultCarrier,
    ]);
    res.json({ success: true, data: { id: 1, ...updated }, message: 'Settings saved' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
