import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, unsubscribed
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      const [subscribersRes, statsRes] = await Promise.all([
        axios.get('/api/subscribers', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/analytics/stats', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: {} }))
      ]);
      
      const subscriberData = subscribersRes.data;
      setSubscribers(subscriberData);
      
      // Calculate subscriber stats
      const total = subscriberData.length;
      const active = subscriberData.filter(s => !s.unsubscribed).length;
      const unsubscribed = subscriberData.filter(s => s.unsubscribed).length;
      const recentCount = subscriberData.filter(s => {
        const createdDate = new Date(s.createdAt);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdDate >= sevenDaysAgo;
      }).length;
      
      setStats({
        total,
        active,
        unsubscribed,
        recent: recentCount,
        ...statsRes.data
      });
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setSubscribers([]);
    }
    setLoading(false);
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (subscriber.name && subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'active' && !subscriber.unsubscribed) ||
                         (filterStatus === 'unsubscribed' && subscriber.unsubscribed);
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedSubscribers(filteredSubscribers.map(s => s.id));
    } else {
      setSelectedSubscribers([]);
    }
  };

  const handleSelectSubscriber = (id, checked) => {
    if (checked) {
      setSelectedSubscribers([...selectedSubscribers, id]);
    } else {
      setSelectedSubscribers(selectedSubscribers.filter(sid => sid !== id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedSubscribers.length === 0) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      if (action === 'delete') {
        if (window.confirm(`Are you sure you want to delete ${selectedSubscribers.length} subscribers?`)) {
          await Promise.all(
            selectedSubscribers.map(id => 
              axios.delete(`/api/subscribers/${id}`, { headers: { Authorization: `Bearer ${token}` } })
            )
          );
          await fetchSubscribers();
          setSelectedSubscribers([]);
        }
      }
    } catch (err) {
      console.error('Bulk action error:', err);
      alert('Error performing bulk action');
    }
  };

  const exportSubscribers = () => {
    const dataToExport = filteredSubscribers.map(sub => ({
      email: sub.email,
      name: sub.name || '',
      status: sub.unsubscribed ? 'unsubscribed' : 'active',
      subscribedDate: new Date(sub.createdAt).toLocaleDateString(),
      unsubscribedDate: sub.unsubscribed ? (sub.updatedAt !== sub.createdAt ? new Date(sub.updatedAt).toLocaleDateString() : '') : ''
    }));

    const csv = [
      ['Email', 'Name', 'Status', 'Subscribed Date', 'Unsubscribed Date'].join(','),
      ...dataToExport.map(row => [
        row.email,
        row.name,
        row.status,
        row.subscribedDate,
        row.unsubscribedDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart-hustle-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto bg-slate-800 rounded-xl p-8 border border-slate-700 mt-8">
      {/* Header with Stats */}
      <div className="mb-8">
        <h2 className="text-4xl font-extrabold text-white mb-6">Newsletter Subscribers</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
            <div className="text-2xl font-bold text-white">{stats.total || 0}</div>
            <div className="text-slate-400 text-sm">Total Subscribers</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
            <div className="text-2xl font-bold text-green-400">{stats.active || 0}</div>
            <div className="text-slate-400 text-sm">Active Subscribers</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
            <div className="text-2xl font-bold text-cyan-400">{stats.recent || 0}</div>
            <div className="text-slate-400 text-sm">Last 7 Days</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-600">
            <div className="text-2xl font-bold text-red-400">{stats.unsubscribed || 0}</div>
            <div className="text-slate-400 text-sm">Unsubscribed</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 pl-10 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
              </svg>
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="all">All Subscribers</option>
              <option value="active">Active Only</option>
              <option value="unsubscribed">Unsubscribed Only</option>
            </select>
          </div>

          <div className="flex gap-2">
            {/* Bulk Actions */}
            {selectedSubscribers.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                >
                  Delete Selected ({selectedSubscribers.length})
                </button>
              </div>
            )}
            
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"/>
              </svg>
              Export CSV
            </button>
            
            <button
              onClick={() => window.location.href='/admin/compose'}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Compose Email
            </button>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-slate-900 rounded-lg border border-slate-600 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3 text-slate-400 text-lg">
              <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Loading subscribers...
            </div>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            {searchTerm || filterStatus !== 'all' ? 'No subscribers match your search criteria.' : 'No subscribers found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-600">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.length === filteredSubscribers.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-slate-600 bg-slate-700 text-cyan-600 focus:ring-cyan-400"
                    />
                  </th>
                  <th className="p-4 text-left text-slate-300 font-semibold">Email</th>
                  <th className="p-4 text-left text-slate-300 font-semibold">Name</th>
                  <th className="p-4 text-left text-slate-300 font-semibold">Status</th>
                  <th className="p-4 text-left text-slate-300 font-semibold">Subscribed</th>
                  <th className="p-4 text-center text-slate-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscribers.map((subscriber, index) => (
                  <tr key={subscriber.id} className={`border-b border-slate-700 hover:bg-slate-800/50 ${index % 2 === 0 ? 'bg-slate-900/30' : ''}`}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedSubscribers.includes(subscriber.id)}
                        onChange={(e) => handleSelectSubscriber(subscriber.id, e.target.checked)}
                        className="rounded border-slate-600 bg-slate-700 text-cyan-600 focus:ring-cyan-400"
                      />
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{subscriber.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-300">{subscriber.name || '—'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        subscriber.unsubscribed
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {subscriber.unsubscribed ? 'Unsubscribed' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-300 text-sm">
                        {new Date(subscriber.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${subscriber.email}?`)) {
                            handleBulkAction('delete', [subscriber.id]);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete subscriber"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-600">
            <h3 className="text-xl font-bold text-white mb-4">Export Subscribers</h3>
            <p className="text-slate-300 mb-6">
              Export {filteredSubscribers.length} subscribers as CSV file.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={exportSubscribers}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
