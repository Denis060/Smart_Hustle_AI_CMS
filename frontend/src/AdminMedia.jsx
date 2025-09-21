import React, { useState, useEffect, useRef } from 'react';
const BACKEND_URL = 'http://localhost:5000'; // Changed to match backend port
import axios from 'axios';

export default function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [altText, setAltText] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/media', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      setMedia(res.data);
    } catch (err) {
      setError('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', altText);
    try {
      await axios.post('/api/media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setFile(null);
      setAltText('');
      fileInputRef.current.value = '';
      fetchMedia();
    } catch {
      setError('Failed to upload media');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media item?')) return;
    try {
      await axios.delete(`/api/media/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      fetchMedia();
    } catch {
      setError('Failed to delete media');
    }
  };

  return (
  <div className="max-w-6xl mx-auto bg-[#12192b] rounded-xl p-8 border border-slate-800 mt-8 min-h-[400px]">
  <h1 className="text-4xl font-extrabold text-white mb-8">Manage Media</h1>
      <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-2 mb-6 items-center">
        <input
          type="file"
          accept="image/*"
          onChange={e => setFile(e.target.files[0])}
          ref={fileInputRef}
          className="flex-1 p-2 rounded bg-slate-800 text-white"
        />
        <input
          type="text"
          value={altText}
          onChange={e => setAltText(e.target.value)}
          placeholder="Alt text (optional)"
          className="flex-1 p-2 rounded bg-slate-800 text-white"
        />
        <button type="submit" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg">Upload</button>
      </form>
      {error && <div className="text-rose-400 mb-4">{error}</div>}
      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : media.length === 0 ? (
        <div className="text-slate-400">No media found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {media.map(m => (
            <div key={m.id} className="bg-slate-800 rounded-lg p-3 flex flex-col items-center border border-slate-700">
              <img src={`${BACKEND_URL}${m.url}`} alt={m.altText || ''} className="w-full h-32 object-cover rounded mb-2" />
              <div className="text-xs text-slate-300 truncate w-full mb-1">{m.url}</div>
              {m.altText && <div className="text-xs text-slate-400 mb-1">Alt: {m.altText}</div>}
              <div className="text-xs text-slate-500 mb-2">{m.createdAt ? m.createdAt.slice(0, 10) : ''}</div>
              <div className="text-xs text-cyan-400 mb-2">Uploaded by Ibrahim Denis Fofanah</div>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${BACKEND_URL}${m.url}`);
                  }}
                  className="text-cyan-400 hover:text-cyan-600 text-xs border border-cyan-400 rounded px-2 py-1"
                >Copy Link</button>
                <button
                  onClick={() => alert('Edit functionality coming soon!')}
                  className="text-yellow-400 hover:text-yellow-600 text-xs border border-yellow-400 rounded px-2 py-1"
                >Edit</button>
              </div>
              <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-600 text-xs">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
