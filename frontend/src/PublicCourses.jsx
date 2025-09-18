import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PublicCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEnroll, setShowEnroll] = useState(false);
  const [levelFilter, setLevelFilter] = useState('');

  useEffect(() => {
    axios.get('/api/courses')
      .then(res => setCourses(res.data.filter(c => c.isOwned)))
      .catch(() => setCourses([]));
  }, []);

  // Get unique levels from courses for filter dropdown
  const levels = Array.from(new Set(courses.map(c => c.level).filter(Boolean)));

  // Filter courses by selected level
  const filteredCourses = levelFilter ? courses.filter(c => c.level === levelFilter) : courses;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Available Courses</h1>
      <div className="mb-6 flex justify-end">
        <label className="mr-2 text-slate-300 font-medium">Filter by Level:</label>
        <select
          className="bg-slate-700 text-white rounded px-3 py-1"
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
        >
          <option value="">All</option>
          {levels.map(level => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredCourses.map(course => (
          <div key={course.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col">
            <img src={course.featuredImage ? (course.featuredImage.startsWith('http') ? course.featuredImage : `/api${course.featuredImage}`) : '/no-image.png'} alt="Course" className="h-32 w-full object-cover rounded mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">{course.title}</h2>
            <div className="text-slate-400 mb-2">{course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : ''}</div>
            <div className="text-slate-300 mb-4">{course.description}</div>
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg mt-auto" onClick={() => { setSelectedCourse(course); setShowEnroll(true); }}>Enroll</button>
          </div>
        ))}
      </div>
      {showEnroll && selectedCourse && (
        <EnrollModal course={selectedCourse} onClose={() => setShowEnroll(false)} />
      )}
    </div>
  );
}

import EnrollModal from './EnrollModal';
export default PublicCourses;
