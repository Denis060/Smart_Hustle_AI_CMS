const express = require('express');
const router = express.Router();
const { Campaign } = require('../models');
const { authenticateJWT } = require('../middleware/auth');

// Get all campaigns (admin only)
router.get('/', authenticateJWT, async (req, res) => {
  const campaigns = await Campaign.findAll();
  res.json(campaigns);
});

// Create campaign (admin only)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { subject, body, sentAt } = req.body;
    const campaign = await Campaign.create({ subject, body, sentAt });
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete campaign (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const campaign = await Campaign.findByPk(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    await campaign.destroy();
    res.json({ message: 'Campaign deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
