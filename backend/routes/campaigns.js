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
const db = require('../models');
// Enhanced campaign creation with recipient logic
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { subject, body, sentAt, recipient } = req.body;
    let recipients = [];
    if (recipient === 'all') {
      // All subscribers
      recipients = await db.Subscriber.findAll({ attributes: ['email', 'name'] });
    } else if (recipient && recipient.startsWith('course:')) {
      // Students in a specific course
      const courseId = recipient.split(':')[1];
      const enrollments = await db.CourseEnrollment.findAll({
        where: { courseId },
        include: [{ model: db.Student, attributes: ['email', 'name'] }]
      });
      recipients = enrollments.map(e => e.Student).filter(Boolean);
    } else {
      return res.status(400).json({ error: 'Invalid recipient' });
    }
    // Save campaign
    const campaign = await db.Campaign.create({ subject, body, sentAt });
    // For now, just log recipients (simulate sending)
    res.status(201).json({ campaign, recipients });
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
