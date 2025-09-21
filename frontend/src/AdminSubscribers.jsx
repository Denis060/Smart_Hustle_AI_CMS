import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    axios.get('/api/subscribers', token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      .then(res => setSubscribers(res.data))
      .catch(() => setSubscribers([]))
      .finally(() => setLoading(false));
  }, []);

  return (
  <div className="max-w-6xl mx-auto bg-[#12192b] rounded-xl p-8 border border-slate-800 mt-8 min-h-[400px] relative">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-extrabold text-white">Newsletter Subscribers</h2>
        <button className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-lg shadow" onClick={() => window.location.href='/admin/compose'}>
          Compose Email
        </button>
      </div>
      <div className="rounded-2xl overflow-hidden border border-slate-700 bg-[#1a2236]">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : subscribers.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No subscribers found.</div>
        ) : (
          <ul>
            {subscribers.map(sub => (
              <li key={sub.id} className="flex items-center justify-between px-8 py-5 border-b border-slate-700 last:border-b-0">
                <span className="text-lg text-white font-medium">{sub.email}</span>
                <span className="text-slate-400 text-sm">Subscribed: {sub.createdAt ? sub.createdAt.slice(0, 10) : ''}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
