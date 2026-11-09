/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { Logo } from '../components/Logo.js';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';

interface LoginPageProps {
  navigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate }) => {
  const { login, connectGoogle, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminMsg, setAdminMsg] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  const handleAdminSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey || !adminEmail || !adminPassword || !adminName) return;
    setAdminLoading(true);
    setAdminMsg(null);
    try {
      const res = await api.setupAdmin({
        setupKey: adminKey,
        name: adminName,
        email: adminEmail,
        password: adminPassword,
      });
      setAdminMsg(res.message);
      setEmail(adminEmail);
      setPassword(adminPassword);
      setTimeout(() => {
        setShowAdminModal(false);
      }, 1500);
    } catch (err: any) {
      setAdminMsg(err.message || 'Admin provisioning failed. Please verify the setup key.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both your email and password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await connectGoogle();
    } catch (err: any) {
      setError(err.message || 'Google Sign-In failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 pb-24 space-y-8">
      <div className="text-center space-y-3">
        <div onClick={() => navigate('/')} className="cursor-pointer inline-block">
          <Logo variant="full" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-[#421078]">Customer Login</h1>
        <p className="text-xs text-slate-600">
          Sign into your customer account to review your lyrics, approve drafts, and download your finished songs.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-sm space-y-6">
        {/* Secure Admin Provisioning Link */}
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
          <span>Official Customer Portal</span>
          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="text-purple-700 hover:text-purple-900 font-semibold hover:underline flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Setup</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.jenkins@example.com"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#421078]"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-[11px] text-[#F51B91] hover:underline font-semibold"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#421078]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider bg-[#421078] hover:bg-purple-900 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="relative border-t border-slate-100 my-4">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] uppercase font-bold text-slate-400">
            or
          </span>
        </div>

        {/* Google Workspace / Gmail Button styled according to skill specification */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-xs font-bold text-slate-700 shadow-xs"
        >
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
          </svg>
          <span>Connect Google / Gmail</span>
        </button>

        <div className="text-center pt-2 text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[#421078] font-bold hover:underline"
          >
            Register Here
          </button>
        </div>
      </div>

      {/* Admin Setup Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-purple-200 p-6 max-w-sm w-full space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-[#421078] font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-[#F51B91]" />
                <span>Secure Admin Provisioning</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600 text-[11px] leading-relaxed">
              To provision an administrative producer account, you must enter the server environment master key.
            </p>

            {adminMsg && (
              <div className="p-3 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-[11px]">
                {adminMsg}
              </div>
            )}

            <form onSubmit={handleAdminSetupSubmit} className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Server Setup Key</label>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="Master setup key"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#421078] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Producer Full Name</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Senior Studio Producer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#421078] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="producer@madeforyoumusic.co.nz"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#421078] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Admin Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#421078] focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={adminLoading}
                className="w-full py-2.5 rounded-full text-white font-bold bg-[#421078] hover:bg-purple-900 transition-colors shadow-xs disabled:opacity-50"
              >
                {adminLoading ? 'Verifying & Provisioning...' : 'Provision Administrator'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
