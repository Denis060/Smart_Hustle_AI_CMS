
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

function PostsSection() {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    axios.get('/api/posts')
      .then(res => setPosts(res.data.rows ? res.data.rows : res.data))
      .catch(() => setPosts([]));
  }, []);
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Posts</h1>
        <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg" onClick={() => navigate('/admin/posts/new')}>Add New Post</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Author</th>
              <th className="p-4">Published</th>
              <th className="p-4">Image</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="p-4">{post.title}</td>
                <td className="p-4">{post.User ? post.User.name || post.User.username : post.authorId || '—'}</td>
                <td className="p-4">{post.publishedAt || post.createdAt?.slice(0, 10) || ''}</td>
                <td className="p-4">{post.featuredImage && <img src={post.featuredImage} alt="Post" className="h-10 w-16 object-cover rounded" />}</td>
                <td className="p-4"><span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${post.published ? 'text-emerald-600 bg-emerald-200' : 'text-slate-500 bg-slate-700'}`}>{post.published ? 'Published' : 'Draft'}</span></td>
                <td className="p-4 text-right flex gap-2 justify-end">
                  <button className="text-slate-400 hover:text-white" onClick={() => navigate(`/admin/posts/edit/${post.id}`)}>Edit</button>
                  <button className="text-red-400 hover:text-red-600" onClick={() => alert('Delete not implemented')}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }) {
  const [view, setView] = useState('posts');
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin/posts')) {
      setView('posts');
    }
  }, [location.pathname]);

  return (
    <div className="bg-slate-900 text-slate-300 min-h-screen flex">
      <AdminSidebar active={view} onNavigate={setView} onLogout={onLogout} />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Routes>
          <Route path="/" element={<PostsSection />} />
          {/* Add more routes/components as needed */}
        </Routes>
      </main>
    </div>
  );
}

export default AdminDashboard;

