import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data);
    } catch (err) {
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
      fetchCategories();
    } catch {
      setError('Failed to add category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await axios.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch {
      setError('Failed to delete category');
    }
  };

  return (
  <div className="max-w-6xl mx-auto bg-[#12192b] rounded-xl p-8 border border-slate-800 mt-8 min-h-[400px]">
  <h1 className="text-4xl font-extrabold text-white mb-8">Manage Categories</h1>
      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-2 mb-6">
        <input
          type="text"
          value={newCategory}
          onChange={e => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="flex-1 p-3 rounded bg-slate-800 text-white"
        />
        <input
          type="text"
          value={newDescription}
          onChange={e => setNewDescription(e.target.value)}
          placeholder="Description (optional)"
          className="flex-1 p-3 rounded bg-slate-800 text-white"
        />
        <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg">Add</button>
      </form>
      {error && <div className="text-rose-400 mb-4">{error}</div>}
      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : (
        <ul className="divide-y divide-slate-700">
          {categories.map(cat => (
            <li key={cat.id} className="flex flex-col md:flex-row justify-between items-start md:items-center py-3 gap-2">
              {editId === cat.id ? (
                <form
                  className="flex-1 flex flex-col md:flex-row gap-2"
                  onSubmit={async e => {
                    e.preventDefault();
                    try {
                      await axios.put(
                        `/api/categories/${cat.id}`,
                        { name: editName, description: editDescription },
                        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
                      );
                      setEditId(null);
                      fetchCategories();
                    } catch {
                      setError('Failed to update category');
                    }
                  }}
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 p-2 rounded bg-slate-800 text-white border border-slate-700"
                  />
                  <input
                    type="text"
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    className="flex-1 p-2 rounded bg-slate-800 text-white border border-slate-700"
                  />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-4 rounded-lg">Save</button>
                  <button type="button" className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-1 px-4 rounded-lg" onClick={() => setEditId(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <div>
                    <span className="text-white font-semibold">{cat.name}</span>
                    {cat.description && <div className="text-slate-400 text-sm mt-1">{cat.description}</div>}
                  </div>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <button
                      onClick={() => {
                        setEditId(cat.id);
                        setEditName(cat.name);
                        setEditDescription(cat.description || '');
                        setEditTagIds((cat.tags || []).map(t => t.id));
                      }}
                      className="text-cyan-400 hover:text-cyan-600"
                    >Edit</button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-400 hover:text-red-600">Delete</button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
