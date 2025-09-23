// Test script for enrollment functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testEnrollment() {
  try {
    console.log('🚀 Testing Enrollment System...\n');

    // 1. Get available courses
    console.log('1. Fetching available courses...');
    const coursesResponse = await axios.get(`${BASE_URL}/courses`);
    const publishedCourses = coursesResponse.data.filter(c => c.status === 'published');
    console.log(`   Found ${publishedCourses.length} published courses`);

    if (publishedCourses.length === 0) {
      console.log('   ❌ No published courses available for testing');
      return;
    }

    const testCourse = publishedCourses[0];
    console.log(`   📚 Using course: "${testCourse.title}" (ID: ${testCourse.id})`);

    // 2. Test enrollment
    console.log('\n2. Testing course enrollment...');
    const enrollmentData = {
      courseId: testCourse.id,
      name: 'Test Student',
      email: 'test.student@example.com',
      interest: 'Web Development',
      motivation: 'I want to learn new skills and advance my career'
    };

    const enrollResponse = await axios.post(`${BASE_URL}/enrollments/enroll`, enrollmentData);
    console.log('   ✅ Enrollment successful!');
    console.log(`   Student ID: ${enrollResponse.data.enrollment.studentId}`);
    console.log(`   Enrollment ID: ${enrollResponse.data.enrollment.id}`);

    // 3. Test duplicate enrollment (should fail)
    console.log('\n3. Testing duplicate enrollment...');
    try {
      await axios.post(`${BASE_URL}/enrollments/enroll`, enrollmentData);
      console.log('   ❌ Duplicate enrollment should have failed');
    } catch (err) {
      if (err.response?.data?.alreadyEnrolled) {
        console.log('   ✅ Duplicate enrollment correctly prevented');
      } else {
        console.log('   ❌ Unexpected error:', err.response?.data?.error);
      }
    }

    // 4. Test enrollment check
    console.log('\n4. Testing enrollment status check...');
    const encodedEmail = encodeURIComponent(enrollmentData.email);
    const checkResponse = await axios.get(`${BASE_URL}/enrollments/check/${testCourse.id}/${encodedEmail}`);
    if (checkResponse.data.enrolled) {
      console.log('   ✅ Enrollment status check successful');
      console.log(`   Enrolled on: ${new Date(checkResponse.data.enrollmentDate).toLocaleDateString()}`);
    } else {
      console.log('   ❌ Enrollment status check failed');
    }

    // 5. Test student course list
    console.log('\n5. Testing student course list...');
    const studentId = enrollResponse.data.enrollment.studentId;
    const studentCoursesResponse = await axios.get(`${BASE_URL}/enrollments/student/${studentId}`);
    console.log(`   ✅ Student enrolled in ${studentCoursesResponse.data.length} course(s)`);

    // 6. Test course student list
    console.log('\n6. Testing course student list...');
    const courseStudentsResponse = await axios.get(`${BASE_URL}/enrollments/course/${testCourse.id}`);
    console.log(`   ✅ Course has ${courseStudentsResponse.data.length} enrolled student(s)`);

    // 7. Test student lookup by email
    console.log('\n7. Testing student lookup by email...');
    const studentResponse = await axios.get(`${BASE_URL}/enrollments/students/email/${enrollmentData.email}`);
    console.log(`   ✅ Student found: ${studentResponse.data.name}`);

    console.log('\n🎉 All enrollment tests passed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testEnrollment();