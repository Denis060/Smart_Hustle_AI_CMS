import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import PostComments from './PostComments';

export default function PostDetail() {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/posts/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Post not found');
        return res.json();
      })
      .then(data => setPost(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    fetch(`/api/posts/${id}/likes`)
      .then(res => res.json())
      .then(data => setLikeCount(data.count || 0));
  }, [id]);

  const handleLike = async () => {
    setLikeLoading(true); setLikeError(null);
    try {
      const res = await fetch(`/api/posts/${id}/like`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to like');
      const data = await res.json();
      setLikeCount(data.count);
    } catch (err) {
      setLikeError(err.message);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Post link copied to clipboard!');
    } catch {
      alert('Failed to copy link.');
    }
  };

  if (loading) return <div className="text-slate-400 text-lg p-8">Loading post...</div>;
  if (error) return <div className="text-rose-400 text-lg p-8">{error}</div>;
  if (!post) return null;

  return (
    <section className="py-16 min-h-[70vh] flex flex-col items-center justify-center bg-slate-900">
      <div className="max-w-2xl w-full bg-slate-800 rounded-2xl shadow p-8 flex flex-col gap-4 border border-slate-700 mx-auto">
        <Link to="/posts" className="text-cyan-400 hover:underline mb-2">&larr; Back to Posts</Link>
        {post.category?.name && (
          <span className="text-cyan-400 text-sm font-bold mb-2">{post.category.name}</span>
        )}
        <h1 className="text-4xl font-extrabold text-white mb-2">{post.title}</h1>
        <div className="text-slate-400 text-sm mb-2">By <span className="font-semibold text-cyan-300">Ibrahim Denis Fofanah</span>{post.createdAt && <span className="ml-2">{new Date(post.createdAt).toLocaleDateString()}</span>}</div>
        {post.featuredImage && <img src={post.featuredImage} alt="Featured" className="rounded-lg mb-4 max-h-72 object-cover w-full" />}
        <div className="prose prose-invert max-w-none text-lg mb-4" dangerouslySetInnerHTML={{ __html: post.content }} />
        <div className="flex gap-4 mt-4 items-center">
          <button onClick={handleLike} disabled={likeLoading} className="px-4 py-2 rounded bg-cyan-500 text-slate-900 font-bold hover:bg-cyan-400 transition flex items-center gap-2">
            Like <span className="bg-slate-900 px-2 py-1 rounded text-cyan-300 text-xs">{likeCount}</span>
          </button>
          <button
            onClick={() => {
              setShowCommentForm(v => !v);
              setTimeout(() => {
                const el = document.getElementById('comments');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="px-4 py-2 rounded bg-slate-700 text-white font-bold hover:bg-slate-600 transition"
          >
            Comment
          </button>
          <button onClick={handleShare} className="px-4 py-2 rounded bg-indigo-500 text-white font-bold hover:bg-indigo-400 transition">Share</button>
        </div>
        {likeError && <div className="text-rose-400 text-sm mt-1">{likeError}</div>}
        <div id="comments">
          <PostComments postId={id} showForm={showCommentForm} />
        </div>
      </div>
    </section>
  );
}
