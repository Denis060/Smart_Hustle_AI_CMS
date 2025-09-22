import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    axios.get('/api/campaigns', token ? { headers: { Authorization: `Bearer ${token}` } } : {})
      .then(res => setCampaigns(res.data))
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  // Helper to display recipients
  function getRecipientLabel(c) {
    if (!c.recipient) return 'All Subscribers';
    if (c.recipient === 'all') return 'All Subscribers';
    if (c.recipient.startsWith('course:')) return 'Course Students';
    return c.recipient;
  }

  return (
    <div className="max-w-6xl mx-auto bg-[#12192b] rounded-xl p-8 border border-slate-800 mt-8 min-h-[400px]">
      <h2 className="text-4xl font-bold text-white mb-8">Campaign History</h2>
      <div className="rounded-2xl overflow-hidden border border-slate-700 bg-[#1a2236]">
        <div className="grid grid-cols-12 gap-0 bg-slate-800 text-slate-300 text-lg font-semibold px-8 py-4">
          <div className="col-span-4">SUBJECT</div>
          <div className="col-span-2">RECIPIENTS</div>
          <div className="col-span-2">SENT</div>
          <div className="col-span-2">FAILED</div>
          <div className="col-span-2">OPENED</div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : campaigns.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No campaigns found.</div>
        ) : (
          campaigns.map(c => (
            <div key={c.id} className="grid grid-cols-12 gap-0 px-8 py-5 border-b border-slate-700 last:border-b-0 items-center text-white text-lg">
              <div className="col-span-4">{c.subject}</div>
              <div className="col-span-2">{getRecipientLabel(c)}</div>
              <div className="col-span-2">{c.sentCount ?? 0}</div>
              <div className="col-span-2">{c.failCount ?? 0}</div>
              <div className="col-span-2">{c.openCount ?? 0}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
