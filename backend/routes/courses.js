const express = require('express');
const router = express.Router();
const { Course, User } = require('../models');
const { authenticateJWT } = require('../middleware/auth');

// Get all courses
router.get('/', async (req, res) => {
  const courses = await Course.findAll({ include: [User] });
  res.json(courses);
});

// Get single course
router.get('/:id', async (req, res) => {
  const course = await Course.findByPk(req.params.id, { include: [User] });
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

// Create course (admin only)
router.post('/', authenticateJWT, async (req, res) => {
  try {
    const { title, description, featuredImage, external, affiliateLink, review } = req.body;
    const course = await Course.create({
      title,
      description,
      ownerId: req.user.id,
      featuredImage,
      external: !!external,
      affiliateLink,
      review
    });
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update course (admin only)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    await course.update(req.body);
    res.json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

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
