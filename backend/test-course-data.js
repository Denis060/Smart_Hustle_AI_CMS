const { Course, Category, Student, CourseEnrollment } = require('./models');

async function testCourseData() {
  try {
    console.log('Testing course data...');
    
    // Check if we have any courses
    const courses = await Course.findAll({
      include: [
        {
          model: Category,
          as: 'category'
        }
      ]
    });
    
    console.log(`Found ${courses.length} courses:`);
    courses.forEach(course => {
      console.log(`- ${course.title} (ID: ${course.id})`);
    });
    
    // Check students
    const students = await Student.findAll();
    console.log(`\nFound ${students.length} students:`);
    students.forEach(student => {
      console.log(`- ${student.name} (${student.email})`);
    });
    
    // Check enrollments
    const enrollments = await CourseEnrollment.findAll();
    console.log(`\nFound ${enrollments.length} enrollments:`);
    enrollments.forEach(enrollment => {
      console.log(`- Student ${enrollment.studentId} enrolled in Course ${enrollment.courseId}`);
    });
    
    // Test creating a sample course if none exist
    if (courses.length === 0) {
      console.log('\nCreating sample course...');
      const sampleCourse = await Course.create({
        title: 'Introduction to Web Development',
        description: 'Learn the basics of HTML, CSS, and JavaScript',
        price: 99.99,
        currency: 'USD',
        duration: '8 weeks',
        lessonCount: 32,
        videoCount: 25,
        status: 'published',
        difficulty: 'beginner',
        prerequisites: ['Basic computer skills'],
        learningOutcomes: ['Build responsive websites', 'Understand JavaScript fundamentals'],
        tags: ['web development', 'html', 'css', 'javascript'],
        featured: true,
        enrollmentCount: 0
      });
      console.log('Sample course created:', sampleCourse.title);
    }
    
    // Test creating sample students if none exist
    if (students.length === 0) {
      console.log('\nCreating sample students...');
      const student1 = await Student.create({
        name: 'John Doe',
        email: 'john@example.com',
        interest: 'Web Development',
        motivation: 'Career change'
      });
      
      const student2 = await Student.create({
        name: 'Jane Smith',
        email: 'jane@example.com',
        interest: 'Data Science',
        motivation: 'Skill improvement'
      });
      
      console.log('Sample students created');
      
      // Create sample enrollments
      if (courses.length > 0) {
        await CourseEnrollment.create({
          courseId: courses[0].id,
          studentId: student1.id
        });
        
        await CourseEnrollment.create({
          courseId: courses[0].id,
          studentId: student2.id
        });
        
        console.log('Sample enrollments created');
      }
    }
    
  } catch (error) {
    console.error('Error testing course data:', error);
  }
}

testCourseData();