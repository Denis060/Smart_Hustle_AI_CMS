// Scheduled Campaign Sender
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
setInterval(async () => {
  try {
    const now = new Date();
    // Find campaigns scheduled in the past that have not been sent
    const pending = await db.Campaign.findAll({
      where: {
        scheduledAt: { [Op.lte]: now },
        sentAt: null
      }
    });
    for (const campaign of pending) {
      // Load recipients
      let recipients = [];
      if (campaign.recipient === 'all') {
        recipients = await db.Subscriber.findAll({ attributes: ['email', 'name'] });
      } else if (campaign.recipient && campaign.recipient.startsWith('course:')) {
        const courseId = campaign.recipient.split(':')[1];
        const enrollments = await db.CourseEnrollment.findAll({
          where: { courseId },
          include: [{ model: db.Student, attributes: ['email', 'name'] }]
        });
        recipients = enrollments.map(e => e.Student).filter(Boolean);
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
      if (!smtp_host || !smtp_port || !smtp_user || !smtp_pass || !from_email) continue;
      const transporter = nodemailer.createTransport({
        host: smtp_host,
        port: smtp_port,
        secure: smtp_secure,
        auth: { user: smtp_user, pass: smtp_pass },
      });
      let sentCount = 0;
      let failed = 0;
      for (const r of recipients) {
        try {
          const personalizedText = campaign.body.replace(/\{name\}/gi, r.name || '');
          const personalizedHtml = campaign.body.replace(/\{name\}/gi, r.name || '');
          await transporter.sendMail({
            from: `${from_name} <${from_email}>`,
            to: r.email,
            subject: campaign.subject,
            text: personalizedText,
            html: personalizedHtml
          });
          sentCount++;
        } catch (e) {
          failed++;
        }
      }
      campaign.sentAt = new Date();
      campaign.sentCount = sentCount;
      campaign.failCount = failed;
      await campaign.save();
      console.log(`Scheduled campaign sent: ${campaign.subject} (${sentCount} sent, ${failed} failed)`);
    }
  } catch (err) {
    console.error('Scheduled campaign sender error:', err);
  }
}, 60000); // every 60 seconds
console.log('Backend index.js loaded from:', __filename);
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const path = require('path');
const app = express();


app.use(cors());
app.use(express.json());
// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/posts', express.static(path.join(__dirname, 'uploads/posts')));

// Import routes

const settingsRoutes = require('./routes/settings');
const campaignsRoutes = require('./routes/campaigns');
const subscribersRoutes = require('./routes/subscribers');
const mediaRoutes = require('./routes/media');
const coursesRoutes = require('./routes/courses');
const enrollmentsRoutes = require('./routes/enrollments');
const commentsRoutes = require('./routes/comments');
const tagsRoutes = require('./routes/tags');
const categoriesRoutes = require('./routes/categories');
const authRoutes = require('./routes/auth');
const uploadsRoutes = require('./routes/uploads');
const analyticsRoutes = require('./routes/analytics');

const postInteractionsRoutes = require('./routes/postInteractions');
const postsRoutes = require('./routes/posts');

// Use routes


// Register all admin and public API routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/posts', postInteractionsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/campaigns', campaignsRoutes);
app.use('/api/subscribers', subscribersRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/auth', authRoutes);


// About page route (simple static for now)
app.get('/api/pages/about', (req, res) => {
  res.json({
    content: `
      <p>Smart Hustle AI is your go-to platform for mastering AI, data science, and modern business skills. We provide curated courses, insightful blogs, and practical resources to help you stay ahead in the digital age.</p>
      <p>Our mission is to empower entrepreneurs, creators, and professionals to leverage AI for real-world impact. All content is handpicked and created by industry experts.</p>
      <p>Contact us at <a href="mailto:info@smarthustle.ai" class="text-cyan-400">info@smarthustle.ai</a></p>
    `
  });
});

// About page route (fetch from DB Setting table)
const db = require('./models');
app.get('/api/pages/about', async (req, res) => {
  try {
    const aboutSetting = await db.Setting.findOne({ where: { key: 'about' } });
    if (!aboutSetting) {
      return res.status(404).json({ content: '<p>About page not set.</p>' });
    }
    res.json({ content: aboutSetting.value });
  } catch (err) {
    res.status(500).json({ content: '<p>Error loading About page.</p>' });
  }
});

app.get('/', (req, res) => {
  res.send('Smart Hustle with AI Backend API');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  // Auto-publish scheduled posts
const { Post } = require('./models');
const { Op } = require('sequelize');

const checkScheduledPosts = async () => {
  try {
    const now = new Date();
    const scheduledPosts = await Post.findAll({
      where: {
        scheduledAt: {
          [Op.lte]: now
        },
        published: false
      }
    });

    if (scheduledPosts.length > 0) {
      console.log(`Publishing ${scheduledPosts.length} scheduled posts...`);
      
      for (const post of scheduledPosts) {
        await post.update({ 
          published: true,
          scheduledAt: null // Clear schedule after publishing
        });
        console.log(`📰 Published scheduled post: "${post.title}"`);
      }
    }
  } catch (error) {
    console.error('Error checking scheduled posts:', error);
  }
};

// Check for scheduled posts every minute
setInterval(checkScheduledPosts, 60000);
console.log('📅 Post scheduler started - checking every minute for scheduled posts');

console.log('Server running on port', PORT);
});
