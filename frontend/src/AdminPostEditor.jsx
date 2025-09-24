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
    if (!file) return;
    
    // Show loading indicator
    const loadingText = '🔄 Uploading image...';
    editor.chain().focus().insertContent(`<p style="color: #06b6d4; font-style: italic;">${loadingText}</p>`).run();
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploader', 'Blog Editor');
    
    try {
      const res = await axios.post('/api/uploads', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data', 
          Authorization: `Bearer ${localStorage.getItem('adminToken')}` 
        }
      });
      
      const imageUrl = res.data.url;
      const fullUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`;
      
      // Replace loading text with image
      editor.commands.undo(); // Remove loading text
      editor.chain().focus().setImage({ 
        src: fullUrl,
        alt: file.name,
        title: file.name 
      }).run();
      
      console.log('✅ Image uploaded successfully:', fullUrl);
      
    } catch (err) {
      console.error('❌ Image upload failed:', err);
      editor.commands.undo(); // Remove loading text
      
      const errorMsg = err.response?.data?.error || err.message || 'Unknown error';
      alert(`❌ Image upload failed: ${errorMsg}`);
      
      // Insert error message
      editor.chain().focus().insertContent(`<p style="color: #ef4444; font-style: italic;">❌ Failed to upload image: ${errorMsg}</p>`).run();
    }
  };
  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-300 p-3 bg-slate-100 rounded-t-lg">
      {/* History */}
      <div className="flex gap-1 mr-2 pr-2 border-r border-slate-300">
        <button type="button" onClick={() => editor.chain().focus().undo().run()} 
          className="p-2 hover:bg-slate-200 rounded transition-colors" title="Undo">
          ↶
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} 
          className="p-2 hover:bg-slate-200 rounded transition-colors" title="Redo">
          ↷
        </button>
      </div>
      
      {/* Text Formatting */}
      <div className="flex gap-1 mr-2 pr-2 border-r border-slate-300">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} 
          className={`p-2 rounded transition-colors ${editor.isActive('bold') ? 'bg-cyan-100 text-cyan-700 font-bold' : 'hover:bg-slate-200'}`} title="Bold">
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} 
          className={`p-2 rounded transition-colors ${editor.isActive('italic') ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-slate-200'}`} title="Italic">
          <em>I</em>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} 
          className={`p-2 rounded transition-colors ${editor.isActive('strike') ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-slate-200'}`} title="Strikethrough">
          <s>S</s>
        </button>
      </div>
      
      {/* Headings */}
      <div className="flex gap-1 mr-2 pr-2 border-r border-slate-300">
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          className={`px-2 py-1 text-sm font-bold rounded transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-slate-200'}`} title="Heading 1">
          H1
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          className={`px-2 py-1 text-sm font-bold rounded transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-slate-200'}`} title="Heading 2">
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
          className={`px-2 py-1 text-sm font-bold rounded transition-colors ${editor.isActive('heading', { level: 3 }) ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-slate-200'}`} title="Heading 3">
          H3
        </button>
      </div>
      
      {/* Lists & Blocks */}
      <div className="flex gap-1 mr-2 pr-2 border-r border-slate-300">
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} 
          className={`p-2 rounded transition-colors ${editor.isActive('bulletList') ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-slate-200'}`} title="Bullet List">
          •
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          className={`p-2 rounded transition-colors ${editor.isActive('orderedList') ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-slate-200'}`} title="Numbered List">
          1.
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} 
          className={`p-2 rounded transition-colors ${editor.isActive('blockquote') ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-slate-200'}`} title="Quote">
          ❝
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
          className={`p-2 rounded transition-colors ${editor.isActive('codeBlock') ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-slate-200'}`} title="Code Block">
          {'</>'}
        </button>
      </div>
      
      {/* Links & Media */}
      <div className="flex gap-1 mr-2 pr-2 border-r border-slate-300">
        <button type="button" onClick={() => {
          const url = window.prompt('Enter link URL (https://example.com):');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }} className={`p-2 rounded transition-colors ${editor.isActive('link') ? 'bg-cyan-100 text-cyan-700' : 'hover:bg-slate-200'}`} title="Add Link">
          🔗
        </button>
        <button type="button" onClick={() => fileInputRef.current.click()} 
          className="p-2 hover:bg-slate-200 rounded transition-colors text-cyan-600 font-bold" title="Upload & Insert Image">
          �
        </button>
      </div>
      
      {/* Clear Formatting */}
      <button type="button" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} 
        className="p-2 hover:bg-slate-200 rounded transition-colors text-slate-600" title="Clear Formatting">
        🧹
      </button>
      
      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={e => {
        if (e.target.files && e.target.files[0]) uploadImage(e.target.files[0]);
        e.target.value = '';
      }} />
    </div>
  );
}

// Featured Image Upload Component
function FeaturedImageUpload({ currentImage, onImageChange }) {
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(currentImage || '');
  const fileInputRef = useRef();

  useEffect(() => {
    setImagePreview(currentImage || '');
  }, [currentImage]);

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploader', 'Admin');

    try {
      const res = await axios.post('/api/uploads', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}` 
        }
      });
      
      const imageUrl = res.data.url;
      setImagePreview(imageUrl);
      onImageChange(imageUrl);
    } catch (err) {
      alert('Failed to upload image: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
      e.target.value = ''; // Reset input
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeImage = () => {
    setImagePreview('');
    onImageChange('');
  };

  return (
    <div>
      <label className="block text-slate-400 mb-2">Featured Image</label>
      
      {imagePreview ? (
        <div className="relative">
          <img 
            src={imagePreview.startsWith('http') ? imagePreview : `http://localhost:5000${imagePreview}`}
            alt="Featured" 
            className="w-full max-w-md h-48 object-cover rounded-lg border border-slate-600" 
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-slate-800/80 hover:bg-slate-700 text-white px-3 py-1 rounded text-sm"
          >
            Change
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-slate-600 hover:border-slate-500 transition-colors rounded-lg p-8 text-center cursor-pointer bg-slate-800/50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="text-slate-400">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto mb-2"></div>
              Uploading...
            </div>
          ) : (
            <div className="text-slate-400">
              <div className="text-4xl mb-2">📷</div>
              <p className="text-lg mb-1">Drop image here or click to upload</p>
              <p className="text-sm">Supports JPG, PNG, GIF up to 10MB</p>
            </div>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Fallback URL input */}
      <div className="mt-4">
        <label className="block text-slate-500 text-sm mb-1">Or enter image URL manually</label>
        <input 
          type="text" 
          value={imagePreview} 
          onChange={(e) => {
            setImagePreview(e.target.value);
            onImageChange(e.target.value);
          }}
          placeholder="https://example.com/image.jpg"
          className="w-full p-2 rounded bg-slate-700 text-white text-sm border border-slate-600"
        />
      </div>
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
    // SEO fields (matching database schema)
    metaDescription: p?.metaDescription || '',
    metaKeywords: p?.metaKeywords || '',
    slug: p?.slug || '',
    excerpt: p?.excerpt || '',
    // Scheduling fields
    isScheduled: false,
    scheduledAt: p?.scheduledAt ? new Date(p.scheduledAt).toISOString().slice(0, 16) : '',
  });
  
  const [formData, setFormData] = useState(getInitialForm(post));
  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState({ words: 0, characters: 0, readingTime: 0 });
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: true,
      }),
    ],
    content: formData.content || '<p>Start writing your amazing content here...</p>',
    editable: true,
    autofocus: 'end',
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      setFormData(f => ({ ...f, content }));
      updateStats(content);
    },
    editorProps: {
      attributes: {
        class: 'bg-white rounded-b-lg p-4 min-h-[300px] focus:outline-none prose prose-slate max-w-none [&>*]:mb-4 [&>p]:mb-2 [&>h1]:mb-4 [&>h2]:mb-3 [&>h3]:mb-2',
        spellcheck: 'false',
      },
      handleClick: () => {
        // Ensure focus when clicked
        return false;
      },
    },
    onCreate: () => {
      console.log('TipTap editor created successfully');
    },
  }, []);
  
  // Force focus on editor when it's created
  useEffect(() => {
    if (editor) {
      setTimeout(() => {
        editor.chain().focus().run();
      }, 100);
    }
  }, [editor]);
  
  // Calculate reading statistics
  const updateStats = (content) => {
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const readingTime = Math.ceil(words / 200); // Average 200 words per minute
    
    setStats({ words, characters, readingTime });
  };
  
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  
  // Initialize stats when component mounts or content changes
  useEffect(() => {
    if (formData.content) {
      updateStats(formData.content);
    }
  }, [formData.content]);
  
  // Update editor content when editing existing post
  useEffect(() => {
    if (editor && post?.content && post.content !== formData.content) {
      editor.commands.setContent(post.content);
    }
  }, [editor, post, formData.content]);

  useEffect(() => {
    axios.get('/api/categories').then(res => setCategories(res.data)).catch(() => setCategories([]));
    axios.get('/api/tags').then(res => setTags(res.data)).catch(() => setTags([]));
    setFormData(getInitialForm(post));
  }, [post]);

  // Generate URL-friendly slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-'); // Remove multiple consecutive hyphens
  };

  const handleChange = (e) => {
    const { name, value, options, multiple } = e.target;
    if (multiple) {
      const selected = Array.from(options).filter(o => o.selected).map(o => parseInt(o.value));
      setFormData(prev => ({ ...prev, tagIds: selected }));
    } else {
      const updatedForm = { ...formData, [name]: value };
      
      // Auto-generate slug when title changes (and slug is empty or matches generated version)
      if (name === 'title' && (!formData.slug || formData.slug === generateSlug(formData.title))) {
        updatedForm.slug = generateSlug(value);
      }
      
      setFormData(updatedForm);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Prepare the data for submission
      const submitData = { ...formData };
      
      // Handle scheduling logic
      if (formData.isScheduled && formData.scheduledAt) {
        const scheduledDate = new Date(formData.scheduledAt);
        const now = new Date();
        
        if (scheduledDate <= now) {
          alert('Scheduled date must be in the future!');
          setSaving(false);
          return;
        }
        
        submitData.scheduledAt = scheduledDate.toISOString();
        submitData.published = false; // Scheduled posts start as unpublished
      } else {
        // Remove scheduling data if not scheduled
        delete submitData.scheduledAt;
        delete submitData.isScheduled;
      }
      
      await onSave(submitData);
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
        
        {/* SEO & Metadata Section */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            🔍 SEO & Metadata
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 mb-1">URL Slug</label>
              <div className="relative">
                <input 
                  type="text" 
                  name="slug" 
                  value={formData.slug} 
                  onChange={handleChange} 
                  className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 pr-20" 
                  placeholder="auto-generated-from-title"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, slug: generateSlug(formData.title) }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-700 text-white px-2 py-1 rounded text-xs"
                >
                  Auto
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-1">URL: /posts/{formData.slug || 'your-slug-here'}</p>
            </div>
            
            <div>
              <label className="block text-slate-400 mb-1">Meta Description</label>
              <textarea 
                name="metaDescription" 
                value={formData.metaDescription} 
                onChange={handleChange}
                rows={3}
                maxLength={160}
                className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600 resize-none" 
                placeholder="Brief description for search engines (160 characters max)"
              />
              <div className="text-right text-slate-500 text-xs mt-1">
                {formData.metaDescription.length}/160 characters
              </div>
            </div>
            
            <div>
              <label className="block text-slate-400 mb-1">Keywords</label>
              <input 
                type="text" 
                name="metaKeywords" 
                value={formData.metaKeywords} 
                onChange={handleChange}
                className="w-full p-3 rounded bg-slate-700 text-white border border-slate-600" 
                placeholder="keyword1, keyword2, keyword3"
              />
              <p className="text-slate-500 text-xs mt-1">Separate keywords with commas</p>
            </div>
          </div>
        </div>
        
        {/* Writing Stats */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            📊 Writing Statistics
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-slate-700/50 rounded p-3">
              <div className="text-2xl font-bold text-cyan-400">{stats.words}</div>
              <div className="text-slate-400 text-sm">Words</div>
            </div>
            <div className="bg-slate-700/50 rounded p-3">
              <div className="text-2xl font-bold text-green-400">{stats.characters}</div>
              <div className="text-slate-400 text-sm">Characters</div>
            </div>
            <div className="bg-slate-700/50 rounded p-3">
              <div className="text-2xl font-bold text-purple-400">{stats.readingTime}</div>
              <div className="text-slate-400 text-sm">Min Read</div>
            </div>
          </div>
        </div>
        
        <FeaturedImageUpload 
          currentImage={formData.featuredImage} 
          onImageChange={(url) => setFormData(f => ({ ...f, featuredImage: url }))}
        />
        <div>
          <label className="block text-slate-400 mb-4">Body Content</label>
          
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-600 mb-4">
            <button
              type="button"
              onClick={() => setShowPreview(false)}
              className={`px-4 py-2 font-medium transition-colors ${
                !showPreview 
                  ? 'text-cyan-400 border-b-2 border-cyan-400' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              ✏️ Write
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className={`px-4 py-2 font-medium transition-colors ${
                showPreview 
                  ? 'text-cyan-400 border-b-2 border-cyan-400' 
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              👁️ Preview
            </button>
          </div>
          
          {/* Editor/Preview Content */}
          {!showPreview ? (
            <div className="border border-slate-300 rounded-lg bg-white min-h-[400px]">
              <TiptapMenuBar editor={editor} />
              {editor ? (
                <div onClick={() => editor.chain().focus().run()}>
                  <EditorContent editor={editor} />
                </div>
              ) : (
                <div className="p-4">
                  <div className="text-slate-600 italic">Loading editor...</div>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full h-64 p-4 mt-2 border border-slate-300 rounded resize-none"
                    placeholder="Start writing your post content..."
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="border border-slate-600 rounded-lg bg-slate-800/30 min-h-[300px]">
              {/* Preview Header */}
              <div className="p-4 border-b border-slate-600">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {formData.title || 'Untitled Post'}
                </h2>
                <div className="flex items-center gap-4 text-slate-400 text-sm">
                  <span>📅 {new Date().toLocaleDateString()}</span>
                  <span>👤 Admin</span>
                  <span>⏱️ {stats.readingTime} min read</span>
                  <span>📝 {stats.words} words</span>
                </div>
              </div>
              
              {/* Featured Image in Preview */}
              {formData.featuredImage && (
                <div className="p-4 border-b border-slate-600">
                  <img 
                    src={formData.featuredImage.startsWith('http') ? formData.featuredImage : `http://localhost:5000${formData.featuredImage}`}
                    alt={formData.title || 'Featured image'} 
                    className="w-full max-h-64 object-cover rounded-lg" 
                  />
                </div>
              )}
              
              {/* Content Preview */}
              <div className="p-4">
                <div 
                  className="prose prose-invert max-w-none text-slate-200"
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p className="text-slate-500">Start writing to see your content preview...</p>' }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Publishing & Scheduling Section */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            🚀 Publishing Options
          </h3>
          
          <div className="space-y-4">
            {/* Publish Now vs Schedule Toggle */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="publishType"
                  checked={!formData.isScheduled}
                  onChange={() => setFormData(prev => ({ ...prev, isScheduled: false }))}
                  className="text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-slate-300">📤 Publish Now</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="publishType"
                  checked={formData.isScheduled}
                  onChange={() => setFormData(prev => ({ ...prev, isScheduled: true }))}
                  className="text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-slate-300">⏰ Schedule for Later</span>
              </label>
            </div>
            
            {/* Schedule Date/Time Picker */}
            {formData.isScheduled && (
              <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                <label className="block text-slate-400 mb-2">📅 Schedule Date & Time</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="datetime-local"
                    name="scheduledAt"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    min={new Date().toISOString().slice(0, 16)}
                    className="flex-1 p-3 rounded bg-slate-800 text-white border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                  <div className="text-slate-400 text-sm">
                    {formData.scheduledAt && (
                      <div className="bg-slate-800/80 px-3 py-2 rounded">
                        📍 {new Date(formData.scheduledAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-slate-500 text-xs mt-2">
                  Post will be automatically published at the scheduled time
                </p>
              </div>
            )}
            
            {/* Publication Status */}
            {!formData.isScheduled && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                  className="text-cyan-600 focus:ring-cyan-500 rounded"
                />
                <label className="text-slate-300">✅ Publish immediately</label>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          {/* Save as Draft Button */}
          <button 
            type="button" 
            onClick={async () => {
              setSaving(true);
              try {
                const draftData = { ...formData, published: false, isScheduled: false };
                delete draftData.scheduledAt;
                await onSave(draftData);
                alert('Post saved as draft!');
                navigate('/admin');
              } catch (err) {
                alert('Failed to save draft: ' + (err.response?.data?.error || err.message));
              } finally {
                setSaving(false);
              }
            }}
            className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-6 rounded-lg" 
            disabled={saving}
          >
            💾 Save Draft
          </button>
          
          {/* Main Submit Button */}
          <button 
            type="submit" 
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg flex items-center space-x-2" 
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>
                  {formData.isScheduled ? '⏰ Schedule Post' : 
                   formData.published ? '🚀 Publish Post' : 
                   '📝 Save Post'}
                </span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
