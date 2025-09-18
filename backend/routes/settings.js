const express = require('express');
const router = express.Router();
const { Setting } = require('../models');
const { authenticateJWT } = require('../middleware/auth');

// Get all settings (admin only)
router.get('/', authenticateJWT, async (req, res) => {
  const settings = await Setting.findAll();
  res.json(settings);
});

// Update or create setting (admin only)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { key, value } = req.body;
    let setting = await Setting.findOne({ where: { key } });
    if (setting) {
      await setting.update({ value });
    } else {
      setting = await Setting.create({ key, value });
    }
    res.json(setting);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
