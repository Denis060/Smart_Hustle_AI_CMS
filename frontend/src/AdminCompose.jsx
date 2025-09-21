import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminCompose() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipient, setRecipient] = useState('all');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      await axios.post('/api/campaigns', {
        subject,
        body,
        recipient
      });
      setSuccess(true);
      setSubject('');
      setBody('');
      setRecipient('all');
    } catch (err) {
      setError('Failed to send campaign.');
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
          <textarea
            className="w-full p-4 rounded bg-slate-800 text-white text-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            rows={8}
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Write your message here..."
            required
          />
        </div>
        {error && <div className="text-red-400 text-base">{error}</div>}
        {success && <div className="text-green-400 text-base">Newsletter sent successfully!</div>}
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-10 rounded-lg text-lg"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Newsletter'}
          </button>
        </div>
      </form>
    </div>
  );
}
