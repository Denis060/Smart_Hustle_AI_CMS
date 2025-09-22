// Usage: node scripts/print_enrollments_and_students.js
const db = require('../models');

async function printEnrollmentsAndStudents() {
  try {
    await db.sequelize.authenticate();
    console.log('DB connection established.');
    const enrollments = await db.CourseEnrollment.findAll();
    if (enrollments.length === 0) {
      console.log('No enrollments found.');
      process.exit(0);
    }
    console.log('Enrollments:');
    for (const e of enrollments) {
      const student = await db.Student.findByPk(e.studentId);
      console.log({
        enrollmentId: e.id,
        courseId: e.courseId,
        studentId: e.studentId,
        studentExists: !!student,
        studentName: student ? student.name : null,
        studentEmail: student ? student.email : null
      });
    }
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

printEnrollmentsAndStudents();
