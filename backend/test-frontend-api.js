const axios = require('axios');

async function testFrontendAPI() {
  try {
    console.log('Testing API from frontend perspective...');
    
    const response = await axios.get('http://localhost:5000/api/courses');
    const courses = response.data;
    
    console.log(`Total courses from API: ${courses.length}`);
    
    const publishedOwned = courses.filter(c => c.isOwned && c.status === 'published');
    console.log(`Published owned courses: ${publishedOwned.length}`);
    
    publishedOwned.forEach(course => {
      console.log(`- ${course.title} (status: ${course.status}, isOwned: ${course.isOwned})`);
    });
    
    if (publishedOwned.length === 0) {
      console.log('\nWhy no published courses?');
      courses.forEach(course => {
        console.log(`  ${course.title}: isOwned=${course.isOwned}, status=${course.status}, external=${course.external}`);
      });
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testFrontendAPI();