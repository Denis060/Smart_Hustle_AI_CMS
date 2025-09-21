import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/comments', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      setComments(res.data);
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axios.delete(`/api/comments/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      fetchComments();
    } catch {
      setError('Failed to delete comment');
    }
  };

  return (
  <div className="max-w-6xl mx-auto bg-[#12192b] rounded-xl p-8 border border-slate-800 mt-8 min-h-[400px]">
  <h1 className="text-4xl font-extrabold text-white mb-8">Manage Comments</h1>
      {error && <div className="text-rose-400 mb-4">{error}</div>}
      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : comments.length === 0 ? (
        <div className="text-slate-400">No comments found.</div>
      ) : (
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-slate-700">
            <tr>
              <th className="p-3">Post</th>
              <th className="p-3">User</th>
              <th className="p-3">Comment</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {comments.map(c => (
              <tr key={c.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="p-3">{c.Post ? c.Post.title : c.postId}</td>
                <td className="p-3">{c.User ? (c.User.name || c.User.username || c.User.email) : c.userId}</td>
                <td className="p-3 max-w-xs break-words">{c.content}</td>
                <td className="p-3">{c.createdAt ? c.createdAt.slice(0, 10) : ''}</td>
                <td className="p-3 text-right">
                  <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
