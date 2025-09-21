import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminTags() {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/tags');
      setTags(res.data);
    } catch (err) {
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
      fetchTags();
    } catch {
      setError('Failed to add tag');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tag?')) return;
    try {
      await axios.delete(`/api/tags/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      fetchTags();
    } catch {
      setError('Failed to delete tag');
    }
  };

  return (
  <div className="max-w-6xl mx-auto bg-[#12192b] rounded-xl p-8 border border-slate-800 mt-8 min-h-[400px]">
  <h1 className="text-4xl font-extrabold text-white mb-8">Manage Tags</h1>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTag}
          onChange={e => setNewTag(e.target.value)}
          placeholder="New tag name"
          className="flex-1 p-3 rounded bg-slate-800 text-white"
        />
        <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg">Add</button>
      </form>
      {error && <div className="text-rose-400 mb-4">{error}</div>}
      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : (
        <ul className="divide-y divide-slate-700">
          {tags.map(tag => (
            <li key={tag.id} className="flex justify-between items-center py-3 gap-2">
              {editId === tag.id ? (
                <form
                  className="flex-1 flex gap-2"
                  onSubmit={async e => {
                    e.preventDefault();
                    try {
                      await axios.put(
                        `/api/tags/${tag.id}`,
                        { name: editName },
                        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
                      );
                      setEditId(null);
                      fetchTags();
                    } catch {
                      setError('Failed to update tag');
                    }
                  }}
                >
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="flex-1 p-2 rounded bg-slate-800 text-white border border-slate-700"
                  />
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-4 rounded-lg">Save</button>
                  <button type="button" className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-1 px-4 rounded-lg" onClick={() => setEditId(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <span className="text-white font-semibold">{tag.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditId(tag.id);
                        setEditName(tag.name);
                      }}
                      className="text-cyan-400 hover:text-cyan-600"
                    >Edit</button>
                    <button onClick={() => handleDelete(tag.id)} className="text-red-400 hover:text-red-600">Delete</button>
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
