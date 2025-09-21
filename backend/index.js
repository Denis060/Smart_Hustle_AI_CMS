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

const postInteractionsRoutes = require('./routes/postInteractions');
const postsRoutes = require('./routes/posts');

// Use routes
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

app.use('/api/uploads', uploadsRoutes);
app.use('/api/posts', postInteractionsRoutes);
app.use('/api/posts', postsRoutes);


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
  console.log(`Server running on port ${PORT}`);
});
