const express = require('express');
const router = express.Router();
const db = require('../models');

// Analytics summary endpoint
router.get('/summary', async (req, res) => {
  try {
    const [courses, subscribers, posts, enrollments, campaigns, totalStudents] = await Promise.all([
      db.Course.count(),
      db.Subscriber.count({ where: { unsubscribed: false } }),
      db.Post.count(),
      db.CourseEnrollment.count(),
      db.Campaign.count(),
      db.Student.count()
    ]);
    console.log('[ANALYTICS] courses:', courses, 'totalStudents:', totalStudents, 'subscribers:', subscribers, 'posts:', posts, 'enrollments:', enrollments, 'campaigns:', campaigns);
    res.json({
      courses,
      totalStudents,
      subscribers,
      posts,
      enrollments,
      campaigns
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics summary.' });
  }
});

module.exports = router;
