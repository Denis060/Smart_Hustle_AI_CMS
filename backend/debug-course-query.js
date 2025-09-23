const { Course, Student, Category, User } = require('./models');

async function debugCourseQuery() {
  try {
    console.log('Testing direct database query...');
    
    // Test raw SQL query first
    const [rawResults] = await Course.sequelize.query("SELECT title, status, external FROM Courses LIMIT 3");
    console.log('Raw SQL results:');
    rawResults.forEach(course => {
      console.log(`- ${course.title}: status=${course.status}, external=${course.external}`);
    });
    
    // Test Sequelize query
    console.log('\nSequelize findAll results:');
    const courses = await Course.findAll({
      limit: 3,
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
          through: { attributes: [] },
          attributes: ['id'],
        }
      ]
    });
    
    courses.forEach(course => {
      const obj = course.toJSON();
      console.log(`- ${obj.title}: status=${obj.status}, external=${obj.external}`);
      console.log(`  Raw dataValues:`, course.dataValues.status, course.dataValues.external);
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugCourseQuery();