import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PostComments from './PostComments';

export default function PostDetail() {
  const [showCommentForm, setShowCommentForm] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeError, setLikeError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    // Fetch post details
    setLoading(true);
    fetch(`/api/posts/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Post not found');
        return res.json();
      })
      .then(data => {
        setPost(data);
        // Fetch related posts from same category
        if (data.categoryId) {
          fetch(`/api/posts?category=${data.category?.name || ''}&limit=3`)
            .then(res => res.json())
            .then(relatedData => {
              const filtered = (relatedData.posts || []).filter(p => p.id !== parseInt(id));
              setRelatedPosts(filtered.slice(0, 3));
            })
            .catch(() => setRelatedPosts([]));
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
    
    // Fetch likes count
    fetch(`/api/posts/${id}/likes`)
      .then(res => res.json())
      .then(data => setLikeCount(data.count || 0))
      .catch(() => setLikeCount(0));
  }, [id]);

  const handleLike = async () => {
    setLikeLoading(true); 
    setLikeError(null);
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

  const handleShare = async (platform) => {
    const url = window.location.href;
    const title = post?.title || 'Check out this post';
    
    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(url);
        setShareMessage('Link copied to clipboard!');
        setTimeout(() => setShareMessage(''), 3000);
      } catch {
        setShareMessage('Failed to copy link');
        setTimeout(() => setShareMessage(''), 3000);
      }
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 text-slate-400 text-lg">
            <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            Loading article...
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-rose-400 text-xl mb-4">Article not found</div>
          <Link to="/posts" className="text-cyan-400 hover:text-cyan-300 underline">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }
  
  if (!post) return null;

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Hero Section */}
      <div className="relative">
        {post.featuredImage && (
          <div className="relative h-96 overflow-hidden">
            <img 
              src={post.featuredImage.startsWith('http') 
                ? post.featuredImage 
                : `http://localhost:5000${post.featuredImage}`
              } 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            <div className="absolute inset-0 flex items-end">
              <div className="max-w-4xl mx-auto px-6 pb-12 w-full">
                <Link to="/posts" className="text-cyan-400 hover:text-cyan-300 mb-4 inline-flex items-center gap-2 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
                  </svg>
                  Back to Blog
                </Link>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {post.category?.name && (
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {post.category.name}
                    </span>
                  )}
                  {post.readingTime && (
                    <span className="text-slate-300 text-sm flex items-center gap-1 bg-slate-800/50 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                      </svg>
                      {post.readingTime} min read
                    </span>
                  )}
                  {post.views && (
                    <span className="text-slate-300 text-sm flex items-center gap-1 bg-slate-800/50 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                      {post.views} views
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Title Overlay for Featured Images or Regular Header */}
        <div className={`${post.featuredImage ? 'absolute inset-x-0 bottom-0' : 'py-16'}`}>
          <div className="max-w-4xl mx-auto px-6">
            {!post.featuredImage && (
              <>
                <Link to="/posts" className="text-cyan-400 hover:text-cyan-300 mb-6 inline-flex items-center gap-2 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"/>
                  </svg>
                  Back to Blog
                </Link>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {post.category?.name && (
                    <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wide">
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
              </>
            )}
            
            <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            {/* Author Info */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {post.User?.name ? post.User.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <div className="text-white font-semibold text-lg">
                  {post.User?.name || 'Ibrahim Denis Fofanah'}
                </div>
                {post.createdAt && (
                  <div className="text-slate-300 text-sm">
                    Published on {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <article className="flex-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-xl">
              <div 
                className="prose prose-lg prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-slate-200 prose-p:leading-relaxed prose-a:text-cyan-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-code:text-cyan-300 prose-code:bg-slate-900 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 prose-blockquote:border-l-cyan-500 prose-blockquote:bg-slate-900/50 prose-blockquote:text-slate-300" 
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            </div>

            {/* Article Actions */}
            <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleLike} 
                    disabled={likeLoading} 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                    </svg>
                    {likeLoading ? 'Liking...' : `Like (${likeCount})`}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowCommentForm(v => !v);
                      setTimeout(() => {
                        const el = document.getElementById('comments');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"/>
                    </svg>
                    Comment
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-sm mr-2">Share:</span>
                  <button 
                    onClick={() => handleShare('twitter')}
                    className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                    title="Share on Twitter"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleShare('linkedin')}
                    className="p-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                    title="Share on LinkedIn"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 100 4 2 2 0 000-4z"/>
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleShare('copy')}
                    className="p-2 rounded-lg bg-slate-600 text-white hover:bg-slate-500 transition-colors"
                    title="Copy link"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Share Message */}
              {shareMessage && (
                <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                  {shareMessage}
                </div>
              )}
              
              {likeError && (
                <div className="mt-4 p-3 bg-rose-500/20 border border-rose-500/50 rounded-lg text-rose-400 text-sm">
                  {likeError}
                </div>
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-80">
            <div className="sticky top-8 space-y-6">
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                  <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                    </svg>
                    Related Articles
                  </h3>
                  <div className="space-y-4">
                    {relatedPosts.map(relatedPost => (
                      <Link 
                        key={relatedPost.id} 
                        to={`/posts/${relatedPost.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          {relatedPost.featuredImage && (
                            <img 
                              src={relatedPost.featuredImage.startsWith('http') 
                                ? relatedPost.featuredImage 
                                : `http://localhost:5000${relatedPost.featuredImage}`
                              }
                              alt={relatedPost.title}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="text-white font-semibold text-sm group-hover:text-cyan-300 transition-colors line-clamp-2 mb-1">
                              {relatedPost.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              {relatedPost.category?.name && (
                                <span className="bg-slate-700 px-2 py-1 rounded text-cyan-300">
                                  {relatedPost.category.name}
                                </span>
                              )}
                              {relatedPost.readingTime && (
                                <span>{relatedPost.readingTime} min</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Links */}
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <Link to="/posts" className="block text-slate-300 hover:text-cyan-300 transition-colors">
                    📚 All Articles
                  </Link>
                  <Link to="/courses" className="block text-slate-300 hover:text-cyan-300 transition-colors">
                    🎓 Browse Courses
                  </Link>
                  <Link to="/about" className="block text-slate-300 hover:text-cyan-300 transition-colors">
                    ℹ️ About Us
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Comments Section */}
        <div className="mt-12" id="comments">
          <PostComments postId={id} showForm={showCommentForm} />
        </div>
      </div>
    </div>
  );
}
