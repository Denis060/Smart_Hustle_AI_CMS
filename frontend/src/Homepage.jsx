import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Homepage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [stats, setStats] = useState({ students: 0, courses: 0, subscribers: 0 });
  const [featuredCourses, setFeaturedCourses] = useState([]);

  useEffect(() => {
    // Load featured courses and stats
    Promise.all([
      axios.get('/api/courses').then(res => 
        res.data.filter(c => c.status === 'published' && c.featured).slice(0, 3)
      ),
      axios.get('/api/analytics/stats').catch(() => ({ 
        students: 2847, courses: 15, subscribers: 1342 
      }))
    ]).then(([courses, statsData]) => {
      setFeaturedCourses(courses);
      setStats(statsData.data || statsData);
    }).catch(console.error);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    
    try {
      await axios.post('/api/subscribers', { name, email });
      setMsg({ type: 'ok', text: '🎉 Welcome to Smart Hustle AI! Check your inbox for a special welcome gift.' });
      setEmail('');
      setName('');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Something went wrong. Please try again.' });
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-slate-900 to-purple-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent)] bg-[radial-gradient(circle_at_70%_80%,rgba(147,51,234,0.1),transparent)]"></div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            <span className="text-cyan-300 text-sm font-medium">Join {stats.subscribers?.toLocaleString()}+ learners worldwide</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight">
            Master AI.<br />
            <span className="text-white">Transform Your Hustle.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            From zero to AI expert. Get exclusive courses, tutorials, and insider strategies 
            that turn AI knowledge into real income streams.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/courses" 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
            >
              🚀 Explore Courses
            </Link>
            <button 
              onClick={() => document.getElementById('newsletter').scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-slate-600 hover:border-cyan-400 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 hover:bg-slate-800"
            >
              💌 Get Free Resources
            </button>
          </div>
          
          {/* Social Proof Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">{stats.students?.toLocaleString()}+</div>
              <div className="text-slate-400">Students Enrolled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.courses}+</div>
              <div className="text-slate-400">Expert Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">98%</div>
              <div className="text-slate-400">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Featured Courses
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Hand-picked courses designed to turn AI knowledge into profitable skills
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCourses.map(course => (
              <div key={course.id} className="bg-slate-800 rounded-2xl p-6 border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105 group">
                <div className="relative mb-4">
                  <img 
                    src={course.featuredImage ? (course.featuredImage.startsWith('http') ? course.featuredImage : `http://localhost:5000${course.featuredImage}`) : '/no-image.png'} 
                    alt={course.title} 
                    className="h-40 w-full object-cover rounded-lg" 
                  />
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ Featured
                  </div>
                  {course.price > 0 ? (
                    <div className="absolute top-3 right-3 bg-slate-900/90 text-cyan-400 font-bold px-3 py-1 rounded-full">
                      ${course.price}
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 bg-green-600 text-white font-bold px-3 py-1 rounded-full">
                      FREE
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                    {(course.difficulty || 'Beginner').charAt(0).toUpperCase() + (course.difficulty || 'Beginner').slice(1)}
                  </span>
                  <span className="text-slate-400 text-xs">
                    {course.enrollmentCount || 0} students
                  </span>
                </div>
                
                <Link 
                  to="/courses" 
                  className="block w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg text-center transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/courses" 
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
            >
              View All Courses
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Why Smart Hustle AI?
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              We don't just teach AI—we show you how to monetize it
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Practical & Action-Oriented</h3>
              <p className="text-slate-300">
                No fluff. Every lesson is designed to get you results. Build real projects, 
                launch actual products, make genuine income.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Proven Monetization</h3>
              <p className="text-slate-300">
                Learn the exact strategies I've used to generate 6-figures with AI. 
                From freelancing to products to agencies.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Supportive Community</h3>
              <p className="text-slate-300">
                Join thousands of ambitious learners. Get feedback, share wins, 
                and collaborate on projects that matter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup - The Main CTA */}
      <section id="newsletter" className="py-20 px-4 bg-gradient-to-r from-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-3xl p-12">
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Ready to Transform Your Future?
                </span>
              </h2>
              <p className="text-xl text-slate-300 mb-6">
                Join our exclusive newsletter and get instant access to:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Weekly AI profit strategies</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Exclusive course discounts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Free AI tools & templates</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">Early access to new content</span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubscribe} className="max-w-lg mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your first name"
                  className="flex-1 rounded-lg bg-slate-700 border border-slate-600 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 rounded-lg bg-slate-700 border border-slate-600 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
              
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
              >
                {submitting ? 'Joining...' : '🚀 Join the AI Revolution (It\'s Free!)'}
              </button>
            </form>
            
            {msg && (
              <div className={`mt-4 p-4 rounded-lg ${msg.type === 'ok' ? 'bg-green-500/20 border border-green-500/30 text-green-400' : 'bg-red-500/20 border border-red-500/30 text-red-400'}`}>
                {msg.text}
              </div>
            )}
            
            <p className="text-slate-400 text-sm mt-4">
              No spam. Unsubscribe anytime. Join {stats.subscribers?.toLocaleString()}+ learners already ahead of the curve.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Students Say</h2>
            <p className="text-xl text-slate-300">Real results from real people</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div className="ml-3">
                  <div className="font-bold text-white">Sarah Chen</div>
                  <div className="text-slate-400 text-sm">Freelance AI Consultant</div>
                </div>
              </div>
              <p className="text-slate-300 mb-4">
                "I went from complete beginner to earning $5K/month with AI consulting in just 3 months. 
                The practical approach here is unmatched."
              </p>
              <div className="flex text-yellow-400">
                {"★".repeat(5)}
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="ml-3">
                  <div className="font-bold text-white">Marcus Rodriguez</div>
                  <div className="text-slate-400 text-sm">AI Product Creator</div>
                </div>
              </div>
              <p className="text-slate-300 mb-4">
                "Built my first AI SaaS tool following these courses. Now making $2K MRR and growing. 
                This content is pure gold."
              </p>
              <div className="flex text-yellow-400">
                {"★".repeat(5)}
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="ml-3">
                  <div className="font-bold text-white">Aisha Patel</div>
                  <div className="text-slate-400 text-sm">Digital Marketing Agency</div>
                </div>
              </div>
              <p className="text-slate-300 mb-4">
                "Added AI services to my agency and 3x'd my revenue. The strategies taught here 
                work in the real world."
              </p>
              <div className="flex text-yellow-400">
                {"★".repeat(5)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}