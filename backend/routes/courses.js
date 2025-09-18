const express = require('express');
const router = express.Router();
const { Course, User } = require('../models');
const { authenticateJWT } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');

// Get all courses
router.get('/', async (req, res) => {
  const courses = await Course.findAll();
  // Add isOwned to each course for frontend logic
  const coursesWithIsOwned = courses.map(c => {
    const obj = c.toJSON();
    obj.isOwned = !obj.external;
    return obj;
  });
  res.json(coursesWithIsOwned);
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
    const { title, description, affiliateLink, review, provider, isOwned, level } = req.body;
    let featuredImage = req.body.featuredImage;
    if (req.file) {
      featuredImage = `/uploads/${req.file.filename}`;
    }
    // Store 'external' as the opposite of isOwned for legacy compatibility
    const external = isOwned === 'true' || isOwned === true ? false : true;
    const course = await Course.create({
      title,
      description,
      ownerId: req.user.id,
      featuredImage,
      external,
      affiliateLink,
      review,
      provider,
      level: level ? level.toLowerCase() : null
    });
    // Add isOwned to response for frontend logic
    const courseObj = course.toJSON();
    courseObj.isOwned = !courseObj.external;
    res.status(201).json(courseObj);
  } catch (err) {
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
    const allowedFields = ['title', 'description', 'affiliateLink', 'review', 'provider', 'level'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updateFields[field] = req.body[field];
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
