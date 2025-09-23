const { Course } = require('./models');

async function fixCourseData() {
  try {
    console.log('Checking and fixing course data...');
    
    // Get all courses and check their external field
    const courses = await Course.findAll();
    console.log('Courses with external field:');
    
    for (const course of courses) {
      console.log(`- ${course.title}: external=${course.external}, status=${course.status}`);
      
      // Fix null external values
      if (course.external === null) {
        await course.update({ external: false });
        console.log(`  Fixed external field for ${course.title}`);
      }
    }
    
    // Update some existing courses to published status for testing
    const coursesToPublish = courses.filter(c => !c.external && c.title.includes('Introduction to'));
    for (const course of coursesToPublish.slice(0, 2)) {
      await course.update({ status: 'published' });
      console.log(`  Published: ${course.title}`);
    }
    
    console.log('\nAfter fixes:');
    const updatedCourses = await Course.findAll();
    const publishedOwned = updatedCourses.filter(c => !c.external && c.status === 'published');
    console.log(`Published owned courses: ${publishedOwned.length}`);
    publishedOwned.forEach(c => console.log(`- ${c.title}`));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixCourseData();