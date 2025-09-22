import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

function Toolbar({ editor }) {
  if (!editor) return null;
  return (
    <div className="flex gap-2 mb-2">
      <button type="button" className="px-2 py-1 rounded bg-slate-700 text-white hover:bg-cyan-600" onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()}><b>B</b></button>
      <button type="button" className="px-2 py-1 rounded bg-slate-700 text-white hover:bg-cyan-600" onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()}><i>I</i></button>
      <button type="button" className="px-2 py-1 rounded bg-slate-700 text-white hover:bg-cyan-600" onClick={() => editor.chain().focus().toggleUnderline().run()} disabled={!editor.can().chain().focus().toggleUnderline?.().run()}><u>U</u></button>
      <button type="button" className="px-2 py-1 rounded bg-slate-700 text-white hover:bg-cyan-600" onClick={() => {
        const url = window.prompt('Enter URL');
        if (url) editor.chain().focus().setLink({ href: url }).run();
      }}>Link</button>
      <button type="button" className="px-2 py-1 rounded bg-slate-700 text-white hover:bg-cyan-600" onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
    </div>
  );
}

export default function AdminCompose() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const editor = useEditor({
    extensions: [StarterKit, Link, Image],
    content: body,
    onUpdate: ({ editor }) => setBody(editor.getHTML()),
  });
  const [recipient, setRecipient] = useState('all');
  const [courses, setCourses] = useState([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    axios.get('/api/courses')
      .then(res => {
        // Accept both .courses and direct array
        const arr = Array.isArray(res.data) ? res.data : (res.data.courses || []);
        // Only show courses that are authored (not recommended/external)
        setCourses(arr.filter(c => !c.external && (c.isOwned === undefined || c.isOwned === true)));
      })
      .catch(() => setCourses([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
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
        <div>
          <label className="block text-slate-400 mb-2 text-lg">Send At (optional)</label>
          <input
            type="datetime-local"
            className="w-full p-4 rounded bg-slate-800 text-white text-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
          />
        </div>
      if (scheduledAt) {
        // Show scheduled message with local time
        const localTime = new Date(scheduledAt).toLocaleString();
        setSuccess(`Newsletter scheduled for ${localTime} successfully!`);
      } else {
        setSuccess("Newsletter sent successfully!");
      }
      setSubject('');
      setBody('');
      setRecipient('all');
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || 'Failed to send campaign.';
      setError(msg);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto bg-[#12192b] rounded-xl p-10 border border-slate-800 mt-8 min-h-[400px]">
      <h1 className="text-4xl font-extrabold text-white mb-10">Compose Newsletter</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <label className="block text-slate-400 mb-2 text-lg">Subject</label>
          <input
            type="text"
            className="w-full p-4 rounded bg-slate-800 text-white text-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="e.g., Week 2 Assignments & Updates"
            required
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-2 text-lg">Recipients</label>
          <select
            className="w-full p-4 rounded bg-slate-800 text-white text-lg border-2 border-cyan-500 focus:outline-none"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            required
          >
            <option value="all">All Newsletter Subscribers</option>
            {courses.map(course => (
              <option key={course.id} value={`course:${course.id}`}>Students in "{course.title}"</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-slate-400 mb-2 text-lg">Email Body</label>
          <Toolbar editor={editor} />
          {editor ? (
            <EditorContent
              editor={editor}
              className="min-h-[200px] mb-5 p-2 rounded border border-slate-700"
              style={{ background: '#1a2236', color: '#fff', minHeight: 200 }}
            />
          ) : (
            <div className="min-h-[200px] mb-5 p-2 rounded border border-slate-700 bg-[#1a2236] text-slate-500 flex items-center justify-center">Loading editor...</div>
          )}
        </div>
        {error && <div className="text-red-400 text-base">{error}</div>}
  {success && <div className="text-green-400 text-base">{success}</div>}
        <div>
          <label className="block text-slate-400 mb-2 text-lg">Send At (optional)</label>
          <input
            type="datetime-local"
            className="w-full p-4 rounded bg-slate-800 text-white text-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={scheduledAt}
            onChange={e => setScheduledAt(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-lg text-lg"
            onClick={() => setShowPreview(true)}
          >
            Preview
          </button>
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-10 rounded-lg text-lg"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Newsletter'}
          </button>
        </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#1a2236] rounded-xl p-8 max-w-2xl w-full border border-slate-700 relative max-h-screen overflow-auto">
            <button
              className="absolute top-3 right-3 text-white text-2xl font-bold hover:text-cyan-400"
              onClick={() => setShowPreview(false)}
              aria-label="Close preview"
            >×</button>
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Email Preview</h2>
            <div className="mb-4">
              <span className="text-slate-400 font-semibold">Subject:</span>
              <span className="ml-2 text-white">{subject || <span className="italic text-slate-500">(No subject)</span>}</span>
            </div>
            <div className="border border-slate-700 rounded bg-[#12192b] p-6 min-h-[120px] text-white prose prose-invert max-w-none" style={{ color: '#fff' }}>
              <div dangerouslySetInnerHTML={{ __html: body || '<span class="italic text-slate-500">(No content)</span>' }} />
            </div>
          </div>
        </div>
      )}
      </form>
    </div>
  );
}
