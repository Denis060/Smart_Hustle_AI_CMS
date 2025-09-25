import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus, FaTimes, FaEdit, FaTrash, FaSearch, FaSpinner, FaCheck, FaLayerGroup } from 'react-icons/fa';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      await axios.post(
        '/api/categories',
        { name: newCategory, description: newDescription },
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      );
      setNewCategory('');
      setNewDescription('');
      setSuccessMessage('Category created successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      setError('Failed to add category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? This will also remove this category from any posts using it.')) return;
    try {
      await axios.delete(`/api/categories/${id}`, { 
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } 
      });
      setSuccessMessage('Category deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      setError('Failed to delete category');
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
  
  // Filter and sort categories
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const sortedCategories = [...filteredCategories].sort((a, b) => {
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
        <FaLayerGroup className="text-cyan-400" /> Manage Categories
      </h1>
      
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 rounded mb-4 flex justify-between items-center">
          <span className="flex items-center gap-2"><FaCheck /> {successMessage}</span>
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
      
      {/* Add Category Form */}
      <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Add New Category</h2>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="categoryName" className="block text-sm text-slate-400 mb-1">Category Name</label>
            <input
              id="categoryName"
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="w-full p-3 rounded bg-slate-800 text-white border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
              required
            />
          </div>
          <div className="flex-1">
            <label htmlFor="categoryDescription" className="block text-sm text-slate-400 mb-1">Description</label>
            <input
              id="categoryDescription"
              type="text"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="Brief description (optional)"
              className="w-full p-3 rounded bg-slate-800 text-white border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
            />
          </div>
          <div className="self-end">
            <button 
              type="submit" 
              className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2"
            >
              <FaPlus /> Add Category
            </button>
          </div>
        </form>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search categories..."
            className="w-full p-3 pl-10 rounded bg-slate-800 text-white border border-slate-700"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>
      
      {/* Categories Table */}
      {loading ? (
        <div className="text-center py-20">
          <FaSpinner className="animate-spin text-cyan-500 text-3xl mx-auto mb-2" />
          <div className="text-slate-400">Loading categories...</div>
        </div>
      ) : sortedCategories.length === 0 ? (
        <div className="bg-slate-800/30 text-center py-12 rounded-lg border border-slate-700">
          <div className="text-slate-400">
            {searchTerm ? 'No categories match your search.' : 'No categories have been created yet.'}
          </div>
          <div className="text-slate-500 text-sm mt-2">
            {searchTerm ? 'Try a different search term.' : 'Add your first category using the form above.'}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/30 rounded-lg border border-slate-700 overflow-hidden">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-800">
              <tr>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Category Name
                    {sortBy === 'name' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="p-4">Description</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('posts')}>
                  <div className="flex items-center gap-1">
                    Posts
                    {sortBy === 'posts' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {sortedCategories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-700/50">
                  {editId === cat.id ? (
                    <td colSpan={4} className="p-4">
                      <form
                        className="flex flex-col md:flex-row gap-3"
                        onSubmit={async e => {
                          e.preventDefault();
                          try {
                            await axios.put(
                              `/api/categories/${cat.id}`,
                              { name: editName, description: editDescription },
                              { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
                            );
                            setEditId(null);
                            setSuccessMessage('Category updated successfully');
                            setTimeout(() => setSuccessMessage(''), 3000);
                            fetchCategories();
                          } catch (error) {
                            console.error('Error updating category:', error);
                            setError('Failed to update category');
                          }
                        }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm text-slate-400 mb-1">Category Name</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={e => setEditName(e.target.value)}
                              className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-400 mb-1">Description</label>
                            <input
                              type="text"
                              value={editDescription}
                              onChange={e => setEditDescription(e.target.value)}
                              className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <button 
                              type="submit" 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg flex items-center gap-1"
                            >
                              <FaCheck size={14} /> Save
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setEditId(null)} 
                              className="bg-slate-600 hover:bg-slate-700 text-white py-2 px-4 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td className="p-4 font-medium text-white">
                        {cat.name}
                      </td>
                      <td className="p-4 text-slate-400">
                        {cat.description || <span className="text-slate-500 italic">No description</span>}
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-700/60 text-slate-300 py-1 px-2 rounded text-xs">
                          {cat.posts ? cat.posts.length : 0} posts
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditId(cat.id);
                              setEditName(cat.name);
                              setEditDescription(cat.description || '');
                            }}
                            className="text-cyan-400 hover:text-cyan-300 bg-slate-700 hover:bg-slate-600 p-1 rounded"
                            title="Edit Category"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(cat.id)} 
                            className="text-red-400 hover:text-red-300 bg-slate-700 hover:bg-slate-600 p-1 rounded"
                            title="Delete Category"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
