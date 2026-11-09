/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '../lib/api.js';
import type { Order, StatusHistory, OrderMessage } from '../types.js';
import {
  Compass,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface OrderTrackingPageProps {
  navigate: (path: string) => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ navigate }) => {
  const [reference, setReference] = useState('M4UM-2026-1042');
  const [email, setEmail] = useState('sarah.jenkins@example.com');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [trackedOrder, setTrackedOrder] = useState<Partial<Order> | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [publicUpdates, setPublicUpdates] = useState<OrderMessage[]>([]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !email.trim()) {
      setError('Please provide both your order reference and the email address used during order.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.trackOrder(reference.trim(), email.trim());
      setTrackedOrder(res.order);
      setHistory(res.history);
      setPublicUpdates(res.publicUpdates);
    } catch (err: any) {
      setError(err.message || 'No order found matching that reference and email.');
      setTrackedOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Delivered':
      case 'Completed':
      case 'Ready for Delivery':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Song in Production':
      case 'Quality Check':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'Awaiting Customer Lyric Approval':
        return 'bg-pink-100 text-pink-800 border-pink-200 animate-pulse';
      case 'Lyrics Approved':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Writing Lyrics':
      case 'Reviewing Order':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 text-[#00708A] text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-[#08BFE8]" />
          Direct Order Tracker
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#421078]">
          Track Your Song's Journey
        </h1>
        <p className="text-slate-600 text-sm max-w-lg mx-auto">
          Enter your unique order reference and email address below to view the latest production updates, review status, and delivery milestones.
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-700">Order Reference</label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. M4UM-2026-1042"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078] text-sm"
              required
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-slate-700">Customer Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. sarah.jenkins@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078] text-sm"
              required
            />
          </div>

          <div className="sm:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold uppercase tracking-wider bg-[#421078] hover:bg-purple-900 transition-colors shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 h-[42px]"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Track</span>
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Tracking Results */}
      {trackedOrder && (
        <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-10 shadow-md space-y-8 animate-fade-in">
          {/* Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-2xl font-bold text-[#421078]">
                  {trackedOrder.reference}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(
                    trackedOrder.status
                  )}`}
                >
                  {trackedOrder.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Created for <strong>{trackedOrder.recipientName}</strong> · {trackedOrder.occasion} · {trackedOrder.packageName}
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow transition-all self-start sm:self-auto flex items-center gap-1.5"
              style={{
                background: 'linear-gradient(135deg, #421078 0%, #F51B91 100%)',
              }}
            >
              <span>Open Customer Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Status Highlights */}
          {trackedOrder.status === 'Awaiting Customer Lyric Approval' && (
            <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#F51B91] shrink-0 mt-0.5" />
              <div className="text-xs text-pink-950 space-y-1">
                <p className="font-bold text-sm">Action Needed: Lyrics Ready for Your Approval!</p>
                <p>
                  Your lyric draft is ready. Please log into the customer dashboard to approve the lyrics or request revisions before audio production begins.
                </p>
              </div>
            </div>
          )}

          {trackedOrder.status === 'Ready for Delivery' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 space-y-1">
                <p className="font-bold text-sm">Your Song Is Ready For Download!</p>
                <p>
                  Audio mastering and artwork generation are complete. Log into your dashboard to listen and download your finished files.
                </p>
              </div>
            </div>
          )}

          {/* Production Status History */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Production Timeline & Milestones</h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-purple-100">
              {history.map((h, idx) => (
                <div key={h.id || idx} className="relative">
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#421078] border-2 border-white shadow-xs"></div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{h.newStatus}</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(h.createdAt).toLocaleDateString('en-NZ', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {h.note && <p className="text-slate-600">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Public Updates from Songwriters */}
          {publicUpdates.length > 0 && (
            <div className="pt-6 border-t border-slate-100 space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Notes from the Production Studio</h3>
              <div className="space-y-2">
                {publicUpdates.map((m) => (
                  <div key={m.id} className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100/60 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-500 text-[10px]">
                      <span className="font-bold text-[#421078]">{m.senderName}</span>
                      <span>{new Date(m.createdAt).toLocaleDateString('en-NZ')}</span>
                    </div>
                    <p className="text-slate-700">{m.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
