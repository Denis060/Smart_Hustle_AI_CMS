import { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usernameOrEmail, password })
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error('Server error: Invalid response');
      }
      if (!res.ok) throw new Error(data.error || data.message || 'Login failed');
      localStorage.setItem('adminToken', data.token);
      onLogin();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg shadow max-w-sm w-full flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-center mb-2 text-cyan-400">Admin Login</h2>
        <input
          type="text"
          placeholder="Username or Email"
          value={usernameOrEmail}
          onChange={e => setUsernameOrEmail(e.target.value)}
          className="rounded bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="rounded bg-slate-700 px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          required
        />
        <button
          type="submit"
          className="rounded bg-cyan-500 px-6 py-2 font-bold text-slate-900 hover:bg-cyan-400 transition"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <div className="text-rose-400 text-center text-sm">{error}</div>}
      </form>
    </div>
  );
}
