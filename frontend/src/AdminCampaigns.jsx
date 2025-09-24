import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    const token = localStorage.getItem('adminToken');
    setLoading(true);
    try {
      const response = await axios.get('/api/campaigns', 
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setCampaigns(response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to display recipients
  function getRecipientLabel(c) {
    if (!c.recipient) return 'All Subscribers';
    if (c.recipient === 'all') return 'All Subscribers';
    if (c.recipient.startsWith('course:')) return 'Course Students';
    return c.recipient;
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'sent' && campaign.sentAt) ||
      (filter === 'scheduled' && campaign.scheduledAt && !campaign.sentAt) ||
      (filter === 'draft' && !campaign.sentAt && !campaign.scheduledAt);
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const stats = {
    total: campaigns.length,
    sent: campaigns.filter(c => c.sentAt).length,
    scheduled: campaigns.filter(c => c.scheduledAt && !c.sentAt).length,
    totalSent: campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0),
    totalOpened: campaigns.reduce((sum, c) => sum + (c.openCount || 0), 0),
    avgOpenRate: campaigns.length > 0 
      ? Math.round((campaigns.reduce((sum, c) => sum + (c.openCount || 0), 0) / 
          Math.max(1, campaigns.reduce((sum, c) => sum + (c.sentCount || 0), 0))) * 100) 
      : 0
  };

  const deleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`/api/campaigns/${id}`, 
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 mt-8">
      {/* Header with Stats */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white">Email Campaigns</h1>
            <p className="text-slate-400 text-lg">Manage and analyze your email marketing campaigns</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Campaigns</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Emails Sent</p>
                <p className="text-2xl font-bold text-green-400">{stats.totalSent.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Avg Open Rate</p>
                <p className="text-2xl font-bold text-cyan-400">{stats.avgOpenRate}%</p>
              </div>
              <div className="w-12 h-12 bg-cyan-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Scheduled</p>
                <p className="text-2xl font-bold text-orange-400">{stats.scheduled}</p>
              </div>
              <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          <div className="flex gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
              </svg>
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
            >
              <option value="all">All Campaigns</option>
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          <button
            onClick={() => window.location.href = '/admin/compose'}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
            </svg>
            New Campaign
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-slate-400">
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Loading campaigns...
            </div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <p className="text-slate-400 text-lg">No campaigns found</p>
            <p className="text-slate-500 text-sm mt-2">
              {searchTerm ? `No campaigns match "${searchTerm}"` : 'Create your first email campaign to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Recipients</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Sent</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Opens</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredCampaigns.map((campaign) => {
                  const isScheduled = campaign.scheduledAt && !campaign.sentAt;
                  const isSent = campaign.sentAt;
                  const openRate = campaign.sentCount > 0 ? Math.round((campaign.openCount / campaign.sentCount) * 100) : 0;
                  
                  return (
                    <tr key={campaign.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div>
                            <p className="text-white font-medium">{campaign.subject || 'Untitled Campaign'}</p>
                            <p className="text-slate-400 text-sm line-clamp-2">{campaign.body?.replace(/<[^>]*>/g, '').substring(0, 100)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{getRecipientLabel(campaign)}</td>
                      <td className="px-6 py-4">
                        {isSent ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                            </svg>
                            Sent
                          </span>
                        ) : isScheduled ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
                            </svg>
                            Scheduled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                            </svg>
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-300">{campaign.sentCount?.toLocaleString() || 0}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300">{campaign.openCount || 0}</span>
                          {campaign.sentCount > 0 && (
                            <span className="text-xs text-slate-400">({openRate}%)</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {isSent ? (
                          <div>
                            <p className="text-sm">Sent {new Date(campaign.sentAt).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-500">{new Date(campaign.sentAt).toLocaleTimeString()}</p>
                          </div>
                        ) : isScheduled ? (
                          <div>
                            <p className="text-sm">Scheduled {new Date(campaign.scheduledAt).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-500">{new Date(campaign.scheduledAt).toLocaleTimeString()}</p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm">Created {new Date(campaign.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs text-slate-500">{new Date(campaign.createdAt).toLocaleTimeString()}</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setShowDetails(true);
                            }}
                            className="text-cyan-400 hover:text-cyan-300 transition-colors"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"/>
                            </svg>
                          </button>
                          
                          {!isSent && (
                            <button
                              onClick={() => deleteCampaign(campaign.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete Campaign"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign Details Modal */}
      {showDetails && selectedCampaign && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] border border-slate-700 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Campaign Details</h2>
              </div>
              <button
                className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-colors duration-200"
                onClick={() => setShowDetails(false)}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Campaign Information</h3>
                    <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Subject:</span>
                        <span className="text-white font-medium">{selectedCampaign.subject}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Recipients:</span>
                        <span className="text-white">{getRecipientLabel(selectedCampaign)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Created:</span>
                        <span className="text-white">{new Date(selectedCampaign.createdAt).toLocaleString()}</span>
                      </div>
                      {selectedCampaign.scheduledAt && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Scheduled:</span>
                          <span className="text-orange-400">{new Date(selectedCampaign.scheduledAt).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedCampaign.sentAt && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Sent:</span>
                          <span className="text-green-400">{new Date(selectedCampaign.sentAt).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Performance Metrics</h3>
                    <div className="bg-slate-900/50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Emails Sent:</span>
                        <span className="text-green-400 font-semibold">{selectedCampaign.sentCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Emails Opened:</span>
                        <span className="text-cyan-400 font-semibold">{selectedCampaign.openCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Failed Sends:</span>
                        <span className="text-red-400 font-semibold">{selectedCampaign.failCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Open Rate:</span>
                        <span className="text-white font-semibold">
                          {selectedCampaign.sentCount > 0 
                            ? Math.round((selectedCampaign.openCount / selectedCampaign.sentCount) * 100) 
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Email Content</h3>
                <div className="bg-white rounded-lg p-6 border">
                  <div 
                    className="prose max-w-none text-gray-800"
                    dangerouslySetInnerHTML={{ __html: selectedCampaign.body || 'No content available' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
