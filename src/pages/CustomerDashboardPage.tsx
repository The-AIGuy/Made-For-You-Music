/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import type {
  Order,
  LyricVersion,
  OrderFile,
  OrderMessage,
  StatusHistory,
  RevisionRequest,
} from '../types.js';
import confetti from 'canvas-confetti';
import {
  Music,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Play,
  Pause,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  User as UserIcon,
  MessageSquare,
  Lock,
  Share2,
  Calendar,
  Gift,
} from 'lucide-react';

interface CustomerDashboardPageProps {
  navigate: (path: string) => void;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({ navigate }) => {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'account'>('orders');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected Order Detail State
  const [orderDetail, setOrderDetail] = useState<{
    order: Order;
    history: StatusHistory[];
    messages: OrderMessage[];
    lyrics: LyricVersion[];
    revisions: RevisionRequest[];
    files: OrderFile[];
  } | null>(null);

  // Lyric revision form
  const [revisionFeedback, setRevisionFeedback] = useState('');
  const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);
  const [revisionSuccess, setRevisionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Audio player
  const [playingFileId, setPlayingFileId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Account settings form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [accountStatus, setAccountStatus] = useState<string | null>(null);

  // Load customer orders
  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOrders();
      setOrders(res.orders);
      if (res.orders.length > 0 && !selectedOrderId) {
        setSelectedOrderId(res.orders[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Load selected order details
  useEffect(() => {
    if (selectedOrderId) {
      api.getOrderById(selectedOrderId).then((res) => {
        setOrderDetail(res);
        setActionError(null);
        setRevisionSuccess(null);
      }).catch((err) => {
        setActionError(err.message);
      });
    }
  }, [selectedOrderId]);

  // Audio playback handler
  const handleTogglePlay = (file: OrderFile) => {
    if (playingFileId === file.id) {
      audioElement?.pause();
      setPlayingFileId(null);
    } else {
      audioElement?.pause();
      // Use sample audio stream for immediate browser audition
      const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=acoustic-guitars-ambient-112349.mp3');
      audio.play().catch(() => {});
      audio.onended = () => setPlayingFileId(null);
      setAudioElement(audio);
      setPlayingFileId(file.id);
    }
  };

  useEffect(() => {
    return () => {
      audioElement?.pause();
    };
  }, [audioElement]);

  // Approve lyrics action
  const handleApproveLyrics = async (versionId: string) => {
    if (!selectedOrderId) return;
    setActionError(null);
    try {
      const res = await api.approveLyrics(selectedOrderId, versionId);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#421078', '#F51B91', '#08BFE8'],
      });
      // Refresh order details and order list
      const updated = await api.getOrderById(selectedOrderId);
      setOrderDetail(updated);
      loadOrders();
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve lyrics.');
    }
  };

  // Request lyric revision action
  const handleRequestRevision = async (versionId: string) => {
    if (!selectedOrderId || !revisionFeedback.trim()) {
      setActionError('Please write your revision notes before submitting.');
      return;
    }
    setIsSubmittingRevision(true);
    setActionError(null);
    setRevisionSuccess(null);
    try {
      const res = await api.requestLyricRevision(selectedOrderId, versionId, revisionFeedback);
      setRevisionSuccess(res.message);
      setRevisionFeedback('');
      const updated = await api.getOrderById(selectedOrderId);
      setOrderDetail(updated);
      loadOrders();
    } catch (err: any) {
      setActionError(err.message || 'Failed to submit revision request.');
    } finally {
      setIsSubmittingRevision(false);
    }
  };

  // Save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountStatus(null);
    try {
      const res = await api.updateProfile({ name, phone });
      updateUser(res.user);
      setAccountStatus('Account profile details updated successfully.');
    } catch (err: any) {
      setAccountStatus(`Error: ${err.message}`);
    }
  };

  // Update password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountStatus(null);
    try {
      await api.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setAccountStatus('Password changed successfully.');
    } catch (err: any) {
      setAccountStatus(`Error: ${err.message}`);
    }
  };

  const currentOrder = orderDetail?.order;
  const latestLyric = orderDetail?.lyrics[orderDetail.lyrics.length - 1];

  // Calculate remaining revisions based on package
  const maxRevisions = currentOrder?.packageId === 'personal' ? 1 : 2;
  const usedRevisions = orderDetail?.revisions.length || 0;
  const remainingRevisions = Math.max(0, maxRevisions - usedRevisions);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-purple-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#421078] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#F51B91]" />
            Customer Portal
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#421078]">
            Kia Ora, {user?.name || 'Valued Customer'}!
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Track your song's creative production, review and approve your lyrics, and stream or download finished deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/create')}
            className="px-5 py-2.5 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            style={{
              background: 'linear-gradient(135deg, #421078 0%, #F51B91 100%)',
            }}
          >
            <Music className="w-4 h-4" />
            <span>Create Another Song</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-[#421078] text-[#421078]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>My Song Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('account')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'account'
              ? 'border-[#421078] text-[#421078]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Account Settings</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ORDERS & WORKFLOW */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order List Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Your Orders</h3>
            {isLoading ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-purple-100 text-xs text-slate-400">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-purple-100 space-y-3">
                <Music className="w-8 h-8 text-purple-300 mx-auto" />
                <p className="font-bold text-xs text-slate-700">No Orders Placed Yet</p>
                <button
                  onClick={() => navigate('/create')}
                  className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#421078]"
                >
                  Create Your First Song
                </button>
              </div>
            ) : (
              orders.map((o) => {
                const isSelected = o.id === selectedOrderId;
                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedOrderId(o.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                      isSelected
                        ? 'border-[#421078] bg-purple-50/60 shadow-sm ring-1 ring-[#421078]/20'
                        : 'border-slate-200 bg-white hover:border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-bold text-sm text-[#421078]">{o.reference}</span>
                      <span className="text-xs font-bold text-slate-900">${o.price.toFixed(2)} NZD</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">For {o.recipientName}</p>
                      <p className="text-[11px] text-slate-500">{o.packageName} · {o.occasion}</p>
                    </div>
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-white border border-slate-200 text-slate-700">
                        {o.status}
                      </span>
                      <span className="text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString('en-NZ', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Selected Order Detail Main Panel */}
          <div className="lg:col-span-8 space-y-6">
            {!orderDetail ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-purple-100 text-xs text-slate-400">
                Select an order from the list to view its lyrics and status.
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-purple-100 p-6 sm:p-8 shadow-sm space-y-8">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-100 pb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-2xl font-bold text-[#421078]">
                        {currentOrder?.reference}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-[#421078]">
                        {currentOrder?.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Recipient: <strong>{currentOrder?.recipientName}</strong> ({currentOrder?.relationship}) · {currentOrder?.packageName}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total Price</span>
                    <span className="font-heading text-xl font-bold text-slate-900">${currentOrder?.price.toFixed(2)} NZD</span>
                  </div>
                </div>

                {/* Error or Success notification */}
                {actionError && (
                  <div className="p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}
                {revisionSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{revisionSuccess}</span>
                  </div>
                )}

                {/* =================================================== */}
                {/* 1. LYRICS REVIEW & APPROVAL SECTION */}
                {/* =================================================== */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50/50 via-white to-pink-50/30 border border-purple-200 space-y-6">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#F51B91]" />
                      <h3 className="font-heading font-bold text-lg text-[#421078]">
                        Personalised Lyrics Review
                      </h3>
                    </div>
                    {latestLyric && (
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        latestLyric.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : latestLyric.status === 'shared'
                          ? 'bg-pink-100 text-[#F51B91] animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        Version {latestLyric.versionNumber} · {latestLyric.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {!latestLyric ? (
                    <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                      <Clock className="w-6 h-6 text-purple-300 mx-auto" />
                      <p className="font-bold text-slate-800">Our Songwriters Are Drafting Your Lyrics</p>
                      <p>You will receive a notification as soon as Version 1 is ready for your review.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-heading font-bold text-base text-slate-900">{latestLyric.title}</h4>
                        <span className="text-[11px] text-slate-400">
                          Drafted by {latestLyric.createdBy} · {new Date(latestLyric.createdAt).toLocaleDateString('en-NZ')}
                        </span>
                      </div>

                      {/* Lyric Box */}
                      <div className="p-6 rounded-2xl bg-white border border-purple-100 font-sans text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed shadow-xs max-h-96 overflow-y-auto">
                        {latestLyric.content}
                      </div>

                      {/* Approval or Revision controls */}
                      {latestLyric.status === 'approved' ? (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold">Lyrics Approved by You!</p>
                            <p className="text-[11px] text-emerald-700">
                              Approved on {new Date(latestLyric.approvedAt || '').toLocaleDateString('en-NZ')}. Audio production is in progress.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 pt-2">
                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <button
                              onClick={() => handleApproveLyrics(latestLyric.id)}
                              className="w-full sm:w-auto px-6 py-3 rounded-full text-white text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve Lyrics (Begin Production)</span>
                            </button>
                            <span className="text-xs text-slate-500">
                              Remaining revisions: <strong>{remainingRevisions} round(s)</strong>
                            </span>
                          </div>

                          {/* Request Revisions Form */}
                          {remainingRevisions > 0 ? (
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                              <label className="text-xs font-bold text-slate-800 block">
                                Need adjustments? Request a lyric revision:
                              </label>
                              <textarea
                                rows={3}
                                value={revisionFeedback}
                                onChange={(e) => setRevisionFeedback(e.target.value)}
                                placeholder="e.g. Please change line 3 to mention the red kayak at Lake Wanaka, and emphasize their laughter..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#421078]"
                              />
                              <button
                                onClick={() => handleRequestRevision(latestLyric.id)}
                                disabled={isSubmittingRevision || !revisionFeedback.trim()}
                                className="px-4 py-2 rounded-full text-xs font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 transition-colors"
                              >
                                {isSubmittingRevision ? 'Submitting...' : `Submit Revision Request (Round ${usedRevisions + 1} of ${maxRevisions})`}
                              </button>
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200">
                              You have used all {maxRevisions} included round(s) of lyric changes for this package. If you need further revisions, please contact support.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* =================================================== */}
                {/* 2. DIGITAL DELIVERABLES & DOWNLOADS */}
                {/* =================================================== */}
                <div className="p-6 rounded-2xl bg-white border border-purple-100 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-[#08BFE8]" />
                      <h3 className="font-heading font-bold text-lg text-slate-900">
                        Finished Digital Deliverables
                      </h3>
                    </div>
                  </div>

                  {!['Ready for Delivery', 'Delivered', 'Completed'].includes(currentOrder?.status || '') ? (
                    <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                      <Clock className="w-6 h-6 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-800">Deliverables In Production</p>
                      <p>
                        Your finished MP3 download, digital cover artwork, and printable lyrics sheet will become available here once sound mastering and quality check are complete.
                      </p>
                    </div>
                  ) : orderDetail.files.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      No files uploaded yet. Our team is finalizing your download links.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orderDetail.files.map((file) => {
                        const isAudio = file.fileType === 'mp3' || file.fileType === 'wav';
                        const isPlaying = playingFileId === file.id;

                        return (
                          <div
                            key={file.id}
                            className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3">
                              {isAudio ? (
                                <button
                                  onClick={() => handleTogglePlay(file)}
                                  className="w-10 h-10 rounded-full bg-[#421078] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shrink-0"
                                  aria-label={isPlaying ? 'Pause' : 'Play'}
                                >
                                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                </button>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#08BFE8]/20 text-[#00708A] flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-xs sm:text-sm text-slate-900">{file.fileName}</p>
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider">
                                  {file.fileType.replace('_', ' ')} · {(file.fileSize / 1024 / 1024).toFixed(1)} MB · Version {file.version}
                                </span>
                              </div>
                            </div>

                            <a
                              href={`/api/files/download/${file.id}`}
                              download={file.fileName}
                              className="px-4 py-2 rounded-full text-xs font-bold text-white bg-[#421078] hover:bg-purple-900 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Studio messages & updates */}
                {orderDetail.messages.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      Messages From Songwriters
                    </h4>
                    <div className="space-y-2">
                      {orderDetail.messages.map((m) => (
                        <div key={m.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
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
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: ACCOUNT SETTINGS */}
      {/* ======================================================== */}
      {activeTab === 'account' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-purple-100 p-6 sm:p-10 shadow-sm space-y-8">
          <div className="space-y-1">
            <h2 className="font-heading text-2xl font-bold text-[#421078]">Account Details</h2>
            <p className="text-xs text-slate-600">Update your customer contact information or change your account password.</p>
          </div>

          {accountStatus && (
            <div className="p-3.5 rounded-xl bg-purple-50 text-[#421078] border border-purple-200 text-xs">
              {accountStatus}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full text-white text-xs font-bold bg-[#421078] hover:bg-purple-900 transition-colors"
            >
              Save Profile Changes
            </button>
          </form>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="space-y-4 pt-6 border-t border-slate-100">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Change Password</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">New Password (min 8 chars)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full text-slate-800 text-xs font-bold border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
