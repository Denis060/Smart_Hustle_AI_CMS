


import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminAnalytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  useEffect(() => {
    setLoading(true);
    axios.get(`/api/analytics/summary?period=${selectedPeriod}`)
      .then(res => {
        setSummary(res.data);
      })
      .catch(() => setError('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, [selectedPeriod]);

  const periodLabels = {
    '7d': 'Last 7 days',
    '30d': 'Last 30 days', 
    '90d': 'Last 90 days'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header with period selector */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-extrabold text-white">Analytics Dashboard</h1>
        <div className="flex gap-2">
          {Object.entries(periodLabels).map(([period, label]) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-800 rounded-xl p-8 text-center">
          <div className="text-slate-300 text-lg">Loading analytics...</div>
        </div>
      ) : error ? (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-6">
          <div className="text-red-400 text-lg">{error}</div>
        </div>
      ) : summary ? (
        <>
          {/* Main metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard 
              icon={<span style={{fontSize:28}} role="img" aria-label="courses">💎</span>} 
              label="Courses" 
              value={summary.courses?.toLocaleString() || 0} 
              accent="indigo" 
            />
            <SummaryCard 
              icon={<span style={{fontSize:28}} role="img" aria-label="students">🎓</span>} 
              label="Total Students" 
              value={summary.totalStudents?.toLocaleString() || 0} 
              accent="emerald" 
              growth={summary.growth?.enrollments}
              subValue={`${summary.period?.recentEnrollments || 0} new`}
            />
            <SummaryCard 
              icon={<span style={{fontSize:28}} role="img" aria-label="subscribers">👥</span>} 
              label="Subscribers" 
              value={summary.subscribers?.toLocaleString() || 0} 
              accent="yellow" 
              growth={summary.growth?.subscribers}
              subValue={`${summary.period?.recentSubscribers || 0} new`}
            />
            <SummaryCard 
              icon={<span style={{fontSize:28}} role="img" aria-label="posts">📝</span>} 
              label="Blog Posts" 
              value={summary.posts?.toLocaleString() || 0} 
              accent="cyan" 
              growth={summary.growth?.posts}
              subValue={`${summary.period?.recentPosts || 0} new`}
            />
          </div>

          {/* Secondary metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Additional Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-300">Course Enrollments</span>
                  <span className="text-white font-semibold">{summary.enrollments?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-slate-300">Email Campaigns</span>
                  <span className="text-white font-semibold">{summary.campaigns?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-300">Growth Period</span>
                  <span className="text-cyan-400 font-semibold">{periodLabels[selectedPeriod]}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full"></div>
                  <span className="text-slate-300">Active Subscribers</span>
                  <span className="text-emerald-400 font-semibold ml-auto">{summary.subscribers || 0}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
                  <span className="text-slate-300">Published Posts</span>
                  <span className="text-cyan-400 font-semibold ml-auto">{summary.posts || 0}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                  <span className="text-slate-300">Available Courses</span>
                  <span className="text-indigo-400 font-semibold ml-auto">{summary.courses || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top performing content */}
          <div className="bg-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Top Performing Content</h2>
            {summary.topPosts && summary.topPosts.length > 0 ? (
              <div className="space-y-4">
                {summary.topPosts.map((post, idx) => (
                  <div key={post.id || idx} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{post.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>By {post.author}</span>
                        <span>•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-cyan-400 font-bold text-lg">
                      {post.views?.toLocaleString() || 0} views
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-center py-8">No content data available.</div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ActivityCard 
              title="Recent Posts" 
              items={summary.recentActivity?.posts || []}
              type="posts"
              icon="📝"
            />
            <ActivityCard 
              title="New Subscribers" 
              items={summary.recentActivity?.subscribers || []}
              type="subscribers"
              icon="👥"
            />
            <ActivityCard 
              title="Course Enrollments" 
              items={summary.recentActivity?.enrollments || []}
              type="enrollments"
              icon="🎓"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function SummaryCard({ icon, label, value, accent, growth, subValue }) {
  const accentMap = {
    indigo: 'bg-indigo-700/80 text-indigo-200 border-indigo-600/50',
    emerald: 'bg-emerald-700/80 text-emerald-200 border-emerald-600/50',
    yellow: 'bg-yellow-600/80 text-yellow-100 border-yellow-600/50',
    cyan: 'bg-cyan-700/80 text-cyan-200 border-cyan-600/50',
    default: 'bg-slate-800 text-slate-200 border-slate-700',
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-emerald-400';
    if (growth < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return '↗️';
    if (growth < 0) return '↘️';
    return '➡️';
  };

  return (
    <div className={`rounded-xl p-6 border shadow-lg ${accentMap[accent] || accentMap.default}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-2xl">{icon}</div>
        {growth !== undefined && (
          <div className={`text-sm font-medium ${getGrowthColor(growth)}`}>
            {getGrowthIcon(growth)} {Math.abs(growth)}%
          </div>
        )}
      </div>
      <div className="text-3xl font-extrabold mb-1">{value}</div>
      <div className="text-sm text-slate-300 font-medium">{label}</div>
      {subValue && (
        <div className="text-xs text-slate-400 mt-1">{subValue}</div>
      )}
    </div>
  );
}

function ActivityCard({ title, items, type, icon }) {
  const renderItem = (item, index) => {
    switch (type) {
      case 'posts':
        return (
          <div key={item.id || index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded">
            <div className="text-sm">📝</div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{item.title}</div>
              <div className="text-slate-400 text-xs">
                {new Date(item.createdAt).toLocaleDateString()}
                {item.published ? ' • Published' : ' • Draft'}
              </div>
            </div>
          </div>
        );
      case 'subscribers':
        return (
          <div key={item.id || index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded">
            <div className="text-sm">👤</div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{item.email}</div>
              <div className="text-slate-400 text-xs">
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        );
      case 'enrollments':
        return (
          <div key={item.id || index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded">
            <div className="text-sm">🎓</div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-medium truncate">{item.Course?.title || 'Course'}</div>
              <div className="text-slate-400 text-xs">
                {item.Student?.email || 'Student'} • {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">{icon}</span>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="space-y-2">
        {items && items.length > 0 ? (
          items.map(renderItem)
        ) : (
          <div className="text-slate-400 text-sm text-center py-4">No recent activity</div>
        )}
      </div>
    </div>
  );
}
