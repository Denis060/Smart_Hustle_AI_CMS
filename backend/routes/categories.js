const express = require('express');
const router = express.Router();
const { Category, Tag } = require('../models');
const { authenticateJWT } = require('../middleware/auth');

// Get all categories (with tags)
router.get('/', async (req, res) => {
  const categories = await Category.findAll({ include: { model: Tag, as: 'tags' } });
  res.json(categories);
});

// Create category (admin only, with tags)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { name, description, tagIds } = req.body;
    const category = await Category.create({ name, description });
    if (Array.isArray(tagIds) && tagIds.length > 0) {
      await category.setTags(tagIds);
    }
    const result = await Category.findByPk(category.id, { include: { model: Tag, as: 'tags' } });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update category (admin only, with tags)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const { name, description, tagIds } = req.body;
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    await category.update({ name, description });
    if (Array.isArray(tagIds)) {
      await category.setTags(tagIds);
    }
    const result = await Category.findByPk(category.id, { include: { model: Tag, as: 'tags' } });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete category (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });
    await category.destroy();
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
