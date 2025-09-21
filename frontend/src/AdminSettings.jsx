
import React, { useEffect, useState } from 'react';
import axios from 'axios';


export default function AdminSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email settings state
  const [emailSettings, setEmailSettings] = useState({
    from_email: '',
    from_name: '',
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
  });
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState('');


  useEffect(() => {
    fetchSettings();
  }, []);


  const fetchSettings = () => {
    setLoading(true);
    axios.get('/api/settings', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      .then(res => {
        setSettings(res.data);
        // Pre-fill email settings fields if present
        const get = key => (res.data.find(s => s.key === key)?.value || '');
        setEmailSettings({
          from_email: get('from_email'),
          from_name: get('from_name'),
          smtp_host: get('smtp_host'),
          smtp_port: get('smtp_port'),
          smtp_user: get('smtp_user'),
          smtp_pass: get('smtp_pass'),
        });
      })
      .catch(() => setSettings([]))
      .finally(() => setLoading(false));
  };
  // Save email settings
  const handleEmailSettingsSave = async (e) => {
    e.preventDefault();
    setTestResult('');
    setError('');
    setSuccess('');
    try {
      // Save each field as a setting
      await Promise.all(Object.entries(emailSettings).map(([key, value]) =>
        axios.post('/api/settings', { key, value }, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      ));
      setSuccess('Email settings saved!');
      fetchSettings();
    } catch {
      setError('Failed to save email settings.');
    }
  };

  // Send test email
  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    setTestResult('');
    setError('');
    setSuccess('');
    if (!testEmail) return setTestResult('Enter a test email address.');
    try {
      const res = await axios.post('/api/settings/test-email', { to: testEmail }, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      setTestResult(res.data.success ? 'Test email sent!' : (res.data.error || 'Failed to send test email.'));
    } catch (err) {
      // Show backend error if available
      const msg = err?.response?.data?.error || err?.message || 'Failed to send test email.';
      setTestResult(msg);
    }
  };

  const handleEdit = (key, value) => {
    setEditingKey(key);
    setEditValue(value);
    setError('');
    setSuccess('');
  };

  const handleEditSave = async (key) => {
    try {
      await axios.post('/api/settings', { key, value: editValue }, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      setEditingKey(null);
      setEditValue('');
      setSuccess('Setting updated!');
      fetchSettings();
    } catch {
      setError('Failed to update setting.');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newKey.trim()) return setError('Key required');
    try {
      await axios.post('/api/settings', { key: newKey, value: newValue }, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      setNewKey('');
      setNewValue('');
      setSuccess('Setting added!');
      fetchSettings();
    } catch {
      setError('Failed to add setting.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-[#12192b] rounded-xl p-10 border border-slate-800 mt-8 min-h-[400px]">
      <h1 className="text-4xl font-extrabold text-white mb-8">Site Settings</h1>

      {/* Email Settings Section */}
      <div className="mb-12 bg-[#1a2236] rounded-2xl p-8 border border-slate-700">
        <h2 className="text-2xl font-bold text-cyan-400 mb-6">Email Settings</h2>
        <form onSubmit={handleEmailSettingsSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 mb-2">Sender Email Address</label>
            <input type="email" className="w-full p-3 rounded bg-slate-800 text-white" value={emailSettings.from_email} onChange={e => setEmailSettings(v => ({ ...v, from_email: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Sender Name</label>
            <input type="text" className="w-full p-3 rounded bg-slate-800 text-white" value={emailSettings.from_name} onChange={e => setEmailSettings(v => ({ ...v, from_name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">SMTP Host</label>
            <input type="text" className="w-full p-3 rounded bg-slate-800 text-white" value={emailSettings.smtp_host} onChange={e => setEmailSettings(v => ({ ...v, smtp_host: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">SMTP Port</label>
            <input type="number" className="w-full p-3 rounded bg-slate-800 text-white" value={emailSettings.smtp_port} onChange={e => setEmailSettings(v => ({ ...v, smtp_port: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">SMTP Username</label>
            <input type="text" className="w-full p-3 rounded bg-slate-800 text-white" value={emailSettings.smtp_user} onChange={e => setEmailSettings(v => ({ ...v, smtp_user: e.target.value }))} />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">SMTP Password</label>
            <input type="password" className="w-full p-3 rounded bg-slate-800 text-white" value={emailSettings.smtp_pass} onChange={e => setEmailSettings(v => ({ ...v, smtp_pass: e.target.value }))} />
          </div>
          <div className="md:col-span-2 flex gap-4 mt-2">
            <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg text-lg">Save Email Settings</button>
          </div>
        </form>
        <form onSubmit={handleSendTestEmail} className="mt-8 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-slate-300 mb-2">Send Test Email To</label>
            <input type="email" className="w-full p-3 rounded bg-slate-800 text-white" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg text-lg">Send Test Email</button>
        </form>
        {testResult && <div className="mt-4 text-cyan-300">{testResult}</div>}
      </div>

      {/* Add Setting Form */}
      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 mb-10">
        <input
          type="text"
          value={newKey}
          onChange={e => setNewKey(e.target.value)}
          placeholder="Setting key (e.g. hero_title, contact_email)"
          className="flex-1 p-4 rounded bg-slate-800 text-white text-lg"
        />
        <input
          type="text"
          value={newValue}
          onChange={e => setNewValue(e.target.value)}
          placeholder="Value"
          className="flex-1 p-4 rounded bg-slate-800 text-white text-lg"
        />
        <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-8 rounded-lg text-lg">Add Setting</button>
      </form>
      {error && <div className="text-rose-400 mb-4">{error}</div>}
      {success && <div className="text-emerald-400 mb-4">{success}</div>}

      {/* Settings Table */}
      <div className="rounded-2xl overflow-hidden border border-slate-700 bg-[#1a2236]">
        <div className="grid grid-cols-12 gap-0 bg-slate-800 text-slate-300 text-lg font-semibold px-8 py-4">
          <div className="col-span-4">KEY</div>
          <div className="col-span-6">VALUE</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : settings.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No settings found.</div>
        ) : (
          settings.map(s => (
            <div key={s.key} className="grid grid-cols-12 gap-0 px-8 py-5 border-b border-slate-700 last:border-b-0 items-center text-white text-lg">
              <div className="col-span-4 font-mono">{s.key}</div>
              <div className="col-span-6">
                {editingKey === s.key ? (
                  <input
                    type="text"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="w-full p-2 rounded bg-slate-800 text-white border border-slate-700"
                  />
                ) : (
                  <span>{s.value}</span>
                )}
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                {editingKey === s.key ? (
                  <>
                    <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1 px-4 rounded-lg" onClick={() => handleEditSave(s.key)}>Save</button>
                    <button className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-1 px-4 rounded-lg" onClick={() => setEditingKey(null)}>Cancel</button>
                  </>
                ) : (
                  <button className="text-cyan-400 hover:text-cyan-600" onClick={() => handleEdit(s.key, s.value)}>Edit</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
