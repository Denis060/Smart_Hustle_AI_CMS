import './index.css';
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import PublicCourses from './PublicCourses';
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
import { useState, useCallback, useEffect } from 'react';


function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      category,
      page,
    });
    fetch(`/api/posts?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch blog posts');
        return res.json();
      })
      .then(data => {
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
        // Collect unique categories for filter dropdown
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

  return (
    <section className="py-16 min-h-[70vh] flex flex-col items-center justify-center">
      <h1 className="text-5xl font-extrabold text-center mb-4">The AI Hustle Blog</h1>
      <p className="text-lg text-slate-300 text-center mb-8 max-w-2xl">Insights on Machine Learning, AI, and Data Science Projects.</p>
      <div className="mb-8 flex flex-col md:flex-row gap-4 w-full max-w-3xl items-center justify-between">
        <input
          type="text"
          placeholder="Search blog posts..."
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
        <div className="text-slate-400 text-lg">Loading blog posts...</div>
      ) : posts.length === 0 ? (
        <div className="text-slate-400 text-lg">No blog posts found.</div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl justify-center flex-wrap">
          {posts.map(post => (
            <div key={post.id} className="flex-1 bg-slate-800 rounded-2xl shadow p-8 flex flex-col gap-4 min-w-[320px] max-w-md border border-slate-700 transition-transform duration-200 hover:scale-[1.025] hover:shadow-2xl cursor-pointer">
              <span className="text-cyan-400 text-sm font-bold mb-2">{post.category || 'Blog'}</span>
              <h2 className="text-2xl font-bold text-white mb-1">{post.title}</h2>
              <p className="text-slate-300 mb-2">{post.excerpt || post.body?.slice(0, 160) + '...'}</p>
              <a href={post.url || '#'} className="text-cyan-400 font-semibold hover:underline text-base mt-2" target="_blank" rel="noopener noreferrer">Read More &rarr;</a>
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

  useEffect(() => {
    setLoading(true);
    fetch('/api/courses?recommended=true')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch recommended');
        return res.json();
      })
      .then(data => setCourses(data.courses || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 min-h-[70vh] flex flex-col items-center justify-center">
      <h1 className="text-5xl font-extrabold text-center mb-4">Recommended Learning</h1>
      <p className="text-lg text-slate-300 text-center mb-12 max-w-2xl">A curated list of the best courses to accelerate your data science journey.</p>
      {loading ? (
        <div className="text-slate-400 text-lg">Loading recommended courses...</div>
      ) : courses.length === 0 ? (
        <div className="text-slate-400 text-lg">No recommended courses found.</div>
      ) : (
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-6xl justify-center flex-wrap">
          {courses.map(course => (
            <div key={course.id} className="flex-1 bg-slate-800 rounded-2xl shadow p-8 flex flex-col gap-6 min-w-[320px] max-w-md border border-slate-700 transition-transform duration-200 hover:scale-[1.025] hover:shadow-2xl cursor-pointer">
              <span className="self-start bg-indigo-200 text-indigo-700 text-xs font-bold px-4 py-1 rounded-full mb-2">{course.badge || course.platform || 'RECOMMENDED'}</span>
              <h2 className="text-2xl font-bold text-white mb-1">{course.title}</h2>
              <p className="text-slate-300 mb-4">{course.description}</p>
              <div className="flex items-center gap-2 text-slate-400 border-t border-slate-700 pt-4 text-sm">
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Level: {course.level}
              </div>
              <a href={course.url || '#'} target="_blank" rel="noopener noreferrer" className="mt-4 w-full inline-block rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold py-3 text-center transition">
                {course.platform ? `Enroll on ${course.platform}` : 'Enroll'}
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
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
          <NavLink to="/blog" className={LinkCls}>Blog</NavLink>
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
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleSubscribe = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true); setMsg(null);
    try {
      // OPTION A: use Vite env base (recommended)
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/api/subscribers`, {
      // OPTION B: use a Vite dev proxy (`/api`), if configured in vite.config.js
      const res = await fetch(`/api/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Subscribe failed');
      setMsg({ type: 'ok', text: 'Subscribed! Check your inbox.' });
      setEmail('');
    } catch (err) {
      setMsg({ type: 'err', text: err.message });
    } finally {
      setSubmitting(false);
    }
  }, [email]);

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
                      element={
                        <section className="py-16">
                          <div className="text-center">
                      <h1 className="mb-4 text-4xl font-extrabold text-cyan-400 md:text-6xl">
                        Empower Your Hustle with AI
                      </h1>
                      <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300 md:text-2xl">
                        Learn, grow, and stay ahead with curated AI content, tutorials, and courses for modern entrepreneurs and creators.
                      </p>
                      <a href="#newsletter" className="inline-block rounded bg-cyan-500 px-8 py-3 text-lg font-bold text-slate-900 shadow hover:bg-cyan-400 transition">
                        Join the Newsletter
                      </a>
                    </div>

                    {/* Featured sections (as you had) */}
                    <section className="py-16">
                      <h2 className="text-4xl font-bold text-center mb-2">Featured Blog of the Week</h2>
                      <p className="text-lg text-slate-400 text-center mb-8">Fresh insights from the blog.</p>
                      <div className="max-w-2xl mx-auto bg-slate-800 rounded-2xl shadow p-8 flex flex-col gap-4 transform transition duration-200 hover:scale-[1.025] hover:shadow-2xl focus-within:scale-[1.025] focus-within:shadow-2xl cursor-pointer">
                        <span className="text-cyan-300 text-sm font-bold mb-2">AI & Automation</span>
                        <h3 className="text-2xl font-bold text-white mb-1">How to Automate Reports with Python & AI</h3>
                        <p className="text-slate-300 mb-2">This practical guide provides the full Python script to automate your reporting process, saving you hours every week. Perfect for business analysts and data scientists.</p>
                        <a href="#" className="text-cyan-400 font-semibold hover:underline text-base mt-2">Read More &rarr;</a>
                      </div>
                    </section>
                    <section className="py-16">
                      <h2 className="text-4xl font-bold text-center mb-2">Course Highlight</h2>
                      <p className="text-lg text-slate-400 text-center mb-8">My top recommendation for aspiring AI developers.</p>
                      <div className="max-w-2xl mx-auto bg-slate-800 rounded-2xl shadow p-8 flex flex-col gap-6 transform transition duration-200 hover:scale-[1.025] hover:shadow-2xl focus-within:scale-[1.025] focus-within:shadow-2xl cursor-pointer">
                        <div className="flex flex-col gap-2">
                          <span className="self-start bg-indigo-500/20 text-indigo-300 text-xs font-bold px-4 py-1 rounded-full mb-2">COURSERA</span>
                          <h3 className="text-2xl font-bold text-white mb-1">Deep Learning Specialization</h3>
                          <p className="text-slate-300 mb-2">This is the foundational course that took me from understanding basic ML to truly grasping deep learning. Andrew Ng is an unparalleled teacher.</p>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 border-t border-slate-700 pt-4 text-sm">
                          <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          Level: Intermediate
                        </div>
                        <a href="https://www.coursera.org/specializations/deep-learning" target="_blank" rel="noopener noreferrer" className="mt-4 w-full inline-block rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold py-3 text-center transition">Enroll on Coursera</a>
                      </div>
                    </section>

                    {/* Newsletter */}
                    <section id="newsletter" className="mt-16 rounded-lg border border-slate-800 bg-slate-950 p-8 text-center">
                      <h2 className="mb-2 text-2xl font-bold text-cyan-400">Stay in the Loop</h2>
                      <p className="mb-6 text-slate-300">
                        Get the latest AI tips, tutorials, and course updates straight to your inbox.
                      </p>
                      <form onSubmit={handleSubscribe} className="mx-auto flex w-full max-w-md flex-col gap-4 md:flex-row">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Your email"
                          className="flex-1 rounded bg-slate-800 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        />
                        <button
                          type="submit"
                          disabled={submitting}
                          className="rounded bg-cyan-500 px-6 py-2 font-bold text-slate-900 hover:bg-cyan-400 disabled:opacity-60"
                          aria-label="Subscribe to newsletter"
                        >
                          {submitting ? 'Subscribing…' : 'Subscribe'}
                        </button>
                      </form>
                      {msg && (
                        <p className={`mt-3 text-sm ${msg.type === 'ok' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {msg.text}
                        </p>
                      )}
                    </section>
                  </section>
                }
              />
              <Route path="/blog" element={<Blog />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/recommended" element={<Recommended />} />
              <Route path="/about" element={<About />} />
              <Route path="/admin/*" element={<AdminRoute />} />
              <Route path="/courses" element={<PublicCourses />} />
              <Route path="*" element={<div className="p-8 text-center text-rose-400 text-xl">404 – Page Not Found</div>} />
                    <Route path="blog" element={<Blog />} />
                    <Route path="my-courses" element={<MyCourses />} />
                    <Route path="recommended" element={<Recommended />} />
                    <Route path="about" element={<About />} />
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
