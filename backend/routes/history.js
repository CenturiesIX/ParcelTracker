const express = require('express');
const router = express.Router();
const { all, run } = require('../db/database');

router.get('/', async (req, res, next) => {
  try {
    const history = await all('SELECT * FROM history ORDER BY datetime(createdAt) DESC');
    res.json({ success: true, data: history, message: 'History loaded' });
  } catch (error) {
    next(error);
  }
});

router.delete('/', async (req, res, next) => {
  try {
    await run('DELETE FROM history');
    res.json({ success: true, data: null, message: 'History cleared' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
