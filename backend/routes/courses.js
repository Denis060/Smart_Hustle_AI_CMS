const express = require('express');
const router = express.Router();
const { Course, User, Category, Student, CourseEnrollment } = require('../models');
const { authenticateJWT } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const { Op } = require('sequelize');

// Get all courses
router.get('/', async (req, res) => {
  try {
    const { status, category, featured, search } = req.query;
    const where = {};
    
    // Apply filters
    if (status) where.status = status;
    if (category) where.categoryId = category;
    if (featured === 'true') where.featured = true;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const courses = await Course.findAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username']
        },
        {
          model: Student,
          through: { attributes: [] }, // Don't include junction table data
          attributes: ['id'], // We only need to count, so minimal attributes
        }
      ],
      order: [['featured', 'DESC'], ['createdAt', 'DESC']]
    });
    
    // Add isOwned and actual student count to each course
    const coursesWithIsOwned = courses.map(c => {
      const obj = c.toJSON();
      obj.isOwned = !obj.external;
      obj.enrollmentCount = obj.Students ? obj.Students.length : 0; // Get actual count
      delete obj.Students; // Remove the students array to keep response clean
      return obj;
    });
    
    res.json(coursesWithIsOwned);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single course
router.get('/:id', async (req, res) => {
  const course = await Course.findByPk(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const obj = course.toJSON();
  obj.isOwned = !obj.external;
  res.json(obj);
});

// Create course (admin only, with image upload)
router.post('/', authenticateJWT, upload.single('image'), async (req, res) => {
  try {
    const { 
      title, description, affiliateLink, review, provider, isOwned, level,
      price, currency, duration, lessonCount, videoCount, status, categoryId,
      difficulty, prerequisites, learningOutcomes, tags, featured
    } = req.body;
    
    let featuredImage = req.body.featuredImage;
    if (req.file) {
      featuredImage = `/uploads/${req.file.filename}`;
    }
    
    // Store 'external' as the opposite of isOwned for legacy compatibility
    const external = isOwned === 'true' || isOwned === true ? false : true;
    
    // Parse JSON fields if they're strings
    const parseJsonField = (field) => {
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return [];
        }
      }
      return Array.isArray(field) ? field : [];
    };

    const course = await Course.create({
      title,
      description,
      ownerId: req.user.id,
      featuredImage,
      external,
      affiliateLink,
      review,
      provider,
      level: level ? level.toLowerCase() : null,
      price: price ? parseFloat(price) : 0.00,
      currency: currency || 'USD',
      duration,
      lessonCount: lessonCount ? parseInt(lessonCount) : 0,
      videoCount: videoCount ? parseInt(videoCount) : 0,
      status: status || 'draft',
      categoryId: categoryId ? parseInt(categoryId) : null,
      difficulty: difficulty || 'beginner',
      prerequisites: parseJsonField(prerequisites),
      learningOutcomes: parseJsonField(learningOutcomes),
      tags: parseJsonField(tags),
      featured: featured === 'true' || featured === true ? true : false
    });
    
    // Add isOwned to response for frontend logic
    const courseObj = course.toJSON();
    courseObj.isOwned = !courseObj.external;
    res.status(201).json(courseObj);
  } catch (err) {
    console.error('Course creation error:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update course (admin only, with image upload)
router.put('/:id', authenticateJWT, upload.single('image'), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    
    let featuredImage = req.body.featuredImage;
    if (req.file) {
      featuredImage = `/uploads/${req.file.filename}`;
    }
    
    // Only allow updating fields that exist in the model
    const updateFields = {};
    const allowedFields = [
      'title', 'description', 'affiliateLink', 'review', 'provider', 'level',
      'price', 'currency', 'duration', 'lessonCount', 'videoCount', 'status',
      'categoryId', 'difficulty', 'prerequisites', 'learningOutcomes', 'tags', 'featured'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'price') {
          updateFields[field] = req.body[field] ? parseFloat(req.body[field]) : 0;
        } else if (['lessonCount', 'videoCount'].includes(field)) {
          updateFields[field] = req.body[field] ? parseInt(req.body[field]) : 0;
        } else if (field === 'categoryId') {
          // Handle categoryId specially - empty string should become null
          updateFields[field] = req.body[field] && req.body[field] !== '' ? parseInt(req.body[field]) : null;
        } else if (['prerequisites', 'learningOutcomes', 'tags'].includes(field)) {
          // Parse JSON fields if they're strings
          const parseJsonField = (value) => {
            if (typeof value === 'string') {
              try {
                return JSON.parse(value);
              } catch {
                return [];
              }
            }
            return Array.isArray(value) ? value : [];
          };
          updateFields[field] = parseJsonField(req.body[field]);
        } else if (field === 'featured') {
          updateFields[field] = req.body[field] === 'true' || req.body[field] === true;
        } else {
          updateFields[field] = req.body[field];
        }
      }
    });
    
    if (req.body.isOwned !== undefined) {
      updateFields.external = req.body.isOwned === 'true' || req.body.isOwned === true ? false : true;
    }
    if (featuredImage) updateFields.featuredImage = featuredImage;
    
    await course.update(updateFields);
    const courseObj = course.toJSON();
    courseObj.isOwned = !courseObj.external;
    res.json(courseObj);
  } catch (err) {
    console.error('Course update error:', err);
    res.status(400).json({ error: err.message });
  }
});
// Serve uploaded images statically
const app = require('express')();
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Delete course (admin only)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    await course.destroy();
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
