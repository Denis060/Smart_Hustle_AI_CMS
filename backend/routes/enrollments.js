const express = require('express');
const router = express.Router();
const { Course, Student, CourseEnrollment } = require('../models');

// Enroll a student in a course
router.post('/enroll', async (req, res) => {
  try {
    const { courseId, name, email, interest, motivation } = req.body;
    
    // Validate required fields
    if (!courseId || !name || !email) {
      return res.status(400).json({ error: 'Course ID, name, and email are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address' });
    }

    // Check if course exists and is published
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    if (course.status !== 'published') {
      return res.status(400).json({ error: 'This course is not currently available for enrollment' });
    }

    // Find or create student
    let [student, studentCreated] = await Student.findOrCreate({
      where: { email },
      defaults: { name, email, interest, motivation }
    });

    // Update student info if they already exist
    if (!studentCreated) {
      await student.update({ name, interest, motivation });
    }

    // Check if already enrolled
    const existingEnrollment = await CourseEnrollment.findOne({
      where: { courseId, studentId: student.id }
    });

    if (existingEnrollment) {
      return res.status(400).json({ 
        error: 'You are already enrolled in this course',
        alreadyEnrolled: true 
      });
    }

    // Create enrollment
    const enrollment = await CourseEnrollment.create({
      courseId,
      studentId: student.id
    });

    // Send successful response with enrollment details
    res.json({ 
      success: true, 
      message: 'Successfully enrolled in the course!',
      enrollment: {
        id: enrollment.id,
        courseId: course.id,
        courseTitle: course.title,
        studentId: student.id,
        studentName: student.name,
        enrolledAt: enrollment.createdAt
      },
      course: {
        id: course.id,
        title: course.title,
        duration: course.duration,
        difficulty: course.difficulty || course.level
      }
    });
  } catch (err) {
    console.error('Enrollment error:', err);
    res.status(500).json({ error: 'Failed to process enrollment. Please try again.' });
  }
});

// Check enrollment status for a course and email
router.get('/check/:courseId/:email', async (req, res) => {
  try {
    const { courseId, email } = req.params;
    
    const student = await Student.findOne({ where: { email } });
    if (!student) {
      return res.json({ enrolled: false });
    }

    const enrollment = await CourseEnrollment.findOne({
      where: { courseId, studentId: student.id },
      include: [{ model: Course }]
    });

    if (enrollment) {
      res.json({ 
        enrolled: true, 
        enrollmentDate: enrollment.createdAt,
        course: enrollment.Course
      });
    } else {
      res.json({ enrolled: false });
    }
  } catch (err) {
    console.error('Check enrollment error:', err);
    res.status(500).json({ error: 'Failed to check enrollment status' });
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

// Get student by email
router.get('/students/email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const student = await Student.findOne({ where: { email } });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ error: 'Failed to retrieve student data' });
  }
});

module.exports = router;
