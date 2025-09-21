console.log('Settings routes loaded');
console.log('Settings routes loaded from:', __filename);
const express = require('express');
const router = express.Router();

// Simple test route to verify route registration
router.get('/test', (req, res) => {
  res.json({ message: 'Settings route is working!' });
});
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


// Send test email using saved SMTP settings
router.post('/test-email', authenticateJWT, async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ error: 'No recipient email provided.' });
  try {
    // Fetch all settings
    const settingsArr = await Setting.findAll();
    const get = key => settingsArr.find(s => s.key === key)?.value || '';
    const smtp_host = get('smtp_host');
    const smtp_port = parseInt(get('smtp_port'), 10) || 587;
    const smtp_user = get('smtp_user');
    const smtp_pass = get('smtp_pass');
    const from_email = get('from_email');
    const from_name = get('from_name') || from_email;
    const smtp_secure = smtp_port === 465; // true for 465, false for others

    if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass || !from_email) {
      return res.status(400).json({ error: 'Missing SMTP settings.' });
    }

    // Send email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: smtp_port,
      secure: smtp_secure,
      auth: {
        user: smtp_user,
        pass: smtp_pass,
      },
    });

    await transporter.sendMail({
      from: `${from_name} <${from_email}>`,
      to,
      subject: 'Test Email from Smart Hustle',
      text: 'This is a test email to confirm your SMTP settings are working.',
      html: '<p>This is a <b>test email</b> to confirm your SMTP settings are working.</p>',
    });
    res.json({ success: true });
  } catch (err) {
    // Try to extract the most informative error message
    let errorMsg = err && err.message ? err.message : 'Failed to send test email.';
    if (err && err.response && err.response.message) {
      errorMsg += ' | ' + err.response.message;
    }
    if (err && err.response && err.response.body) {
      errorMsg += ' | ' + JSON.stringify(err.response.body);
    }
    res.status(500).json({ error: errorMsg });
  }
});

module.exports = router;
