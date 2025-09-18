const express = require('express');
const router = express.Router();
const { Media } = require('../models');
const { authenticateJWT } = require('../middleware/auth');

// Get all media
router.get('/', async (req, res) => {
  const media = await Media.findAll();
  res.json(media);
});

// Add media (admin only)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { url, altText } = req.body;
    const media = await Media.create({ url, altText });
    res.status(201).json(media);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete media (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const media = await Media.findByPk(req.params.id);
    if (!media) return res.status(404).json({ error: 'Media not found' });
    await media.destroy();
    res.json({ message: 'Media deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
