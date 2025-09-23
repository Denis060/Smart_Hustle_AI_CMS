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
const crypto = require('crypto');
router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body;
    // Generate a unique unsubscribe token
    const unsubscribeToken = crypto.randomBytes(24).toString('hex');
    const subscriber = await Subscriber.create({ email, name, unsubscribeToken });
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


// Unsubscribe endpoint (public)
router.get('/unsubscribe/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const subscriber = await Subscriber.findOne({ where: { unsubscribeToken: token } });
    if (!subscriber) return res.status(404).send('Invalid unsubscribe link.');
    subscriber.unsubscribed = true;
    await subscriber.save();
    res.send('You have been unsubscribed from future emails.');
  } catch (err) {
    res.status(400).send('Unsubscribe failed.');
  }
});

// Add sample recent subscribers for testing analytics (admin only)
router.post('/sample-recent', authenticateJWT, async (req, res) => {
  try {
    const sampleEmails = [
      'john.doe@example.com',
      'sarah.smith@gmail.com', 
      'mike.johnson@yahoo.com',
      'emma.wilson@outlook.com',
      'alex.brown@protonmail.com'
    ];
    
    const sampleNames = [
      'John Doe',
      'Sarah Smith',
      'Mike Johnson', 
      'Emma Wilson',
      'Alex Brown'
    ];

    const subscribers = [];
    const now = new Date();
    
    for (let i = 0; i < sampleEmails.length; i++) {
      const createdAt = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)); // Each subscriber from a different day
      const unsubscribeToken = crypto.randomBytes(24).toString('hex');
      
      // Check if subscriber already exists
      const existingSubscriber = await Subscriber.findOne({ where: { email: sampleEmails[i] } });
      if (!existingSubscriber) {
        const subscriber = await Subscriber.create({
          email: sampleEmails[i],
          name: sampleNames[i],
          unsubscribeToken,
          createdAt,
          updatedAt: createdAt
        });
        subscribers.push(subscriber);
      }
    }
    
    res.json({ 
      message: `Created ${subscribers.length} sample recent subscribers`, 
      subscribers 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
