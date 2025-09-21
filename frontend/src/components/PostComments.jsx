import React, { useEffect, useState } from 'react';

export default function PostComments({ postId, showForm }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts/${postId}/comments`)
      .then(res => res.json())
      .then(data => setComments(data.comments || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [postId, success]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!name || !content) {
      setError('Name and comment are required.');
      return;
    }
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, content })
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to add comment');
      setSuccess('Comment added!');
      setName(''); setContent('');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-cyan-400 mb-4">Comments</h3>
      {loading ? <div className="text-slate-400">Loading comments...</div> : (
        comments.length === 0 ? <div className="text-slate-400">No comments yet.</div> : (
          <ul className="mb-6">
            {comments.map(c => (
              <li key={c.id} className="mb-4 border-b border-slate-700 pb-2">
                <div className="font-semibold text-cyan-300">{c.name}</div>
                <div className="text-slate-300">{c.content}</div>
                <div className="text-xs text-slate-500 mt-1">{new Date(c.createdAt).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-slate-900 p-4 rounded-lg">
          <input type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} className="rounded bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
          <textarea placeholder="Add a comment..." value={content} onChange={e => setContent(e.target.value)} className="rounded bg-slate-800 px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" rows={3} />
          <button type="submit" className="rounded bg-cyan-500 px-4 py-2 font-bold text-slate-900 hover:bg-cyan-400 transition">Post Comment</button>
          {error && <div className="text-rose-400 text-sm mt-1">{error}</div>}
          {success && <div className="text-emerald-400 text-sm mt-1">{success}</div>}
        </form>
      )}
    </div>
  );
}
