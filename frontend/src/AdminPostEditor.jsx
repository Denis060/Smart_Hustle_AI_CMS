import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminPostEditor({ post, onSave, isEdit }) {
  const [formData, setFormData] = useState(post || {
    title: '',
    content: '',
    featuredImage: '',
    categoryId: '',
    tagIds: [],
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/categories').then(res => setCategories(res.data)).catch(() => setCategories([]));
    axios.get('/api/tags').then(res => setTags(res.data)).catch(() => setTags([]));
    if (post) setFormData(post);
  }, [post]);

  const handleChange = (e) => {
    const { name, value, type, options, multiple } = e.target;
    if (multiple) {
      const selected = Array.from(options).filter(o => o.selected).map(o => parseInt(o.value));
      setFormData(prev => ({ ...prev, tagIds: selected }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
      navigate('/admin');
    } catch (err) {
      alert('Failed to save post: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <button onClick={() => navigate('/admin')} className="text-cyan-400 hover:underline mb-6">&larr; Back to Posts</button>
      <h1 className="text-3xl font-bold text-white mb-8">{isEdit ? 'Edit Post' : 'Create New Post'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-400 mb-1">Post Title</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-3 rounded bg-slate-800 text-white" required />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-slate-400 mb-1">Category</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full p-3 rounded bg-slate-800 text-white">
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-slate-400 mb-1">Tags</label>
            <select name="tagIds" multiple value={formData.tagIds} onChange={handleChange} className="w-full p-3 rounded bg-slate-800 text-white h-16">
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Featured Image URL</label>
          <input type="text" name="featuredImage" value={formData.featuredImage} onChange={handleChange} className="w-full p-3 rounded bg-slate-800 text-white" />
        </div>
        <div>
          <label className="block text-slate-400 mb-1">Body Content (Markdown/Rich Text Supported)</label>
          <textarea name="content" value={formData.content} onChange={handleChange} className="w-full p-3 rounded bg-slate-800 text-white min-h-[200px]" placeholder="Write your post content here..." />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Post'}</button>
        </div>
      </form>
    </div>
  );
}
