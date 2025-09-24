const { Course, User } = require('./models');

async function addTestCourse() {
  try {
    console.log('Adding test course...');
    
    const testCourse = await Course.create({
      title: 'Test Course with Image',
      description: 'This is a test course to verify image functionality',
      featuredImage: '/uploads/test-image.jpg',
      external: false,
      status: 'published',
      difficulty: 'beginner',
      price: 99.99,
      currency: 'USD',
      featured: true,
      prerequisites: ['Basic knowledge'],
      learningOutcomes: ['Learn testing', 'Debug issues'],
      tags: ['test', 'debugging']
    });
    
    console.log('✅ Test course created:', testCourse.title);
    
    // Add another course without image
    const testCourse2 = await Course.create({
      title: 'Course Without Image',
      description: 'This course has no featured image',
      external: true,
      affiliateLink: 'https://example.com/course',
      status: 'published',
      difficulty: 'intermediate',
      provider: 'External Provider'
    });
    
    console.log('✅ Second test course created:', testCourse2.title);
    
  } catch (error) {
    console.error('Error creating test courses:', error);
  }
}

addTestCourse();