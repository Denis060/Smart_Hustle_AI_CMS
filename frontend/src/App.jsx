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
          const cats = Array.from(new Set((data.posts || []).map(p => p.category?.name).filter(Boolean)));
          setCategories(cats);
        }
      })
      .catch(() => { setPosts([]); setCategories([]); })
      .finally(() => setLoading(false));
  }, [search, category, page]);

  // Get featured posts (latest posts) for recommendations
  const recommended = [...posts].slice(0, 3);

  return (
    <section className="py-16 min-h-[70vh] flex flex-col items-center justify-center w-full bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="text-center mb-12 max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-6 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
          Smart Hustle AI Blog
        </h1>
        <p className="text-xl text-slate-300 text-center mb-8 leading-relaxed">
          Master AI, Data Science & Modern Business with Expert Insights and Practical Guides
        </p>
        <div className="flex justify-center items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Weekly Updates
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
            Expert Authors
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
            </svg>
            {posts.length} Articles
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl px-4">
        {/* Left Sidebar: Categories & Newsletter */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
              </svg>
              Categories
            </h2>
            <div className="space-y-2">
              <button 
                onClick={() => { setCategory(""); setPage(1); }} 
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${!category ? 'bg-cyan-500 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700/50'}`}
              >
                All Posts
              </button>
              {categories.map(cat => (
                <button 
                  key={cat} 
                  onClick={() => { setCategory(cat); setPage(1); }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${category === cat ? 'bg-cyan-500 text-white font-semibold' : 'text-slate-300 hover:bg-slate-700/50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
              </svg>
              Newsletter
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Get the latest AI insights delivered to your inbox
            </p>
            <form className="flex flex-col gap-3">
              <input 
                type="email" 
                placeholder="your@email.com" 
                className="rounded-lg bg-slate-900/50 border border-slate-600 px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent" 
              />
              <button 
                type="submit" 
                className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 font-bold text-white hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105"
              >
                Subscribe Now
              </button>
            </form>
          </div>

          {recommended.length > 0 && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
              <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                </svg>
                Featured Posts
              </h2>
              <div className="space-y-4">
                {recommended.map(post => (
                  <div key={post.id} className="group">
                    <Link to={`/posts/${post.id}`} className="block">
                      <h3 className="text-white font-semibold text-sm group-hover:text-cyan-300 transition-colors mb-1 line-clamp-2">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {post.category?.name && (
                          <span className="bg-slate-700 px-2 py-1 rounded-full text-cyan-300">
                            {post.category.name}
                          </span>
                        )}
                        {post.readingTime && (
                          <span>{post.readingTime} min read</span>
                        )}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
        {/* Center: Main Feed */}
        <main className="w-full lg:w-3/4 flex flex-col gap-8">
          {/* Search and Filters */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full rounded-lg bg-slate-900/50 border border-slate-600 px-4 py-3 pl-10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                />
                <svg className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
                </svg>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm whitespace-nowrap">
                  {posts.length > 0 && `${posts.length} articles found`}
                </span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center gap-3 text-slate-400 text-lg">
                <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Loading articles...
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-slate-400 text-xl mb-4">No articles found</div>
              <p className="text-slate-500">Try adjusting your search or browse all categories</p>
            </div>
          ) : (
            <div className="grid gap-8">
              {posts.map((post, index) => (
                <article 
                  key={post.id} 
                  className={`group cursor-pointer transition-all duration-300 hover:transform hover:scale-[1.02] ${
                    index === 0 ? 'lg:grid lg:grid-cols-2 lg:gap-8' : ''
                  }`}
                  onClick={() => navigate(`/posts/${post.id}`)}
                >
                  <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 shadow-xl hover:shadow-2xl overflow-hidden ${
                    index === 0 ? 'lg:col-span-2 lg:grid lg:grid-cols-2 lg:gap-0' : ''
                  }`}>
                    {/* Featured Image */}
                    {post.featuredImage && (
                      <div className={`relative overflow-hidden ${index === 0 ? 'lg:order-2' : 'h-48'}`}>
                        <img 
                          src={post.featuredImage.startsWith('http') 
                            ? post.featuredImage 
                            : `http://localhost:5000${post.featuredImage}`
                          } 
                          alt={post.title}
                          className={`w-full object-cover transition-transform duration-300 group-hover:scale-110 ${
                            index === 0 ? 'h-full' : 'h-48'
                          }`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className={`p-8 flex flex-col justify-between ${index === 0 ? 'lg:order-1' : ''}`}>
                      {/* Category & Reading Time */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {post.category?.name && (
                            <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                              {post.category.name}
                            </span>
                          )}
                          {post.readingTime && (
                            <span className="text-slate-400 text-sm flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                              </svg>
                              {post.readingTime} min read
                            </span>
                          )}
                        </div>
                        {post.views && (
                          <span className="text-slate-400 text-sm flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                            {post.views} views
                          </span>
                        )}
                      </div>

                      {/* Title & Content */}
                      <div className="flex-1">
                        <h2 className={`font-bold text-white mb-4 group-hover:text-cyan-300 transition-colors line-clamp-2 ${
                          index === 0 ? 'text-3xl' : 'text-xl'
                        }`}>
                          {post.title}
                        </h2>
                        
                        <div className="prose prose-invert prose-sm max-w-none text-slate-300 mb-6 line-clamp-3" 
                             dangerouslySetInnerHTML={{ 
                               __html: post.excerpt || (post.content?.replace(/<[^>]*>/g, '').slice(0, 200) + '...') 
                             }} 
                        />
                      </div>

                      {/* Author & Date */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {post.User?.name ? post.User.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <div className="text-white font-semibold text-sm">
                              {post.User?.name || 'Ibrahim Denis Fofanah'}
                            </div>
                            {post.createdAt && (
                              <div className="text-slate-400 text-xs">
                                {new Date(post.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long', 
                                  day: 'numeric'
                                })}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); }}
                            className="p-2 rounded-full bg-slate-700/50 text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400 transition-colors"
                            title="Like"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                            </svg>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); }}
                            className="p-2 rounded-full bg-slate-700/50 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition-colors"
                            title="Share"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          {/* Enhanced Pagination */}
          <div className="flex items-center justify-center mt-12">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-xl">
              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-2 rounded-lg bg-slate-700/50 text-white disabled:opacity-50 hover:bg-slate-600 transition-colors flex items-center gap-2"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
                  </svg>
                  Previous
                </button>
                
                <div className="flex items-center gap-1 mx-4">
                  {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === page;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                          isActive 
                            ? 'bg-cyan-500 text-white' 
                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="text-slate-400 mx-2">...</span>
                      <button
                        onClick={() => setPage(totalPages)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                          totalPages === page 
                            ? 'bg-cyan-500 text-white' 
                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  className="px-4 py-2 rounded-lg bg-slate-700/50 text-white disabled:opacity-50 hover:bg-slate-600 transition-colors flex items-center gap-2"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"/>
                  </svg>
                </button>
              </div>
              
              <div className="text-center mt-3 text-sm text-slate-400">
                Page {page} of {totalPages} • {posts.length} articles
              </div>
            </div>
          </div>
        </main>
        
        {/* Right Sidebar - Hidden on mobile */}
        <aside className="hidden lg:block w-1/4">
          <div className="sticky top-8 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
              <h2 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                </svg>
                Quick Links
              </h2>
              <div className="space-y-3">
                <Link to="/courses" className="block text-slate-300 hover:text-cyan-300 transition-colors">
                  📚 Browse Courses
                </Link>
                <Link to="/about" className="block text-slate-300 hover:text-cyan-300 transition-colors">
                  ℹ️ About Us
                </Link>
                <Link to="/dashboard" className="block text-slate-300 hover:text-cyan-300 transition-colors">
                  📊 Dashboard
                </Link>
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
              <h2 className="text-xl font-bold text-cyan-400 mb-4">Share Blog</h2>
              <div className="flex gap-3">
                <button className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                  Twitter
                </button>
                <button className="flex-1 py-2 px-3 rounded-lg bg-blue-800 hover:bg-blue-900 text-white text-sm font-semibold transition-colors">
                  LinkedIn
                </button>
              </div>
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
        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-2 mb-6">
          <span className="text-2xl">⭐</span>
          <span className="text-cyan-300 text-sm font-medium">Personally Curated by Denis</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
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
                <div key={course.id} className="bg-slate-800 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:transform hover:scale-105 group overflow-hidden">
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-gradient-to-r from-cyan-400 to-purple-400 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {providerDisplay}
                      </span>
                      {course.featured && (
                        <div className="flex items-center gap-1 text-cyan-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-xs font-semibold">Featured</span>
                        </div>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors">
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
                      <span className={`font-bold ${course.price > 0 ? 'text-cyan-400' : 'text-green-400'}`}>
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
                              <span className="text-cyan-400 mt-1">•</span>
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
                      className="block w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold py-3 px-4 rounded-lg text-center transition-all duration-300 transform hover:scale-105"
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
