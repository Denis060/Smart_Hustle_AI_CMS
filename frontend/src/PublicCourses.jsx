import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PublicCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEnroll, setShowEnroll] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [levelFilter, setLevelFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    axios.get('/api/courses')
      .then(res => {
        // Show only published owned courses for public
        const publishedCourses = res.data.filter(c => c.isOwned && c.status === 'published');
        setCourses(publishedCourses);
      })
      .catch(error => {
        console.error('Error fetching courses:', error);
        setCourses([]);
      });
  }, []);

  // Get unique difficulty levels from courses for filter dropdown
  const difficulties = Array.from(new Set(courses.map(c => c.difficulty || c.level).filter(Boolean)));

  // Filter courses by search and selected difficulty
  const filteredCourses = courses.filter(c => {
    const difficulty = c.difficulty || c.level;
    const matchesLevel = levelFilter ? difficulty === levelFilter : true;
    const matchesSearch = search.trim() ? (
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
    ) : true;
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Available Courses</h1>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <label className="mr-2 text-slate-300 font-medium">Filter by Difficulty:</label>
          <select
            className="bg-slate-700 text-white rounded px-3 py-1"
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
          >
            <option value="">All</option>
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          className="bg-slate-700 text-white rounded px-3 py-1 w-full md:w-64"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredCourses.map(course => (
          <div
            key={course.id}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col hover:shadow-lg transition-shadow"
          >
            <div className="relative mb-4">
              <img 
                src={course.featuredImage ? (course.featuredImage.startsWith('http') ? course.featuredImage : `/api${course.featuredImage}`) : '/no-image.png'} 
                alt="Course" 
                className="h-32 w-full object-cover rounded" 
              />
              {course.featured && (
                <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                  ⭐ Featured
                </span>
              )}
            </div>

            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-white flex-1">{course.title}</h2>
              <div className="ml-2 text-right">
                {course.price > 0 ? (
                  <span className="text-cyan-400 font-bold text-lg">
                    {course.currency || 'USD'} ${course.price}
                  </span>
                ) : (
                  <span className="text-green-400 font-bold">FREE</span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                {(course.difficulty || course.level || 'beginner').charAt(0).toUpperCase() + (course.difficulty || course.level || 'beginner').slice(1)}
              </span>
              {course.duration && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  📅 {course.duration}
                </span>
              )}
              {course.lessonCount > 0 && (
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">
                  📚 {course.lessonCount} lessons
                </span>
              )}
              {course.enrollmentCount > 0 && (
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                  👥 {course.enrollmentCount} students
                </span>
              )}
            </div>

            <div className="text-slate-300 mb-4 line-clamp-2 flex-1">{course.description}</div>

            {course.tags && course.tags.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {course.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="bg-slate-600 text-slate-300 text-xs px-2 py-1 rounded">
                      #{tag}
                    </span>
                  ))}
                  {course.tags.length > 3 && (
                    <span className="text-slate-400 text-xs">+{course.tags.length - 3} more</span>
                  )}
                </div>
              </div>
            )}

            <button
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg mt-auto"
              onClick={() => { setSelectedCourse(course); setShowDetail(true); }}
            >
              Learn More
            </button>
          </div>
        ))}
      </div>
      {showDetail && selectedCourse && (
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setShowDetail(false)}
          onEnroll={() => { setShowDetail(false); setShowEnroll(true); }}
        />
      )}
      {showEnroll && selectedCourse && (
        <EnrollModal course={selectedCourse} onClose={() => setShowEnroll(false)} />
      )}
    </div>
  );
}

import EnrollModal from './EnrollModal';

function CourseDetailModal({ course, onClose, onEnroll }) {
  if (!course) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-slate-800 rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button className="absolute top-4 right-4 text-slate-400 hover:text-white text-2xl" onClick={onClose}>&times;</button>
        
        <div className="relative mb-6">
          <img 
            src={course.featuredImage ? (course.featuredImage.startsWith('http') ? course.featuredImage : `/api${course.featuredImage}`) : '/no-image.png'} 
            alt="Course" 
            className="h-48 w-full object-cover rounded" 
          />
          {course.featured && (
            <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
              ⭐ Featured
            </span>
          )}
        </div>

        <div className="flex justify-between items-start mb-4">
          <h2 className="text-3xl font-bold text-white flex-1">{course.title}</h2>
          <div className="ml-4 text-right">
            {course.price > 0 ? (
              <span className="text-cyan-400 font-bold text-2xl">
                {course.currency || 'USD'} ${course.price}
              </span>
            ) : (
              <span className="text-green-400 font-bold text-xl">FREE</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-700 p-3 rounded text-center">
            <div className="text-slate-400 text-sm">Difficulty</div>
            <div className="text-white font-semibold">{(course.difficulty || course.level || 'Beginner').charAt(0).toUpperCase() + (course.difficulty || course.level || 'Beginner').slice(1)}</div>
          </div>
          {course.duration && (
            <div className="bg-slate-700 p-3 rounded text-center">
              <div className="text-slate-400 text-sm">Duration</div>
              <div className="text-white font-semibold">{course.duration}</div>
            </div>
          )}
          {course.lessonCount > 0 && (
            <div className="bg-slate-700 p-3 rounded text-center">
              <div className="text-slate-400 text-sm">Lessons</div>
              <div className="text-white font-semibold">{course.lessonCount}</div>
            </div>
          )}
          {course.enrollmentCount > 0 && (
            <div className="bg-slate-700 p-3 rounded text-center">
              <div className="text-slate-400 text-sm">Students</div>
              <div className="text-white font-semibold">{course.enrollmentCount}</div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold text-white mb-2">About This Course</h3>
          <div className="text-slate-300">{course.description}</div>
        </div>

        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-2">Prerequisites</h3>
            <ul className="text-slate-300 space-y-1">
              {course.prerequisites.map((prereq, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-cyan-400 mr-2">•</span>
                  {prereq}
                </li>
              ))}
            </ul>
          </div>
        )}

        {course.learningOutcomes && course.learningOutcomes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-2">What You'll Learn</h3>
            <ul className="text-slate-300 space-y-1">
              {course.learningOutcomes.map((outcome, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        )}

        {course.tags && course.tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-2">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag, index) => (
                <span key={index} className="bg-slate-600 text-slate-300 text-sm px-3 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <button 
          className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg w-full text-lg" 
          onClick={() => onEnroll(course)}
        >
          {course.price > 0 ? `Enroll Now - ${course.currency || 'USD'} $${course.price}` : 'Enroll for Free'}
        </button>
      </div>
    </div>
  );
}
export default PublicCourses;
