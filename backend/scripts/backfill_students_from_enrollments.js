// Usage: node scripts/backfill_students_from_enrollments.js
const db = require('../models');

async function backfillStudents() {
  try {
    await db.sequelize.authenticate();
    console.log('DB connection established.');
    // Get all enrollments with student info
    const enrollments = await db.CourseEnrollment.findAll({
      include: [{ model: db.Student }]
    });
    let created = 0;
    for (const enrollment of enrollments) {
      // If enrollment has no student, skip
      if (!enrollment.Student && enrollment.studentId) {
        // Try to find student by ID
        let student = await db.Student.findByPk(enrollment.studentId);
        if (!student) {
          // If not found, create a placeholder
          await db.Student.create({
            id: enrollment.studentId,
            name: 'Unknown',
            email: `unknown_${enrollment.studentId}@example.com`,
            interest: '',
            motivation: ''
          });
          created++;
        }
      }
    }
    console.log(`Backfill complete. Students created: ${created}`);
    process.exit(0);
  } catch (err) {
    console.error('Backfill error:', err);
    process.exit(1);
  }
}

backfillStudents();