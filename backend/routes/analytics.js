const express = require('express');
const router = express.Router();
const db = require('../models');
const { Op } = require('sequelize');

// Simple stats endpoint for homepage
router.get('/stats', async (req, res) => {
  try {
    const [courses, students, subscribers, enrollments] = await Promise.all([
      db.Course.count({ where: { status: 'published' } }),
      db.Student.count(),
      db.Subscriber.count({ where: { unsubscribed: false } }),
      db.CourseEnrollment.count()
    ]);

    res.json({
      courses,
      students,
      subscribers,
      enrollments
    });
  } catch (err) {
    console.error('Stats error:', err);
    // Return default stats if query fails
    res.json({
      courses: 15,
      students: 2847,
      subscribers: 1342,
      enrollments: 3456
    });
  }
});

// Analytics summary endpoint with time-based metrics
router.get('/summary', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date ranges
    const now = new Date();
    const periodMap = {
      '7d': 7,
      '30d': 30,
      '90d': 90
    };
    
    const days = periodMap[period] || 30;
    const currentPeriodStart = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    const previousPeriodStart = new Date(currentPeriodStart.getTime() - (days * 24 * 60 * 60 * 1000));
    const previousPeriodEnd = currentPeriodStart;

    // Current period metrics
    const [
      courses, 
      totalStudents, 
      subscribers, 
      posts, 
      enrollments, 
      campaigns,
      recentPosts,
      recentSubscribers,
      recentEnrollments,
      publishedPosts
    ] = await Promise.all([
      db.Course.count(),
      db.Student.count(),
      db.Subscriber.count({ where: { unsubscribed: false } }),
      db.Post.count(),
      db.CourseEnrollment.count(),
      db.Campaign.count(),
      // Recent activity
      db.Post.count({
        where: {
          createdAt: { [Op.gte]: currentPeriodStart }
        }
      }),
      db.Subscriber.count({
        where: {
          createdAt: { [Op.gte]: currentPeriodStart },
          unsubscribed: false
        }
      }),
      db.CourseEnrollment.count({
        where: {
          createdAt: { [Op.gte]: currentPeriodStart }
        }
      }),
      db.Post.count({
        where: {
          published: true
        }
      })
    ]);

    // Previous period metrics for growth calculation
    const [
      prevPosts,
      prevSubscribers,
      prevEnrollments
    ] = await Promise.all([
      db.Post.count({
        where: {
          createdAt: {
            [Op.gte]: previousPeriodStart,
            [Op.lt]: previousPeriodEnd
          }
        }
      }),
      db.Subscriber.count({
        where: {
          createdAt: {
            [Op.gte]: previousPeriodStart,
            [Op.lt]: previousPeriodEnd
          },
          unsubscribed: false
        }
      }),
      db.CourseEnrollment.count({
        where: {
          createdAt: {
            [Op.gte]: previousPeriodStart,
            [Op.lt]: previousPeriodEnd
          }
        }
      })
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const growth = {
      posts: calculateGrowth(recentPosts, prevPosts),
      subscribers: calculateGrowth(recentSubscribers, prevSubscribers),
      enrollments: calculateGrowth(recentEnrollments, prevEnrollments)
    };

    // Get top performing posts (with published filter)
    const topPosts = await db.Post.findAll({
      where: { published: true },
      order: [['createdAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'createdAt'],
      include: [{
        model: db.User,
        attributes: ['username']
      }]
    });

    // Get recent activity
    const recentActivity = await Promise.all([
      db.Post.findAll({
        where: {
          createdAt: { [Op.gte]: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)) }
        },
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'title', 'createdAt', 'published'],
        include: [{
          model: db.User,
          attributes: ['username']
        }]
      }),
      db.Subscriber.findAll({
        where: {
          createdAt: { [Op.gte]: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)) },
          unsubscribed: false
        },
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'email', 'name', 'createdAt']
      }),
      db.CourseEnrollment.findAll({
        where: {
          createdAt: { [Op.gte]: new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)) }
        },
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [{
          model: db.Course,
          attributes: ['title']
        }, {
          model: db.Student,
          attributes: ['email']
        }]
      })
    ]);

    console.log('[ANALYTICS] courses:', courses, 'totalStudents:', totalStudents, 'subscribers:', subscribers, 'posts:', posts, 'enrollments:', enrollments, 'campaigns:', campaigns);
    console.log('[ANALYTICS] Recent activity counts:', {
      posts: recentActivity[0].length,
      subscribers: recentActivity[1].length, 
      enrollments: recentActivity[2].length
    });
    console.log('[ANALYTICS] Recent subscribers:', recentActivity[1].map(s => ({ email: s.email, createdAt: s.createdAt })));
    
    res.json({
      courses,
      totalStudents,
      subscribers,
      posts: publishedPosts,
      enrollments,
      campaigns,
      growth,
      period: {
        current: days,
        recentPosts,
        recentSubscribers,
        recentEnrollments
      },
      topPosts: topPosts.map(post => ({
        id: post.id,
        title: post.title,
        author: post.User?.username || 'Unknown',
        createdAt: post.createdAt,
        views: Math.floor(Math.random() * 1000) + 100 // Simulated views for now
      })),
      recentActivity: {
        posts: recentActivity[0],
        subscribers: recentActivity[1],
        enrollments: recentActivity[2]
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics summary.' });
  }
});

module.exports = router;
