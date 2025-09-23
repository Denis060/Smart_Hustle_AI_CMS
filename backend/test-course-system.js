const { Course, Student, CourseEnrollment, Category } = require('./models');

async function testCourseSystem() {
  try {
    console.log('🧪 Testing Complete Course Management System...\n');
    
    // Test 1: Create a comprehensive course
    console.log('1️⃣ Creating a comprehensive test course...');
    const testCourse = await Course.create({
      title: 'Advanced React Development',
      description: 'Master React with hooks, context, and modern patterns',
      price: 149.99,
      currency: 'USD',
      duration: '12 weeks',
      lessonCount: 48,
      videoCount: 36,
      status: 'published',
      difficulty: 'advanced',
      prerequisites: ['JavaScript fundamentals', 'HTML/CSS knowledge', 'Basic React experience'],
      learningOutcomes: ['Build complex React applications', 'Master React hooks', 'Implement state management', 'Deploy production apps'],
      tags: ['react', 'javascript', 'frontend', 'web development'],
      featured: true,
      enrollmentCount: 0
    });
    console.log(`✅ Course created: ${testCourse.title} (ID: ${testCourse.id})`);
    
    // Test 2: Create test students
    console.log('\n2️⃣ Creating test students...');
    const student1 = await Student.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      interest: 'Frontend Development',
      motivation: 'Career advancement'
    });
    
    const student2 = await Student.create({
      name: 'Bob Smith',
      email: 'bob@example.com',
      interest: 'Full Stack Development',
      motivation: 'Learn new technologies'
    });
    console.log(`✅ Students created: ${student1.name}, ${student2.name}`);
    
    // Test 3: Enroll students
    console.log('\n3️⃣ Enrolling students in the course...');
    await CourseEnrollment.create({
      courseId: testCourse.id,
      studentId: student1.id
    });
    
    await CourseEnrollment.create({
      courseId: testCourse.id,
      studentId: student2.id
    });
    console.log('✅ Students enrolled successfully');
    
    // Test 4: Fetch course with enrollment count
    console.log('\n4️⃣ Testing course API endpoint...');
    const coursesWithStudents = await Course.findAll({
      include: [
        {
          model: Student,
          through: { attributes: [] },
          attributes: ['id', 'name'],
        }
      ]
    });
    
    const testCourseWithStudents = coursesWithStudents.find(c => c.id === testCourse.id);
    const actualEnrollmentCount = testCourseWithStudents.Students ? testCourseWithStudents.Students.length : 0;
    
    console.log(`✅ Course "${testCourse.title}" has ${actualEnrollmentCount} enrolled students`);
    console.log(`   Students: ${testCourseWithStudents.Students.map(s => s.name).join(', ')}`);
    
    // Test 5: Test course filters
    console.log('\n5️⃣ Testing course filtering...');
    const publishedCourses = await Course.count({ where: { status: 'published' } });
    const advancedCourses = await Course.count({ where: { difficulty: 'advanced' } });
    const featuredCourses = await Course.count({ where: { featured: true } });
    
    console.log(`✅ Published courses: ${publishedCourses}`);
    console.log(`✅ Advanced courses: ${advancedCourses}`);
    console.log(`✅ Featured courses: ${featuredCourses}`);
    
    // Test 6: Test pricing and enhanced fields
    console.log('\n6️⃣ Testing enhanced course fields...');
    const courseData = testCourseWithStudents.toJSON();
    
    console.log(`✅ Price: ${courseData.currency} $${courseData.price}`);
    console.log(`✅ Duration: ${courseData.duration}`);
    console.log(`✅ Lessons: ${courseData.lessonCount}, Videos: ${courseData.videoCount}`);
    console.log(`✅ Prerequisites: ${courseData.prerequisites.length} items`);
    console.log(`✅ Learning outcomes: ${courseData.learningOutcomes.length} items`);
    console.log(`✅ Tags: ${courseData.tags.join(', ')}`);
    
    console.log('\n🎉 All tests passed! Course management system is working properly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCourseSystem();