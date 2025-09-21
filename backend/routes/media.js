const express = require('express');
const router = express.Router();
const { Media } = require('../models');
const { authenticateJWT } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/media'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Get all media
router.get('/', async (req, res) => {
  const media = await Media.findAll();
  res.json(media);
});

// Add media (admin only, file upload)
router.post('/', authenticateJWT, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const altText = req.body.altText || '';
  // Save relative URL for frontend to access
  const url = `/uploads/media/${req.file.filename}`;
  const uploader = req.body.uploader || 'Ibrahim Denis Fofanah';
  const media = await Media.create({ url, altText, uploader });
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
