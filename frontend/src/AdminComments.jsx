import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaFilter, FaSearch, FaTrash, FaEye, FaTimes, FaSpinner } from 'react-icons/fa';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComments, setSelectedComments] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage] = useState(10);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/comments', { 
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } 
      });
      setComments(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      setError('Failed to load comments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment? This action cannot be undone.')) return;
    
    try {
      await axios.delete(`/api/comments/${id}`, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } 
      });
      setComments(comments.filter(c => c.id !== id));
      setSelectedComments(selectedComments.filter(cId => cId !== id));
      setSuccessMessage('Comment deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete comment');
      console.error(err);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/comments/${id}/approve`, {}, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } 
      });
      setComments(comments.map(c => c.id === id ? {...c, approved: true} : c));
      setSuccessMessage('Comment approved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to approve comment');
      console.error(err);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedComments.length === 0) return;
    
    if (action === 'delete') {
      if (!window.confirm(`Delete ${selectedComments.length} selected comments? This action cannot be undone.`)) return;
      
      try {
        await Promise.all(selectedComments.map(id => 
          axios.delete(`/api/comments/${id}`, { 
            headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } 
          })
        ));
        setComments(comments.filter(c => !selectedComments.includes(c.id)));
        setSelectedComments([]);
        setShowBulkActions(false);
        setSuccessMessage(`${selectedComments.length} comments deleted successfully`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError('Failed to delete some comments');
        console.error(err);
      }
    } else if (action === 'approve') {
      try {
        await Promise.all(selectedComments.map(id => 
          axios.put(`/api/comments/${id}/approve`, {}, { 
            headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } 
          })
        ));
        setComments(comments.map(c => selectedComments.includes(c.id) ? {...c, approved: true} : c));
        setSelectedComments([]);
        setShowBulkActions(false);
        setSuccessMessage(`${selectedComments.length} comments approved successfully`);
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError('Failed to approve some comments');
        console.error(err);
      }
    }
  };

  const toggleCommentSelection = (id) => {
    setSelectedComments(prev => 
      prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedComments.length === currentComments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(currentComments.map(c => c.id));
    }
  };

  const viewCommentDetails = (comment) => {
    setSelectedComment(comment);
    setShowDetails(true);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Sort comments based on current sort field and direction
  const sortedComments = [...comments].sort((a, b) => {
    if (sortField === 'createdAt') {
      return sortDirection === 'asc' 
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    }
    
    if (sortField === 'post') {
      const postA = a.Post?.title || '';
      const postB = b.Post?.title || '';
      return sortDirection === 'asc'
        ? postA.localeCompare(postB)
        : postB.localeCompare(postA);
    }
    
    if (sortField === 'user') {
      const userA = a.User ? (a.User.name || a.User.username || a.User.email) : a.name || '';
      const userB = b.User ? (b.User.name || b.User.username || b.User.email) : b.name || '';
      return sortDirection === 'asc'
        ? userA.localeCompare(userB)
        : userB.localeCompare(userA);
    }

    if (sortField === 'approved') {
      return sortDirection === 'asc'
        ? (a.approved ? 1 : 0) - (b.approved ? 1 : 0)
        : (b.approved ? 1 : 0) - (a.approved ? 1 : 0);
    }

    return 0;
  });

  // Filter and search comments
  const filteredComments = sortedComments.filter(comment => {
    const matchesSearch = searchTerm === '' ? true : 
      comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comment.Post?.title && comment.Post.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (comment.User?.name && comment.User.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (comment.User?.email && comment.User.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (comment.name && comment.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'approved' && comment.approved) ||
      (filter === 'pending' && !comment.approved) ||
      (filter === 'recent' && new Date(comment.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesFilter;
  });

  // Calculate pagination
  const indexOfLastComment = currentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  const currentComments = filteredComments.slice(indexOfFirstComment, indexOfLastComment);
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  // Calculate stats
  const stats = {
    total: comments.length,
    approved: comments.filter(c => c.approved).length,
    pending: comments.filter(c => !c.approved).length,
    recent: comments.filter(c => new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length
  };

  useEffect(() => {
    setShowBulkActions(selectedComments.length > 0);
  }, [selectedComments]);

  // Reset to first page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);

  return (
    <div className="max-w-6xl mx-auto bg-[#12192b] rounded-xl p-8 border border-slate-800 mt-8 min-h-[400px]">
      <h1 className="text-4xl font-extrabold text-white mb-6">Manage Comments</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm">Total Comments</h3>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm">Approved</h3>
          <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm">Pending</h3>
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-slate-800/60 p-4 rounded-lg border border-slate-700">
          <h3 className="text-slate-400 text-sm">Last 7 Days</h3>
          <p className="text-2xl font-bold text-blue-400">{stats.recent}</p>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-green-500 hover:text-green-300">
            <FaTimes />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-rose-900/30 border border-rose-700 text-rose-400 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-300">
            <FaTimes />
          </button>
        </div>
      )}
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('approved')} 
            className={`px-3 py-1 rounded-full text-sm ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            Approved
          </button>
          <button 
            onClick={() => setFilter('pending')} 
            className={`px-3 py-1 rounded-full text-sm ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('recent')} 
            className={`px-3 py-1 rounded-full text-sm ${filter === 'recent' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}
          >
            Recent (7 Days)
          </button>
        </div>
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-800 text-white border border-slate-700 rounded-lg pl-10 pr-4 py-2 w-full md:w-64"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {showBulkActions && (
        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-lg mb-4 flex items-center justify-between">
          <div className="text-slate-300">
            <span>{selectedComments.length} comments selected</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleBulkAction('approve')}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center gap-1"
            >
              <FaCheck size={12} /> Approve All
            </button>
            <button 
              onClick={() => handleBulkAction('delete')}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1"
            >
              <FaTrash size={12} /> Delete All
            </button>
            <button 
              onClick={() => setSelectedComments([])}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Comments Table */}
      {loading ? (
        <div className="text-center py-10">
          <FaSpinner className="animate-spin text-blue-500 text-3xl mx-auto mb-2" />
          <div className="text-slate-400">Loading comments...</div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10 text-slate-400 bg-slate-800/30 border border-slate-700 rounded-lg">
          No comments found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-300">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800">
                <tr>
                  <th className="p-3">
                    <input 
                      type="checkbox" 
                      checked={selectedComments.length > 0 && selectedComments.length === currentComments.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 bg-slate-700 border-slate-600 rounded"
                    />
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => handleSort('post')}>
                    <div className="flex items-center">
                      Post
                      {sortField === 'post' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => handleSort('user')}>
                    <div className="flex items-center">
                      User
                      {sortField === 'user' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="p-3">Comment</th>
                  <th className="p-3 cursor-pointer" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center">
                      Date
                      {sortField === 'createdAt' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="p-3 cursor-pointer" onClick={() => handleSort('approved')}>
                    <div className="flex items-center">
                      Status
                      {sortField === 'approved' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentComments.map(c => (
                  <tr key={c.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                    <td className="p-3">
                      <input 
                        type="checkbox" 
                        checked={selectedComments.includes(c.id)}
                        onChange={() => toggleCommentSelection(c.id)}
                        className="w-4 h-4 bg-slate-700 border-slate-600 rounded"
                      />
                    </td>
                    <td className="p-3">
                      {c.Post ? (
                        <div className="font-medium">{c.Post.title || '(Untitled Post)'}</div>
                      ) : (
                        <div className="text-slate-500">Post ID: {c.postId}</div>
                      )}
                    </td>
                    <td className="p-3">
                      {c.User ? (
                        <div>
                          {c.User.name || c.User.username || c.User.email}
                        </div>
                      ) : c.name ? (
                        <div>{c.name}</div>
                      ) : (
                        <div className="text-slate-500">Guest</div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="max-w-xs break-words line-clamp-2">
                        {c.content}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {c.createdAt ? formatDate(c.createdAt) : ''}
                    </td>
                    <td className="p-3">
                      {c.approved ? (
                        <span className="bg-green-900/30 text-green-400 text-xs py-1 px-2 rounded">Approved</span>
                      ) : (
                        <span className="bg-yellow-900/30 text-yellow-400 text-xs py-1 px-2 rounded">Pending</span>
                      )}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => viewCommentDetails(c)} 
                          className="text-slate-400 hover:text-white bg-slate-700 hover:bg-slate-600 p-1 rounded"
                          title="View Details"
                        >
                          <FaEye size={14} />
                        </button>
                        {!c.approved && (
                          <button 
                            onClick={() => handleApprove(c.id)} 
                            className="text-green-400 hover:text-green-300 bg-green-900/30 hover:bg-green-800/50 p-1 rounded"
                            title="Approve Comment"
                          >
                            <FaCheck size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(c.id)} 
                          className="text-red-400 hover:text-red-300 bg-red-900/30 hover:bg-red-800/50 p-1 rounded"
                          title="Delete Comment"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-slate-400">
                Showing {indexOfFirstComment + 1} to {Math.min(indexOfLastComment, filteredComments.length)} of {filteredComments.length} comments
              </div>
              <div className="flex">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-l-md ${currentPage === 1 ? 'bg-slate-800 text-slate-600' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  Previous
                </button>
                <div className="flex">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    // Logic to show pages around the current page
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-r-md ${currentPage === totalPages ? 'bg-slate-800 text-slate-600' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Comment Details Modal */}
      {showDetails && selectedComment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800">
              <h3 className="text-xl font-bold text-white">Comment Details</h3>
              <button 
                onClick={() => setShowDetails(false)} 
                className="text-slate-400 hover:text-white"
              >
                <FaTimes size={18} />
              </button>
            </div>
            <div className="p-6">
              {/* Post Information */}
              <div className="mb-6 pb-4 border-b border-slate-700">
                <h4 className="text-slate-400 text-sm mb-2">Post</h4>
                <p className="text-lg font-medium text-white">
                  {selectedComment.Post ? selectedComment.Post.title : `Post ID: ${selectedComment.postId}`}
                </p>
              </div>
              
              {/* User Information */}
              <div className="mb-6 pb-4 border-b border-slate-700">
                <h4 className="text-slate-400 text-sm mb-2">User</h4>
                <div className="flex flex-col">
                  <p className="text-lg font-medium text-white">
                    {selectedComment.User ? (
                      selectedComment.User.name || selectedComment.User.username || 'User'
                    ) : selectedComment.name || 'Guest'}
                  </p>
                  {selectedComment.User?.email && (
                    <p className="text-slate-400">{selectedComment.User.email}</p>
                  )}
                </div>
              </div>
              
              {/* Comment Content */}
              <div className="mb-6 pb-4 border-b border-slate-700">
                <h4 className="text-slate-400 text-sm mb-2">Comment Content</h4>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-white whitespace-pre-line">{selectedComment.content}</p>
                </div>
              </div>
              
              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-slate-400 text-sm mb-2">Created At</h4>
                  <p className="text-white">
                    {selectedComment.createdAt ? formatDate(selectedComment.createdAt) : 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="text-slate-400 text-sm mb-2">Status</h4>
                  <p>
                    {selectedComment.approved ? (
                      <span className="bg-green-900/30 text-green-400 py-1 px-2 rounded">Approved</span>
                    ) : (
                      <span className="bg-yellow-900/30 text-yellow-400 py-1 px-2 rounded">Pending Approval</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="p-4 border-t border-slate-700 flex justify-end gap-3 sticky bottom-0 bg-slate-800">
              {!selectedComment.approved && (
                <button
                  onClick={() => {
                    handleApprove(selectedComment.id);
                    setSelectedComment({...selectedComment, approved: true});
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaCheck size={14} /> Approve
                </button>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Delete this comment? This action cannot be undone.')) {
                    handleDelete(selectedComment.id);
                    setShowDetails(false);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaTrash size={14} /> Delete
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
