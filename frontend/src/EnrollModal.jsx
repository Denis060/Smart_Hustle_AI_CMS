import React, { useState } from 'react';
import axios from 'axios';

export default function EnrollModal({ course, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', interest: '', motivation: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/enrollments/enroll', { ...form, courseId: course.id });
      setSuccess(true);
    } catch (err) {
      setError('Failed to enroll. Please try again.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 rounded-xl w-full max-w-md border border-slate-700 p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-6">Enrollment Successful!</h2>
          <p className="text-slate-300 mb-6">You have been enrolled in <b>{course.title}</b>.</p>
          <button className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl w-full max-w-md border border-slate-700 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Enroll in {course.title}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 mb-1">Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white" required />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Interest</label>
            <input type="text" name="interest" value={form.interest} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white" />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Motivation</label>
            <textarea name="motivation" value={form.motivation} onChange={handleChange} className="w-full p-2 rounded bg-slate-700 text-white" rows={2} />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg">Cancel</button>
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg" disabled={loading}>{loading ? 'Enrolling...' : 'Enroll'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
