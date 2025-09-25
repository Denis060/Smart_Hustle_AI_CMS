import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaSearch, FaSpinner, FaCheck, FaTags } from 'react-icons/fa';

export default function AdminTags() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/tags');
      setTags(res.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    try {
      await axios.post(
        '/api/tags',
        { name: newTag },
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      );
      setNewTag('');
      setSuccessMessage('Tag created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchTags();
    } catch (error) {
      console.error('Error adding tag:', error);
      setError('Failed to add tag');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tag? This will also remove this tag from any posts using it.')) return;
    try {
      await axios.delete(`/api/tags/${id}`, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } 
      });
      setSuccessMessage('Tag deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      setError('Failed to delete tag');
    }
  };
  
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  // Filter and sort tags
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedTags = [...filteredTags].sort((a, b) => {
    const directionModifier = sortDirection === 'asc' ? 1 : -1;
    
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name) * directionModifier;
    } else if (sortBy === 'posts') {
      const postsA = a.posts ? a.posts.length : 0;
      const postsB = b.posts ? b.posts.length : 0;
      return (postsA - postsB) * directionModifier;
    }
    
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto bg-[#12192b] rounded-xl p-8 border border-slate-800 mt-8 min-h-[400px]">
      <h1 className="text-4xl font-extrabold text-white mb-6 flex items-center gap-3">
        <FaTags className="text-emerald-400" /> Manage Tags
      </h1>
      
      {/* Success Message */}
      {successMessage && (
        <div className="bg-emerald-900/30 border border-emerald-700 text-emerald-400 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span className="flex items-center gap-2"><FaCheck /> {successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-300">
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
      
      {/* Add Tag Form */}
      <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700 mb-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 p-1 rounded">
            <FaPlus size={14} />
          </span>
          Add New Tag
        </h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="tagName" className="block text-sm text-slate-400 mb-1">Tag Name</label>
            <input
              id="tagName"
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              placeholder="Enter tag name"
              className="w-full p-3 rounded bg-slate-800 text-white border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              required
            />
          </div>
          <div className="self-end">
            <button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FaPlus /> Add Tag
            </button>
          </div>
        </form>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search tags..."
            className="w-full p-3 pl-10 rounded bg-slate-800 text-white border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>
      
      {/* Tags Grid */}
      {loading ? (
        <div className="text-center py-20">
          <FaSpinner className="animate-spin text-cyan-500 text-3xl mx-auto mb-2" />
          <div className="text-slate-400">Loading tags...</div>
        </div>
      ) : sortedTags.length === 0 ? (
        <div className="bg-slate-800/30 text-center py-12 rounded-lg border border-slate-700">
          <div className="text-slate-400">
            {searchTerm ? 'No tags match your search.' : 'No tags have been created yet.'}
          </div>
          <div className="text-slate-500 text-sm mt-2">
            {searchTerm ? 'Try a different search term.' : 'Add your first tag using the form above.'}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/30 rounded-lg border border-slate-700 p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
            <h3 className="text-lg text-white flex items-center gap-2">
              <span className="bg-emerald-600 text-white p-1 rounded-md">
                <FaTags size={14} />
              </span>
              All Tags ({sortedTags.length})
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => handleSort('name')}
                className={`px-3 py-1 rounded-md text-xs ${sortBy === 'name' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                Sort by Name {sortBy === 'name' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
              </button>
              <button 
                onClick={() => handleSort('posts')}
                className={`px-3 py-1 rounded-md text-xs ${sortBy === 'posts' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
              >
                Sort by Usage {sortBy === 'posts' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedTags.map(tag => (
              <div 
                key={tag.id} 
                className="group bg-slate-800/70 p-4 rounded-lg border border-slate-700 hover:border-emerald-500/50 transition-all duration-200 relative"
              >
                {editId === tag.id ? (
                  <form
                    className="flex flex-col gap-3 w-full"
                    onSubmit={async e => {
                      e.preventDefault();
                      try {
                        await axios.put(
                          `/api/tags/${tag.id}`,
                          { name: editName },
                          { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
                        );
                        setEditId(null);
                        setSuccessMessage('Tag updated successfully');
                        setTimeout(() => setSuccessMessage(''), 3000);
                        fetchTags();
                      } catch (error) {
                        console.error('Error updating tag:', error);
                        setError('Failed to update tag');
                      }
                    }}
                  >
                    <input
                      type="text"
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full p-3 rounded bg-slate-900 text-white border border-emerald-500 focus:ring-2 focus:ring-emerald-400"
                      required
                      autoFocus
                    />
                    <div className="flex justify-between gap-2">
                      <button 
                        type="submit" 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <FaCheck size={12} /> Save
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setEditId(null)} 
                        className="bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={() => {
                          setEditId(tag.id);
                          setEditName(tag.name);
                        }}
                        className="text-emerald-400 hover:text-white bg-slate-700/80 hover:bg-emerald-600 p-1.5 rounded transition-colors"
                        title="Edit Tag"
                      >
                        <FaEdit size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(tag.id)} 
                        className="text-red-400 hover:text-white bg-slate-700/80 hover:bg-red-600 p-1.5 rounded transition-colors"
                        title="Delete Tag"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center py-2">
                      <div className="bg-emerald-900/30 border border-emerald-800/30 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                        <FaTags className="text-emerald-400" size={18} />
                      </div>
                      <h3 className="text-lg font-medium text-white text-center mb-2">{tag.name}</h3>
                      <span className="bg-emerald-900/30 border border-emerald-800 text-emerald-400 py-1 px-3 rounded-full text-xs">
                        {tag.posts ? tag.posts.length : 0} {tag.posts && tag.posts.length === 1 ? 'post' : 'posts'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
