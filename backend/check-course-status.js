const { Course } = require('./models');

async function checkCourseStatuses() {
  try {
    const courses = await Course.findAll();
    console.log('All courses:');
    courses.forEach(c => {
      console.log(`- ${c.title}: status=${c.status}, external=${c.external}, isOwned=${!c.external}`);
    });
    
    console.log('\nPublished owned courses:');
    const publishedOwned = courses.filter(c => !c.external && c.status === 'published');
    console.log(`Found ${publishedOwned.length} published owned courses`);
    publishedOwned.forEach(c => console.log(`- ${c.title}`));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCourseStatuses();