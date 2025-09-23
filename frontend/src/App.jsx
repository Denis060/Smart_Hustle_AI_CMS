import './index.css';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import PublicCourses from './PublicCourses';
import Homepage from './Homepage';
import StudentDashboard from './StudentDashboard';
function AdminRoute() {
  const [authed, setAuthed] = useState(!!localStorage.getItem('adminToken'));
  const navigate = useNavigate();
  const handleLogin = () => {
    setAuthed(true);
    navigate('/admin');
  };
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setAuthed(false);
    navigate('/admin');
  };
  if (!authed) return <AdminLogin onLogin={handleLogin} />;
  return <AdminDashboard onLogout={handleLogout} />;
}
import { useState, useEffect } from 'react';


import { Link } from 'react-router-dom';
import { lazy, Suspense } from 'react';
const PostDetail = lazy(() => import('./components/PostDetail.jsx'));
function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      category,
      page,
    });
    fetch(`/api/posts?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch posts');
        return res.json();
      })
      .then(data => {
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
        if (data.categories) {
          setCategories(data.categories);
        } else {
          const cats = Array.from(new Set((data.posts || []).map(p => p.category).filter(Boolean)));
          setCategories(cats);
        }
      })
      .catch(() => { setPosts([]); setCategories([]); })
      .finally(() => setLoading(false));
  }, [search, category, page]);

  // Simulate recommended articles (top 3 by createdAt)
  const recommended = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);

  return (
    <section className="py-16 min-h-[70vh] flex flex-col items-center justify-center w-full">
      <h1 className="text-5xl font-extrabold text-center mb-4">The AI Hustle Posts</h1>
      <p className="text-lg text-slate-300 text-center mb-8 max-w-2xl">Insights on Machine Learning, AI, and Data Science Projects.</p>
      <div className="flex flex-col md:flex-row gap-8 w-full max-w-7xl">
        {/* Left: Recommended */}
        <aside className="w-full md:w-1/4 flex flex-col gap-4">
          <div className="bg-slate-800 rounded-xl p-4 mb-4">
            <h2 className="text-lg font-bold text-cyan-400 mb-2">Recommended</h2>
            {recommended.length === 0 ? <div className="text-slate-400">No recommendations yet.</div> : recommended.map(post => (
              <div key={post.id} className="mb-3">
                <Link to={`/posts/${post.id}`} className="text-cyan-300 hover:underline font-semibold">{post.title}</Link>
                <div className="text-xs text-slate-400">{post.category?.name || 'Post'}</div>
              </div>
            ))}
          </div>
        </aside>
        {/* Center: Main Feed */}
        <main className="w-full md:w-2/4 flex flex-col gap-6">
          <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full md:w-72 rounded bg-slate-800 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <select
              className="rounded bg-slate-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={category}
              onChange={e => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {loading ? (
            <div className="text-slate-400 text-lg">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-slate-400 text-lg">No posts found.</div>
          ) : (
            <div className="flex flex-col gap-8">
              {posts.map(post => (
                <div key={post.id} className="bg-slate-800 rounded-2xl shadow p-0 flex flex-col border border-slate-700 transition-transform duration-200 hover:scale-[1.01] hover:shadow-2xl cursor-pointer overflow-hidden" onClick={() => navigate(`/posts/${post.id}`)}>
                  {post.featuredImage && (
                    <img src={post.featuredImage} alt="Post" className="w-full h-48 object-cover" />
                  )}
                  <div className="p-6 flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-white mb-1">{post.title}</h2>
                    <p className="text-slate-400 text-sm mb-1 flex gap-2 items-center">
                      <span>By <span className="font-semibold text-cyan-300">Ibrahim Denis Fofanah</span></span>
                      {post.createdAt && <span className="ml-2">{new Date(post.createdAt).toLocaleDateString()}</span>}
                      {post.category?.name && <span className="ml-2 px-2 py-1 bg-slate-700 rounded text-xs text-cyan-300">{post.category.name}</span>}
                    </p>
                    <div className="prose prose-invert max-w-none text-slate-300 mb-2 line-clamp-4" dangerouslySetInnerHTML={{ __html: post.excerpt || (post.content?.slice(0, 300) + '...') }} />
                    <div className="flex gap-4 mt-2">
                      <button className="px-3 py-1 rounded bg-cyan-500 text-slate-900 font-bold hover:bg-cyan-400 transition text-sm">Like</button>
                      <button className="px-3 py-1 rounded bg-slate-700 text-white font-bold hover:bg-slate-600 transition text-sm">Comment</button>
                      <button className="px-3 py-1 rounded bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition text-sm">Share</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Pagination controls */}
          <div className="mt-10 flex gap-2">
            <button
              className="px-4 py-2 rounded bg-slate-800 text-white disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >Prev</button>
            <span className="px-3 py-2 text-slate-400">Page {page} of {totalPages}</span>
            <button
              className="px-4 py-2 rounded bg-slate-800 text-white disabled:opacity-50"
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >Next</button>
          </div>
        </main>
        {/* Right: Sidebar */}
        <aside className="w-full md:w-1/4 flex flex-col gap-4">
          <div className="bg-slate-800 rounded-xl p-4 mb-4">
            <h2 className="text-lg font-bold text-cyan-400 mb-2">Subscribe</h2>
            <form className="flex flex-col gap-2">
              <input type="email" placeholder="Your email" className="rounded bg-slate-900 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
              <button type="submit" className="rounded bg-cyan-500 px-4 py-2 font-bold text-slate-900 hover:bg-cyan-400 transition">Subscribe</button>
            </form>
          </div>
          <div className="bg-slate-800 rounded-xl p-4">
            <h2 className="text-lg font-bold text-cyan-400 mb-2">Share</h2>
            <div className="flex gap-2">
              <button className="rounded bg-indigo-500 px-3 py-2 text-white font-bold hover:bg-indigo-400 transition">Share</button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
function MyCourses() {

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [levelFilter, setLevelFilter] = useState("");

  // Fetch courses from backend API
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      page,
      level: levelFilter,
    });
    fetch(`/api/courses?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch courses');
        return res.json();
      })
      .then(data => {
        setCourses(data.courses || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [search, page, levelFilter]);

  // Filtered courses (if backend doesn't filter by search/level, keep this)
  // const filtered = courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));
  const filtered = courses;

  return (
    <section className="py-16 min-h-[70vh] flex flex-col items-center justify-center">
      <h1 className="text-5xl font-extrabold text-center mb-4">My Courses</h1>
      <p className="text-lg text-slate-300 text-center mb-8 max-w-2xl">Courses I've personally created to help you master data analysis.</p>
      <div className="mb-8 flex flex-col md:flex-row gap-4 w-full max-w-3xl items-center justify-between">
        <input
          type="text"
          placeholder="Search courses..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-72 rounded bg-slate-800 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        {/* Example filter dropdown (future: categories, levels, etc) */}
        <select
          className="rounded bg-slate-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
        >
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>
      {loading ? (
        <div className="text-slate-400 text-lg">Loading courses...</div>
      ) : filtered.length === 0 ? (
        <div className="text-slate-400 text-lg">No courses found.</div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center flex-wrap">
          {filtered.map(course => (
            <div key={course.id} className="flex-1 bg-slate-800 rounded-2xl shadow p-8 flex flex-col gap-6 min-w-[320px] max-w-md border border-slate-700 transition-transform duration-200 hover:scale-[1.025] hover:shadow-2xl cursor-pointer">
              <span className="self-start bg-cyan-400 text-slate-900 text-xs font-bold px-4 py-1 rounded-full mb-2">{course.badge || 'COURSE'}</span>
              <h2 className="text-2xl font-bold text-white mb-1">{course.title}</h2>
              <p className="text-slate-300 mb-4">{course.description}</p>
              <div className="flex items-center gap-2 text-slate-400 border-t border-slate-700 pt-4 text-sm">
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Level: {course.level}
              </div>
              <a href={course.url || '#'} className="mt-4 w-full inline-block rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-lg font-bold py-3 text-center transition">View & Register</a>
            </div>
          ))}
        </div>
      )}
      {/* Pagination controls (future: wire up real logic) */}
      <div className="mt-10 flex gap-2">
        <button
          className="px-4 py-2 rounded bg-slate-800 text-white disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >Prev</button>
        <span className="px-3 py-2 text-slate-400">Page {page} of {totalPages}</span>
        <button
          className="px-4 py-2 rounded bg-slate-800 text-white disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        >Next</button>
      </div>
    </section>
  );
}


function Recommended() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchCourses = async () => {
      try {
        if (!isMounted) return;
        
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/courses');
        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!isMounted) return;
        
        const externalCourses = Array.isArray(data) ? data.filter(course => course && course.external === true) : [];
        setCourses(externalCourses);
        
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching courses:', err);
        setError(err.message);
        setCourses([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-400 text-lg">Loading recommended courses...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Courses</h3>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-4 py-2 mb-6">
          <span className="text-2xl">⭐</span>
          <span className="text-yellow-300 text-sm font-medium">Personally Curated by Denis</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Recommended Courses
          </span>
        </h1>
        
        <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          These are the exact courses that transformed my understanding of AI and helped me build a successful career. 
          Each one is battle-tested and delivers real value.
        </p>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No recommendations yet</h3>
            <p className="text-slate-400">Check back soon for hand-picked courses!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => {
              if (!course) return null;
              
              const provider = course.provider?.trim() || '';
              const providerDisplay = provider ? provider.charAt(0).toUpperCase() + provider.slice(1) : 'Platform';
              const level = course.level ? course.level.charAt(0).toUpperCase() + course.level.slice(1) : 'Intermediate';
              const difficulty = course.difficulty ? course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1) : level;
              
              return (
                <div key={course.id} className="bg-slate-800 rounded-2xl border border-slate-700 hover:border-yellow-500/50 transition-all duration-300 hover:transform hover:scale-105 group overflow-hidden">
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                        {providerDisplay}
                      </span>
                      {course.featured && (
                        <div className="flex items-center gap-1 text-yellow-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs font-semibold">Featured</span>
                        </div>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                      {course.title}
                    </h2>
                    
                    <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
                      {course.description}
                    </p>
                  </div>

                  {/* Course Details */}
                  <div className="px-6 pb-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center bg-slate-700 rounded-lg py-2">
                        <div className="text-slate-400 text-xs">Level</div>
                        <div className="text-white font-semibold text-sm">{difficulty}</div>
                      </div>
                      <div className="text-center bg-slate-700 rounded-lg py-2">
                        <div className="text-slate-400 text-xs">Duration</div>
                        <div className="text-white font-semibold text-sm">{course.duration || 'Self-paced'}</div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-400 text-sm">Price:</span>
                      <span className={`font-bold ${course.price > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {course.price > 0 ? `$${course.price}` : 'FREE'}
                      </span>
                    </div>

                    {/* Prerequisites */}
                    {course.prerequisites && Array.isArray(course.prerequisites) && course.prerequisites.length > 0 && (
                      <div className="mb-4">
                        <div className="text-slate-400 text-xs mb-2">Prerequisites:</div>
                        <div className="text-slate-300 text-xs">
                          {course.prerequisites.slice(0, 2).map((prereq, index) => (
                            <div key={index} className="flex items-start gap-1">
                              <span className="text-yellow-400 mt-1">•</span>
                              <span>{prereq}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="p-6 pt-0">
                    <a 
                      href={course.affiliateLink || course.url || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-3 px-4 rounded-lg text-center transition-all duration-300 transform hover:scale-105"
                    >
                      Enroll on {providerDisplay}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {courses.length > 0 && (
        <div className="max-w-4xl mx-auto mt-16 text-center">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Want My Personal Learning Path?</h3>
            <p className="text-slate-300 mb-6">
              Get my step-by-step guide on which courses to take and in what order for maximum impact.
            </p>
            <button 
              onClick={() => {
                const newsletter = document.getElementById('newsletter');
                if (newsletter) {
                  newsletter.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#newsletter';
                }
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300"
            >
              Get the Learning Path (Free)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function About() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/api/pages/about')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch About page');
        return res.json();
      })
      .then(data => setContent(data.content || ''))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 min-h-[70vh] flex flex-col items-center justify-center">
      <h1 className="text-5xl font-extrabold text-center mb-4">About Smart Hustle AI</h1>
      {loading ? (
        <div className="text-slate-400 text-lg">Loading...</div>
      ) : error ? (
        <div className="text-rose-400 text-lg">{error}</div>
      ) : (
        <div className="prose prose-invert max-w-2xl text-slate-300 text-lg text-center" dangerouslySetInnerHTML={{ __html: content }} />
      )}
    </section>
  );
}

function Header() {
  const LinkCls = ({ isActive }) =>
    [
      'px-4 py-1 rounded transition font-medium',
      isActive ? 'bg-slate-700 text-white shadow text-base' : 'text-slate-200 hover:text-cyan-400',
    ].join(' ');
  return (
    <header className="sticky top-0 z-10 w-full border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <NavLink to="/" className="text-2xl font-bold tracking-tight text-cyan-400" aria-label="Home">
          Smart Hustle with AI
        </NavLink>
        <nav className="flex gap-2" aria-label="Main navigation">
          <NavLink to="/" end className={LinkCls}>Home</NavLink>
          <NavLink to="/courses" className={LinkCls}>Courses</NavLink>
          <NavLink to="/recommended" className={LinkCls}>Recommended</NavLink>
          <NavLink to="/dashboard" className={LinkCls}>Dashboard</NavLink>
          <NavLink to="/posts" className={LinkCls}>Blog</NavLink>
          <NavLink to="/about" className={LinkCls}>About</NavLink>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="w-full border-t border-slate-800 bg-slate-950 px-6 py-8 text-center text-slate-400">
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4 justify-center mb-2">
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-cyan-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M22.46 5.92c-.8.36-1.67.6-2.58.71a4.48 4.48 0 0 0 1.97-2.48 8.93 8.93 0 0 1-2.83 1.08A4.48 4.48 0 0 0 12 9.5c0 .35.04.7.1 1.03-3.72-.19-7.02-1.97-9.23-4.67a4.48 4.48 0 0 0-.6 2.26c0 1.56.8 2.94 2.02 3.75a4.48 4.48 0 0 1-2.03-.56v.06c0 2.18 1.55 4 3.6 4.42-.38.1-.78.16-1.2.16-.29 0-.57-.03-.84-.08.57 1.77 2.23 3.06 4.2 3.1A8.98 8.98 0 0 1 2 19.54a12.7 12.7 0 0 0 6.88 2.02c8.26 0 12.78-6.84 12.78-12.78 0-.19 0-.37-.01-.56.88-.64 1.65-1.44 2.26-2.35z"/></svg>
          </a>
          <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-cyan-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 11.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z"/></svg>
          </a>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-cyan-400 transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48 0-.24-.01-.87-.01-1.7-2.78.6-3.37-1.34-3.37-1.34-.45-1.15-1.1-1.46-1.1-1.46-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.8c.85.004 1.71.12 2.51.35 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.33-.01 2.4-.01 2.73 0 .27.16.58.67.48A10.01 10.01 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg>
          </a>
        </div>
        <div>
          &copy; {new Date().getFullYear()} Smart Hustle with AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}






export default function App() {
  const LinkCls = ({ isActive }) =>
    `hover:text-cyan-400 ${isActive ? 'text-cyan-300' : 'text-slate-200'}`;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/admin/*"
          element={<AdminRoute />}
        />
        <Route
          path="*"
          element={
            <div className="min-h-screen w-full bg-slate-900 text-white font-sans flex flex-col">
              <Header />
              {/* Main */}
              <main className="w-full flex-1 flex justify-center">
                <div className="w-full max-w-6xl px-4">
                  <Routes>
                    <Route
                      path="/"
                      element={<Homepage />}
                    />
              <Route path="/posts" element={<Posts />} />
              <Route path="/posts/:id" element={<Suspense fallback={<div className='text-slate-400 p-8'>Loading post...</div>}><PostDetail /></Suspense>} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/recommended" element={<Recommended />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin/*" element={<AdminRoute />} />
              <Route path="/courses" element={<PublicCourses />} />
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="*" element={<div className="p-8 text-center text-rose-400 text-xl">404 – Page Not Found</div>} />
                  </Routes>
                </div>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
