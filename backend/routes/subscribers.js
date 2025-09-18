const express = require('express');
const router = express.Router();
const { Subscriber } = require('../models');
const { authenticateJWT } = require('../middleware/auth');

// Get all subscribers (admin only)
router.get('/', authenticateJWT, async (req, res) => {
  const subscribers = await Subscriber.findAll();
  res.json(subscribers);
});

// Add subscriber (public)
router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body;
    const subscriber = await Subscriber.create({ email, name });
    res.status(201).json(subscriber);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete subscriber (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const subscriber = await Subscriber.findByPk(req.params.id);
    if (!subscriber) return res.status(404).json({ error: 'Subscriber not found' });
    await subscriber.destroy();
    res.json({ message: 'Subscriber deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
