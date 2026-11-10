/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '../lib/api.js';
import { Logo } from '../components/Logo.js';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface ForgotPasswordPageProps {
  navigate: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ navigate }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setStatus(null);
    setError(null);

    try {
      const res = await api.resetPasswordRequest(email);
      setStatus(res.message);
      setStep('reset');
    } catch (err: any) {
      setError(err.message || 'Unable to request password reset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !code || !newPassword) return;

    setIsLoading(true);
    setStatus(null);
    setError(null);

    try {
      const res = await api.resetPassword({
        email,
        token: code.trim(),
        newPassword,
      });
      setStatus(res.message);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your token or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 pb-24 space-y-8">
      <div className="text-center space-y-3">
        <div onClick={() => navigate('/')} className="cursor-pointer inline-block">
          <Logo variant="full" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-[#421078]">
          {step === 'request' ? 'Reset Password' : 'Set New Password'}
        </h1>
        <p className="text-xs text-slate-600">
          {step === 'request'
            ? 'Enter your account email to receive a secure 8-digit recovery code.'
            : 'Enter the 8-digit code sent to your email and your new password.'}
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-purple-100 p-8 shadow-sm space-y-6">
        {status && (
          <div className="p-4 rounded-2xl bg-purple-50 text-[#421078] border border-purple-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#F51B91] shrink-0" />
            <span>{status}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 'request' ? (
          <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Account Email Address</label>
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider bg-[#421078] hover:bg-purple-900 transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Sending Instructions...' : 'Email Me a Reset Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">8-Digit Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="12345678"
                maxLength={8}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-center tracking-widest font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#421078]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">New Password (min 12 characters)</label>
              <input
                type="password"
                minLength={12}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#421078]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider bg-[#421078] hover:bg-purple-900 transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? 'Updating Password...' : 'Save New Password'}
            </button>

            <button
              type="button"
              onClick={() => setStep('request')}
              className="w-full text-center text-[11px] text-slate-500 hover:text-slate-700"
            >
              Didn't get a code? Resend request
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <button
            onClick={() => navigate('/login')}
            className="text-xs font-bold text-slate-600 hover:text-[#421078] flex items-center justify-center gap-1.5 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};
