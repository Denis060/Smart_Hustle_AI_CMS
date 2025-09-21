import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

import { useRef } from 'react';

function TiptapMenuBar({ editor }) {
  const fileInputRef = useRef();
  if (!editor) return null;
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploader', 'Ibrahim Denis Fofanah');
    try {
      const res = await axios.post('/api/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const url = res.data.url;
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      alert('Image upload failed');
    }
  };
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 p-2 bg-slate-50 rounded-t items-center">
      <button type="button" onClick={() => editor.chain().focus().undo().run()} title="Undo">⎌</button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} title="Redo">↻</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'font-bold text-cyan-700' : ''} title="Bold">B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'italic text-cyan-700' : ''} title="Italic">I</button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'line-through text-cyan-700' : ''} title="Strikethrough">S</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'text-cyan-700 font-bold' : ''} title="H1">H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'text-cyan-700 font-bold' : ''} title="H2">H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'text-cyan-700 font-bold' : ''} title="H3">H3</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'text-cyan-700' : ''} title="Bullet List">• List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'text-cyan-700' : ''} title="Numbered List">1. List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'text-cyan-700' : ''} title="Blockquote">❝</button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={editor.isActive('codeBlock') ? 'text-cyan-700' : ''} title="Code">{'</>'}</button>
      <button type="button" onClick={() => {
        const url = window.prompt('Enter link URL');
        if (url) editor.chain().focus().setLink({ href: url }).run();
      }} className={editor.isActive('link') ? 'underline text-cyan-700' : ''} title="Link">🔗</button>
      <button type="button" onClick={() => fileInputRef.current.click()} className="text-cyan-700" title="Upload Image">🖼️</button>
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={e => {
        if (e.target.files && e.target.files[0]) uploadImage(e.target.files[0]);
        e.target.value = '';
      }} />
      <button type="button" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} className="text-slate-500" title="Clear Formatting">Clear</button>
    </div>
  );
}
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminPostEditor({ post, onSave, isEdit }) {
  const getInitialForm = (p) => ({
    title: p?.title || '',
    content: p?.content || '',
    featuredImage: p?.featuredImage || '',
    categoryId: p?.categoryId || '',
    tagIds: p?.tagIds || [],
    published: p?.published || false,
  });
  const [formData, setFormData] = useState(getInitialForm(post));
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(f => ({ ...f, content: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: 'bg-white rounded p-3 min-h-[200px] focus:outline-none',
      },
    },
  });
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/categories').then(res => setCategories(res.data)).catch(() => setCategories([]));
    axios.get('/api/tags').then(res => setTags(res.data)).catch(() => setTags([]));
    setFormData(getInitialForm(post));
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
    <div className="py-10 px-8">
      <button onClick={() => navigate('/admin/posts')} className="text-cyan-400 hover:underline mb-6">&larr; Back to Posts</button>
      <h1 className="text-3xl font-bold text-white mb-8">{isEdit ? 'Edit Post' : 'Create New Post'}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-6 mb-2">
          <label className="block text-slate-400 mb-1">Status:</label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="published"
              checked={!!formData.published}
              onChange={e => setFormData(f => ({ ...f, published: e.target.checked }))}
              className="form-checkbox h-5 w-5 text-cyan-600"
            />
            <span className={formData.published ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
              {formData.published ? 'Published' : 'Draft'}
            </span>
          </label>
        </div>
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
          <label className="block text-slate-400 mb-1">Body Content (Rich Text Supported)</label>
          <div className="border border-slate-300 rounded bg-white">
            <TiptapMenuBar editor={editor} />
            <EditorContent editor={editor} />
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Post'}</button>
        </div>
      </form>
    </div>
  );
}
