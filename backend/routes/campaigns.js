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
    // Load SMTP/email settings
    const settingsArr = await db.Setting.findAll();
    const get = key => settingsArr.find(s => s.key === key)?.value || '';
    const smtp_host = get('smtp_host');
    const smtp_port = parseInt(get('smtp_port'), 10) || 587;
    const smtp_user = get('smtp_user');
    const smtp_pass = get('smtp_pass');
    const from_email = get('from_email');
    const from_name = get('from_name') || from_email;
    const smtp_secure = smtp_port === 465;
    if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass || !from_email) {
      return res.status(400).json({ error: 'Missing SMTP settings.' });
    }
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: smtp_host,
      port: smtp_port,
      secure: smtp_secure,
      auth: { user: smtp_user, pass: smtp_pass },
    });

    // Send emails to all recipients
    let sentCount = 0;
    let failed = [];
    for (const r of recipients) {
      try {
        await transporter.sendMail({
          from: `${from_name} <${from_email}>`,
          to: r.email,
          subject,
          text: body,
          html: `<p>${body.replace(/\n/g, '<br>')}</p>`
        });
        sentCount++;
      } catch (e) {
        failed.push({ email: r.email, error: e.message });
      }
    }
    // Save campaign with sentAt if at least one sent
    const sentAtVal = sentCount > 0 ? new Date() : null;
    const campaign = await db.Campaign.create({ subject, body, sentAt: sentAtVal });
    res.status(201).json({ campaign, sent: sentCount, failed });
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
