import React, { useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Logo } from '../components/Logo.js';

interface AdminSetupPageProps {
  navigate: (path: string) => void;
}

export const AdminSetupPage: React.FC<AdminSetupPageProps> = ({ navigate }) => {
  const { login } = useAuth();
  const [setupKey, setSetupKey] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 12) {
      setError('Use a password with at least 12 characters.');
      return;
    }
    setBusy(true);
    try {
      await api.setupAdmin({ setupKey, name, email, password });
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Administrator setup failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-3">
          <Logo variant="full" />
          <h1 className="font-heading text-2xl font-bold text-[#421078]">Initial Administrator Setup</h1>
          <p className="text-xs text-slate-600">One-time setup for the private production dashboard. The setup key must match the ADMIN_SETUP_KEY configured on the server.</p>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">{error}</p>}
        <form onSubmit={submit} className="space-y-3">
          <input aria-label="Setup key" type="password" autoComplete="off" value={setupKey} onChange={(e) => setSetupKey(e.target.value)} placeholder="One-time setup key" required className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
          <input aria-label="Administrator name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required maxLength={100} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
          <input aria-label="Administrator email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" required maxLength={254} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
          <input aria-label="Administrator password" type="password" autoComplete="new-password" minLength={12} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (12+ characters)" required className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
          <button disabled={busy} className="w-full rounded-full bg-[#421078] text-white py-3 text-sm font-bold disabled:opacity-50">{busy ? 'Setting up…' : 'Create Administrator Account'}</button>
        </form>
        <button type="button" onClick={() => navigate('/login')} className="w-full text-xs font-semibold text-[#421078]">Back to login</button>
      </div>
    </div>
  );
};
