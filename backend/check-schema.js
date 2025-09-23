const { Course, CourseEnrollment, Student } = require('./models');

async function checkCourseSchema() {
  try {
    console.log('Checking course schema...');
    
    // Get a sample course
    const sampleCourse = await Course.findOne({
      include: [
        {
          model: Student,
          through: { attributes: [] },
          attributes: ['id', 'name']
        }
      ]
    });
    
    if (sampleCourse) {
      console.log('Sample course structure:');
      console.log(JSON.stringify(sampleCourse.toJSON(), null, 2));
    }
    
    // Check raw database schema
    const [results] = await Course.sequelize.query("DESCRIBE Courses");
    console.log('\nCourse table columns:');
    results.forEach(col => {
      console.log(`- ${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'nullable' : 'not null'})`);
    });
    
  } catch (error) {
    console.error('Error checking schema:', error);
  }
}

checkCourseSchema();