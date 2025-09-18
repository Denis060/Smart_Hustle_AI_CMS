const express = require('express');
const router = express.Router();
const { Course, Student, CourseEnrollment } = require('../models');

// Enroll a student in a course
router.post('/enroll', async (req, res) => {
  try {
    const { courseId, name, email, interest, motivation } = req.body;
    if (!courseId || !name || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Find or create student
    let [student] = await Student.findOrCreate({
      where: { email },
      defaults: { name, interest, motivation }
    });
    // Update info if needed
    await student.update({ name, interest, motivation });
    // Enroll
    const [enrollment, created] = await CourseEnrollment.findOrCreate({
      where: { courseId, studentId: student.id }
    });
    res.json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List students for a course
router.get('/course/:courseId', async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.findAll({
      where: { courseId: req.params.courseId },
      include: [{ model: Student }]
    });
    res.json(enrollments.map(e => e.Student));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List courses for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const enrollments = await CourseEnrollment.findAll({
      where: { studentId: req.params.studentId },
      include: [{ model: Course }]
    });
    res.json(enrollments.map(e => e.Course));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
