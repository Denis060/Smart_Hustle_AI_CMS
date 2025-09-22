


import React, { useEffect, useState } from 'react';
import axios from 'axios';


export default function AdminAnalytics() {
  const [summary, setSummary] = useState(null);
  const [topContent, setTopContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get('/api/analytics/summary')
      .then(res => {
        setSummary(res.data);
        setTopContent(res.data.topContent || []);
      })
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto bg-[#10182a] rounded-xl p-10 border border-slate-800 mt-8 min-h-[500px]">
      <h1 className="text-4xl font-extrabold text-white mb-10">Analytics Dashboard</h1>
      {loading ? (
        <div className="text-slate-300 text-lg">Loading...</div>
      ) : error ? (
        <div className="text-red-400 text-lg">{error}</div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <SummaryCard icon={<span style={{fontSize:28}} role="img" aria-label="courses">�</span>} label="Courses" value={summary.courses?.toLocaleString() || 0} accent="indigo" />
            <SummaryCard icon={<span style={{fontSize:28}} role="img" aria-label="students">🎓</span>} label="Total Students" value={summary.totalStudents?.toLocaleString() || 0} accent="emerald" />
            <SummaryCard icon={<span style={{fontSize:28}} role="img" aria-label="subscribers">🧑‍�</span>} label="Subscribers" value={summary.subscribers?.toLocaleString() || 0} accent="yellow" />
            <SummaryCard icon={<span style={{fontSize:28}} role="img" aria-label="posts">�</span>} label="Blog Posts" value={summary.posts?.toLocaleString() || 0} accent="cyan" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Top Performing Content</h2>
          <div className="bg-[#18213a] rounded-xl p-6 mb-12">
            {topContent.length === 0 ? (
              <div className="text-slate-400">No data available.</div>
            ) : (
              <ul>
                {topContent.map((item, idx) => (
                  <li key={item.id || idx} className="flex justify-between items-center py-3 border-b border-slate-700 last:border-b-0">
                    <span className="text-lg text-white">{item.title}</span>
                    <span className="text-cyan-200 font-bold text-lg">{item.views?.toLocaleString() || 0} views</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Placeholder for future charts/visualizations */}
          <div className="bg-slate-800 rounded-xl p-8 mt-8">
            <h2 className="text-2xl font-bold text-cyan-400 mb-4">Trends & Visualizations</h2>
            <div className="text-slate-400">Charts coming soon...</div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function SummaryCard({ icon, label, value, accent }) {
  const accentMap = {
    indigo: 'bg-indigo-700/80 text-indigo-200',
    emerald: 'bg-emerald-700/80 text-emerald-200',
    yellow: 'bg-yellow-600/80 text-yellow-100',
    cyan: 'bg-cyan-700/80 text-cyan-200',
    default: 'bg-slate-800 text-slate-200',
  };
  return (
    <div className={`rounded-xl p-7 flex flex-col items-center border border-slate-700 shadow-lg ${accentMap[accent] || accentMap.default}`}>
      <div className="mb-2">{icon}</div>
      <div className="text-3xl font-extrabold mb-1">{value}</div>
      <div className="text-base text-slate-200 text-center font-medium">{label}</div>
    </div>
  );
}
