import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Find student by email
      const studentResponse = await axios.get(`/api/enrollments/students/email/${email}`);
      if (studentResponse.data) {
        setStudent(studentResponse.data);
        
        // Get enrolled courses
        const coursesResponse = await axios.get(`/api/enrollments/student/${studentResponse.data.id}`);
        setEnrolledCourses(coursesResponse.data);
        setIsAuthenticated(true);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No student found with this email address. Please enroll in a course first.');
      } else {
        setError('Failed to load student data. Please try again.');
      }
    }
    setLoading(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6">
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Student Dashboard</h1>
          <p className="text-slate-300 mb-6 text-center">
            Enter your email to access your enrolled courses
          </p>
          
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 focus:border-cyan-500 focus:outline-none" 
                required 
                placeholder="your@email.com"
              />
            </div>
            
            {error && (
              <div className="bg-red-600/20 border border-red-600 rounded-lg p-3">
                <div className="text-red-400 text-sm">{error}</div>
              </div>
            )}
            
            <button 
              type="submit" 
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg" 
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Access Dashboard'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <a href="/" className="text-cyan-400 hover:text-cyan-300 text-sm">
              ← Back to Courses
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {student.name}!</h1>
          <p className="text-slate-300">Your learning journey continues</p>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg"
        >
          Switch Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Enrolled Courses</h3>
              <p className="text-3xl font-bold text-cyan-400">{enrolledCourses.length}</p>
            </div>
            <div className="w-12 h-12 bg-cyan-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Completed</h3>
              <p className="text-3xl font-bold text-green-400">0</p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Learning Hours</h3>
              <p className="text-3xl font-bold text-purple-400">0</p>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">My Courses</h2>
        
        {enrolledCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No courses yet</h3>
            <p className="text-slate-300 mb-4">Start your learning journey by enrolling in a course</p>
            <a 
              href="/" 
              className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              Browse Courses
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map(course => (
              <div key={course.id} className="bg-slate-700 rounded-xl p-6 border border-slate-600 hover:border-slate-500 transition-colors">
                <div className="relative mb-4">
                  <img 
                    src={course.featuredImage ? (course.featuredImage.startsWith('http') ? course.featuredImage : `http://localhost:5000${course.featuredImage}`) : '/no-image.png'} 
                    alt={course.title} 
                    className="h-32 w-full object-cover rounded" 
                  />
                  <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                    Enrolled
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2">{course.title}</h3>
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-slate-600 text-slate-300 text-xs px-2 py-1 rounded">
                    {(course.difficulty || course.level || 'Beginner').charAt(0).toUpperCase() + (course.difficulty || course.level || 'Beginner').slice(1)}
                  </span>
                  {course.duration && (
                    <span className="text-slate-400 text-xs">{course.duration}</span>
                  )}
                </div>
                
                <div className="w-full bg-slate-600 rounded-full h-2 mb-4">
                  <div className="bg-cyan-600 h-2 rounded-full" style={{width: '0%'}}></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">0% Complete</span>
                  <button className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-bold py-2 px-4 rounded">
                    Continue
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}