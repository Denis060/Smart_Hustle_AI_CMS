const express = require('express');
const router = express.Router();
const { Tag } = require('../models');
const { authenticateJWT } = require('../middleware/auth');

// Get all tags
router.get('/', async (req, res) => {
  const tags = await Tag.findAll();
  res.json(tags);
});

// Create tag (admin only)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await Tag.create({ name });
    res.status(201).json(tag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update tag (admin only)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ error: 'Tag not found' });
    await tag.update(req.body);
    res.json(tag);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete tag (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ error: 'Tag not found' });
    await tag.destroy();
    res.json({ message: 'Tag deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
