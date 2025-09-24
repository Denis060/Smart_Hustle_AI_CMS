import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';

function Toolbar({ editor }) {
  if (!editor) return null;
  
  const ToolbarButton = ({ onClick, disabled, active, children, title }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center justify-center w-9 h-9 rounded-lg border transition-all duration-200 font-semibold ${
        active 
          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400 text-white shadow-lg shadow-cyan-500/25 scale-105' 
          : 'bg-slate-700/80 border-slate-500 text-slate-200 hover:bg-slate-600 hover:border-slate-400 hover:text-white hover:shadow-md hover:scale-105'
      } ${disabled ? 'opacity-40 cursor-not-allowed hover:scale-100' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center gap-2 p-4 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-lg border border-slate-600/60 mb-4 shadow-lg">
      {/* Text Formatting */}
      <div className="flex gap-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 3v14h5.5c1.5 0 2.5-.5 3-1.5s.5-2 0-3c-.3-.7-.8-1.2-1.5-1.5.7-.3 1.2-.8 1.5-1.5.5-1 .5-2 0-3s-1.5-1.5-3-1.5H3zm2 2h3.5c.5 0 1 .5 1 1s-.5 1-1 1H5V5zm0 4h4c.5 0 1 .5 1 1s-.5 1-1 1H5V9z"/>
          </svg>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 3v2h2l-2 10H6v2h6v-2h-2l2-10h2V3H8z"/>
          </svg>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline?.().run()}
          disabled={!editor.can().chain().focus().toggleUnderline?.().run()}
          active={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M6 3v6c0 1.5 1.5 3 3 3s3-1.5 3-3V3h2v6c0 2.5-2.5 5-5 5s-5-2.5-5-5V3h2zm-4 14h16v2H2v-2z"/>
          </svg>
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-slate-600 mx-2"></div>

      {/* Lists */}
      <div className="flex gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM4 8a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM5 11a1 1 0 100 2h10a1 1 0 100-2H5z"/>
          </svg>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zM3 8a1 1 0 000 2h14a1 1 0 100-2H3zM3 12a1 1 0 100 2h14a1 1 0 100-2H3z"/>
          </svg>
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-slate-500/50 mx-1.5"></div>

      {/* Links and Images */}
      <div className="flex gap-1.5">
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Enter URL:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive('link')}
          title="Insert Link"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"/>
          </svg>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => {
            const url = window.prompt('Enter image URL:');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
          title="Insert Image"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/>
          </svg>
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-slate-500/50 mx-1.5"></div>

      {/* Headings */}
      <div className="flex gap-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <span className="text-xs font-bold">H1</span>
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-slate-500/50 mx-1.5"></div>

      {/* Templates */}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => {
            const template = `
              <h1>📧 Newsletter Title</h1>
              <p>Hello {subscriber_name},</p>
              <p>Welcome to this week's newsletter! Here's what's new:</p>
              
              <h2>🎯 This Week's Highlights</h2>
              <ul>
                <li>Feature 1: Brief description</li>
                <li>Feature 2: Brief description</li>
                <li>Feature 3: Brief description</li>
              </ul>
              
              <h2>📚 New Content</h2>
              <p>Check out our latest articles and resources:</p>
              
              <h2>💡 Tip of the Week</h2>
              <p>Here's a quick tip to help you succeed...</p>
              
              <hr>
              <p><small>Thank you for being a subscriber!<br>
              Best regards,<br>
              The Smart Hustle AI Team</small></p>
            `;
            editor.commands.setContent(template);
          }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2"
          title="Insert Newsletter Template"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"/>
          </svg>
          Template
        </button>
      </div>
    </div>
  );
}

export default function AdminCompose() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const editor = useEditor({
    extensions: [StarterKit, Link, Image, Underline],
    content: body,
    onUpdate: ({ editor }) => setBody(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
      },
    },
  });
  const [recipient, setRecipient] = useState('all');
  const [courses, setCourses] = useState([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  // Add subscriber statistics
  const [subscriberStats, setSubscriberStats] = useState({
    total: 0,
    active: 0,
    openRate: 0,
    campaignsSent: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    // Fetch courses
    axios.get('/api/courses')
      .then(res => {
        // Accept both .courses and direct array
        const arr = Array.isArray(res.data) ? res.data : (res.data.courses || []);
        // Only show courses that are authored (not recommended/external)
        setCourses(arr.filter(c => !c.external && (c.isOwned === undefined || c.isOwned === true)));
      })
      .catch(() => setCourses([]));

    // Fetch subscriber statistics
    const token = localStorage.getItem('adminToken');
    if (token) {
      setStatsLoading(true);
      axios.get('/api/subscribers', { 
        headers: { Authorization: `Bearer ${token}` } 
      })
        .then(res => {
          const subscribers = res.data;
          const total = subscribers.length;
          const active = subscribers.filter(sub => !sub.unsubscribed).length;
          
          setSubscriberStats({
            total,
            active,
            openRate: total > 0 ? Math.round((active / total) * 100) : 0,
            campaignsSent: 24 // This would need a separate campaigns endpoint
          });
        })
        .catch(() => {
          // If auth fails or no subscribers, keep defaults
          setSubscriberStats({
            total: 0,
            active: 0,
            openRate: 0,
            campaignsSent: 0
          });
        })
        .finally(() => setStatsLoading(false));
    } else {
      setStatsLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('adminToken');
      let scheduledAtUtc = scheduledAt;
      
      if (scheduledAt) {
        // Convert local datetime to UTC string
        const local = new Date(scheduledAt);
        scheduledAtUtc = local.toISOString();
      }
      
      await axios.post('/api/campaigns', {
        subject,
        body,
        recipient,
        scheduledAt: scheduledAtUtc || undefined
      }, token ? { headers: { Authorization: `Bearer ${token}` } } : {});

      if (scheduledAt) {
        // Show scheduled message with local time
        const localTime = new Date(scheduledAt).toLocaleString();
        setSuccess(`Newsletter scheduled for ${localTime} successfully!`);
      } else {
        setSuccess("Newsletter sent successfully!");
      }
      
      // Clear form
      setSubject('');
      if (editor) {
        editor.commands.setContent('');
      }
      setBody('');
      setRecipient('all');
      setScheduledAt('');
      
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to send campaign.';
      setError(msg);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 mt-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white">Email Composer</h1>
            <p className="text-slate-400 text-lg">Create and send beautiful newsletters to your subscribers</p>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <div className="text-cyan-400 text-2xl font-bold">
              {statsLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Loading...
                </div>
              ) : (
                subscriberStats.total.toLocaleString()
              )}
            </div>
            <div className="text-slate-400 text-sm">Total Subscribers</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <div className="text-green-400 text-2xl font-bold">
              {statsLoading ? '...' : `${subscriberStats.openRate}%`}
            </div>
            <div className="text-slate-400 text-sm">Active Rate</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700">
            <div className="text-blue-400 text-2xl font-bold">
              {statsLoading ? '...' : subscriberStats.campaignsSent}
            </div>
            <div className="text-slate-400 text-sm">Campaigns Sent</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Composer */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subject Line */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                  </svg>
                  Subject Line
                </label>
                <input
                  type="text"
                  className="w-full p-4 rounded-lg bg-slate-900/50 text-white text-lg border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none transition-all duration-200 placeholder-slate-400"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="✨ Weekly Newsletter: Latest Updates & Insights"
                  required
                />
              </div>

              {/* Recipients */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Recipients
                </label>
                <select
                  className="w-full p-4 rounded-lg bg-slate-900/50 text-white text-lg border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none transition-all duration-200"
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  required
                >
                  <option value="all">🌟 All Newsletter Subscribers ({subscriberStats.active.toLocaleString()})</option>
                  {courses.map(course => (
                    <option key={course.id} value={`course:${course.id}`}>
                      🎓 Students in "{course.title}" ({course.studentCount || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Email Content */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                  </svg>
                  Email Content
                </label>
                
                <Toolbar editor={editor} />
                
                <div className="bg-slate-900/50 border border-slate-600 rounded-lg overflow-hidden focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/50 transition-all duration-200">
                  {editor ? (
                    <EditorContent
                      editor={editor}
                      className="min-h-[400px] text-white prose prose-invert max-w-none"
                      style={{ 
                        background: 'transparent',
                        color: '#fff',
                      }}
                    />
                  ) : (
                    <div className="min-h-[400px] flex items-center justify-center text-slate-500">
                      <div className="text-center">
                        <svg className="w-8 h-8 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Loading editor...
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-slate-300 text-sm font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"/>
                  </svg>
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  className="w-full p-4 rounded-lg bg-slate-900/50 text-white text-lg border border-slate-600 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none transition-all duration-200"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                />
                <p className="text-slate-500 text-sm mt-2">Leave empty to send immediately</p>
              </div>

              {/* Status Messages */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"/>
                  </svg>
                  <div className="text-red-300">{error}</div>
                </div>
              )}

              {success && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                  </svg>
                  <div className="text-green-300">{success}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  type="button"
                  className="flex-1 bg-slate-700/50 hover:bg-slate-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-slate-600"
                  onClick={() => setShowPreview(true)}
                  disabled={!subject || !body}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  Preview Email
                </button>
                
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                  disabled={loading || !subject || !body}
                >
                  {loading ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      {scheduledAt ? 'Schedule Newsletter' : 'Send Newsletter'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
              </svg>
              Writing Tips
            </h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span>Keep subject lines under 50 characters</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span>Use personalization tokens like {'{subscriber_name}'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span>Include a clear call-to-action</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span>Test your email before sending</span>
              </div>
            </div>
          </div>

          {/* Recent Campaigns */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
              </svg>
              Recent Campaigns
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                <div className="text-white text-sm font-medium">Weekly Update #24</div>
                <div className="text-slate-400 text-xs mt-1">Sent 3 days ago • 89% open rate</div>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                <div className="text-white text-sm font-medium">Course Launch Announcement</div>
                <div className="text-slate-400 text-xs mt-1">Sent 1 week ago • 92% open rate</div>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-600">
                <div className="text-white text-sm font-medium">Holiday Special Offer</div>
                <div className="text-slate-400 text-xs mt-1">Sent 2 weeks ago • 95% open rate</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
              </svg>
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                className="w-full p-3 text-left bg-slate-900/50 hover:bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white transition-all duration-200 text-sm"
                onClick={() => window.location.href = '/admin/subscribers'}
              >
                📊 View Subscribers
              </button>
              <button
                type="button"
                className="w-full p-3 text-left bg-slate-900/50 hover:bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white transition-all duration-200 text-sm"
                onClick={() => window.location.href = '/admin/campaigns'}
              >
                📈 Campaign Analytics
              </button>
              <button
                type="button"
                className="w-full p-3 text-left bg-slate-900/50 hover:bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white transition-all duration-200 text-sm"
                onClick={() => window.location.href = '/admin/settings'}
              >
                ⚙️ Email Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] border border-slate-700 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Email Preview</h2>
              </div>
              <button
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors duration-200"
                onClick={() => setShowPreview(false)}
                aria-label="Close preview"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Email Header Simulation */}
              <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700">
                <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                  <span>From: Smart Hustle AI &lt;noreply@smarthustleai.com&gt;</span>
                  <span>To: subscriber@example.com</span>
                </div>
                <div className="text-lg font-semibold text-white">
                  {subject || <span className="italic text-slate-500">No subject line</span>}
                </div>
              </div>

              {/* Email Body Preview */}
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-center">
                  <h1 className="text-2xl font-bold text-white">Smart Hustle AI</h1>
                  <p className="text-cyan-100 mt-2">Your AI-Powered Learning Platform</p>
                </div>
                
                <div className="p-8">
                  <div 
                    className="prose prose-lg max-w-none text-gray-800"
                    style={{ color: '#1f2937' }}
                    dangerouslySetInnerHTML={{ 
                      __html: body || '<div class="text-gray-400 italic text-center py-8">No content to preview</div>' 
                    }} 
                  />
                </div>

                <div className="bg-gray-50 p-6 border-t border-gray-200 text-center">
                  <p className="text-gray-600 text-sm mb-4">
                    You're receiving this email because you subscribed to our newsletter.
                  </p>
                  <div className="flex justify-center gap-4 text-sm text-gray-500">
                    <a href="#" className="hover:text-cyan-600">Unsubscribe</a>
                    <span>•</span>
                    <a href="#" className="hover:text-cyan-600">Manage Preferences</a>
                    <span>•</span>
                    <a href="#" className="hover:text-cyan-600">Contact Us</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-900 p-6 flex justify-between items-center border-t border-slate-700">
              <div className="text-slate-400 text-sm">
                Preview mode - Links are not functional
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    // Auto-focus the form for quick sending
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 transform hover:scale-105"
                >
                  Looks Good, Send!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
