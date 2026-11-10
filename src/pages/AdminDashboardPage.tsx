/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';
import { sendGmailEmail, createLyricsReadyHtml, createSongDeliveredHtml } from '../lib/gmail.js';
import type {
  User,
  Order,
  OrderStatus,
  OrderFile,
  LyricVersion,
  Enquiry,
  SongLibraryItem,
  BusinessSettings,
  AuditLogEntry,
  OrderMessage,
} from '../types.js';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Music2,
  Inbox,
  BarChart3,
  Bell,
  Settings,
  FileCheck2,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Send,
  Eye,
  EyeOff,
  DollarSign,
  Clock,
  Sparkles,
  Lock,
  Mail,
  ChevronRight,
  RefreshCw,
  UserPlus,
  Shield,
} from 'lucide-react';

interface AdminDashboardPageProps {
  navigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const { user, isGmailConnected, connectGmail } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'team' | 'customers' | 'library' | 'enquiries' | 'analytics' | 'notifications' | 'settings' | 'audit'
  >('overview');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [packageFilter, setPackageFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Order Details Modal / View
  const [orderDetails, setOrderDetails] = useState<{
    lyrics: LyricVersion[];
    files: OrderFile[];
    messages: OrderMessage[];
  } | null>(null);

  // Lyric editor state
  const [lyricTitle, setLyricTitle] = useState('');
  const [lyricContent, setLyricContent] = useState('');
  const [lyricNotes, setLyricNotes] = useState('');
  const [isSavingLyric, setIsSavingLyric] = useState(false);

  // Status update state
  const [newStatus, setNewStatus] = useState<OrderStatus>('Writing Lyrics');
  const [statusNote, setStatusNote] = useState('');

  // Internal message / Customer update state
  const [messageText, setMessageText] = useState('');
  const [isInternalMessage, setIsInternalMessage] = useState(true);

  // File upload state
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileType, setUploadFileType] = useState<OrderFile['fileType']>('mp3');
  const [uploadFileUrl, setUploadFileUrl] = useState('');
  const [uploadCustomerVisible, setUploadCustomerVisible] = useState(true);

  // Analytics & auxiliary states
  const [analytics, setAnalytics] = useState<any>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [songLibrary, setSongLibrary] = useState<SongLibraryItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);

  // Add Team Collaborator state
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'customer'>('admin');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongGenre, setNewSongGenre] = useState('Pop');
  const [newSongMood, setNewSongMood] = useState('Romantic');
  const [newSongAudio, setNewSongAudio] = useState('');
  const [newSongLyrics, setNewSongLyrics] = useState('');
  const [newSongPublic, setNewSongPublic] = useState(true);

  // Gmail modal confirmation state
  const [gmailModal, setGmailModal] = useState<{
    isOpen: boolean;
    to: string;
    subject: string;
    html: string;
    type: string;
    orderRef?: string;
  }>({
    isOpen: false,
    to: '',
    subject: '',
    html: '',
    type: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const [ordRes, anaRes, enqRes, libRes, audRes, setRes, teamRes] = await Promise.all([
        api.getOrders(),
        api.getAnalytics(),
        api.getEnquiries(),
        api.getSongLibrary(),
        api.getAuditLogs(),
        api.getSettings(),
        api.getTeamMembers().catch(() => ({ members: [] })),
      ]);

      setOrders(ordRes.orders);
      setAnalytics(anaRes);
      setEnquiries(enqRes.enquiries);
      setSongLibrary(libRes.songs);
      setAuditLogs(audRes.auditLogs);
      setSettings(setRes.settings);
      setTeamMembers(teamRes.members || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load admin records.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail || !newMemberName) {
      setErrorMsg('Name and email are required to add a team member.');
      return;
    }

    setIsAddingMember(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.addTeamMember({
        name: newMemberName.trim(),
        email: newMemberEmail.trim(),
        role: newMemberRole,
        phone: newMemberPhone.trim() || undefined,
        password: newMemberPassword.trim() || undefined,
      });

      setSuccessMsg(res.message);
      setNewMemberEmail('');
      setNewMemberName('');
      setNewMemberPhone('');
      setNewMemberPassword('');

      // Refresh team members list
      const updated = await api.getTeamMembers();
      setTeamMembers(updated.members);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add team member.');
    } finally {
      setIsAddingMember(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When order is selected, load its lyrics, files, and messages
  const openOrder = async (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.getOrderById(order.id);
      setOrderDetails({
        lyrics: res.lyrics,
        files: res.files,
        messages: res.messages,
      });
      if (res.lyrics.length > 0) {
        const latest = res.lyrics[res.lyrics.length - 1];
        setLyricTitle(latest.title);
        setLyricContent(latest.content);
        setLyricNotes(latest.notes || '');
      } else {
        setLyricTitle(`Personal Song for ${order.recipientName}`);
        setLyricContent(`[Verse 1]\n[Chorus]\n[Verse 2]\n[Bridge]\n[Chorus]\n[Outro]`);
        setLyricNotes('');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Change order status with backend rule enforcement
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await api.updateOrderStatus(selectedOrder.id, newStatus, statusNote);
      setSelectedOrder(res.order);
      setSuccessMsg(`Order status updated to "${newStatus}"!`);
      setStatusNote('');
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Create lyric draft
  const handleSaveLyricDraft = async () => {
    if (!selectedOrder || !lyricTitle.trim() || !lyricContent.trim()) {
      setErrorMsg('Lyric title and content are required.');
      return;
    }
    setIsSavingLyric(true);
    setErrorMsg(null);
    try {
      const res = await api.createLyricDraft(selectedOrder.id, {
        title: lyricTitle,
        content: lyricContent,
        notes: lyricNotes,
      });
      setSuccessMsg(`Lyric draft Version ${res.lyric.versionNumber} saved.`);
      const updated = await api.getOrderById(selectedOrder.id);
      setOrderDetails((prev) => (prev ? { ...prev, lyrics: updated.lyrics } : null));
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSavingLyric(false);
    }
  };

  // Share lyrics with customer
  const handleShareLyrics = async (versionId: string) => {
    if (!selectedOrder) return;
    setErrorMsg(null);
    try {
      const res = await api.shareLyrics(selectedOrder.id, versionId);
      setSelectedOrder(res.order);
      setSuccessMsg('Lyrics shared with customer! Order moved to "Awaiting Customer Lyric Approval".');
      const updated = await api.getOrderById(selectedOrder.id);
      setOrderDetails((prev) => (prev ? { ...prev, lyrics: updated.lyrics } : null));
      loadData();

      // Offer to dispatch email notification via Gmail
      const html = createLyricsReadyHtml(selectedOrder.reference, selectedOrder.recipientName, res.lyric.versionNumber);
      setGmailModal({
        isOpen: true,
        to: selectedOrder.customerEmail,
        subject: `M4UM Lyrics Ready for Your Approval – ${selectedOrder.reference}`,
        html,
        type: 'LYRIC_READY',
        orderRef: selectedOrder.reference,
      });
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Add internal note or customer visible message
  const handlePostMessage = async () => {
    if (!selectedOrder || !messageText.trim()) return;
    setErrorMsg(null);
    try {
      const res = await api.postMessage(selectedOrder.id, messageText, isInternalMessage);
      setOrderDetails((prev) => (prev ? { ...prev, messages: [...prev.messages, res.message] } : null));
      setMessageText('');
      setSuccessMsg(isInternalMessage ? 'Internal producer note added.' : 'Customer visible message posted.');
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Upload file deliverable
  const handleUploadFile = async () => {
    if (!selectedOrder || !uploadFileName.trim()) {
      setErrorMsg('Please provide a file name.');
      return;
    }
    setErrorMsg(null);
    try {
      const res = await api.uploadOrderFile(selectedOrder.id, {
        fileName: uploadFileName,
        fileType: uploadFileType,
        fileUrl: uploadFileUrl || `/api/files/download/${Date.now()}`,
        isCustomerVisible: uploadCustomerVisible,
        fileSize: uploadFileType === 'mp3' ? 4500000 : 1200000,
        version: '1.0',
      });
      setOrderDetails((prev) => (prev ? { ...prev, files: [...prev.files, res.file] } : null));
      setUploadFileName('');
      setUploadFileUrl('');
      setSuccessMsg(`File "${res.file.fileName}" attached.`);

      // If deliverable made ready, prompt for delivery email
      if (uploadCustomerVisible && ['Ready for Delivery', 'Delivered'].includes(selectedOrder.status)) {
        const html = createSongDeliveredHtml(selectedOrder.reference, selectedOrder.recipientName, selectedOrder.recipientName);
        setGmailModal({
          isOpen: true,
          to: selectedOrder.customerEmail,
          subject: `Your Finished Song is Ready! – ${selectedOrder.reference}`,
          html,
          type: 'SONG_DELIVERED',
          orderRef: selectedOrder.reference,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Execute Gmail Send
  const executeGmailSend = async () => {
    try {
      if (!isGmailConnected) {
        await connectGmail();
      }
      await sendGmailEmail({
        to: gmailModal.to,
        subject: gmailModal.subject,
        htmlBody: gmailModal.html,
        type: gmailModal.type,
        orderReference: gmailModal.orderRef,
      });
      setSuccessMsg(`Official notification sent directly to ${gmailModal.to} via Gmail.`);
    } catch (err: any) {
      setErrorMsg(`Gmail dispatch notice: ${err.message}`);
    } finally {
      setGmailModal((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // Add Song to Showcase Library
  const handleAddSongLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSongTitle.trim() || !newSongAudio.trim()) {
      setErrorMsg('Song title and audio URL are required.');
      return;
    }
    setErrorMsg(null);
    try {
      const res = await api.addSongToLibrary({
        title: newSongTitle,
        genre: newSongGenre,
        mood: newSongMood,
        audioUrl: newSongAudio,
        sampleLyricsSnippet: newSongLyrics,
        isPublic: newSongPublic,
      });
      setSongLibrary((prev) => [res.song, ...prev]);
      setNewSongTitle('');
      setNewSongAudio('');
      setNewSongLyrics('');
      setSuccessMsg(`Showcase song "${res.song.title}" added to library.`);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.recipientName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    const matchesPackage = packageFilter === 'All' || o.packageId === packageFilter;
    return matchesSearch && matchesStatus && matchesPackage;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20">
      {/* Top Admin Sub-bar */}
      <div className="bg-[#1B0533] text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/60">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md bg-[#F51B91] text-white text-[11px] font-black uppercase tracking-widest">
            ADMIN
          </span>
          <h1 className="font-heading text-lg font-bold">M4UM Private Production Portal</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!isGmailConnected) connectGmail();
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              isGmailConnected
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600'
                : 'bg-purple-900/50 text-purple-200 border-purple-700 hover:bg-purple-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{isGmailConnected ? 'Gmail Dispatcher Active' : 'Enable Gmail Notifications'}</span>
          </button>

          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs flex items-center gap-1"
            title="Refresh database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        {/* Navigation Tabs (9 sections) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-bold text-slate-600 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: orders.length },
            { id: 'team', label: 'Team & Collaborators', icon: UserPlus, badge: teamMembers.length },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'library', label: 'Song Library', icon: Music2 },
            { id: 'enquiries', label: 'Enquiries', icon: Inbox, badge: enquiries.filter((e) => e.status === 'new').length },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'audit', label: 'Audit Log', icon: FileCheck2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedOrder(null);
                }}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-[#421078] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-[#F51B91] text-white' : 'bg-purple-100 text-[#421078]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="font-bold text-red-500">Dismiss</button>
          </div>
        )}

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="font-bold text-emerald-600">Dismiss</button>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ======================================================== */}
        {activeTab === 'overview' && analytics && (
          <div className="space-y-8">
            {/* Stat Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-semibold uppercase">Total Orders</span>
                <p className="font-heading text-3xl font-extrabold text-[#421078]">{analytics.metrics.totalOrders}</p>
                <span className="text-[11px] text-slate-400">All lifetime orders</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-semibold uppercase">New & In Review</span>
                <p className="font-heading text-3xl font-extrabold text-[#FF9B24]">
                  {analytics.metrics.newOrders + analytics.metrics.reviewingOrders}
                </p>
                <span className="text-[11px] text-amber-600">Requires production action</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-semibold uppercase">Awaiting Approval</span>
                <p className="font-heading text-3xl font-extrabold text-[#F51B91]">
                  {analytics.metrics.awaitingApproval}
                </p>
                <span className="text-[11px] text-pink-600">Lyrics with customer</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                <span className="text-xs text-slate-500 font-semibold uppercase">In Production</span>
                <p className="font-heading text-3xl font-extrabold text-[#08BFE8]">
                  {analytics.metrics.inProduction}
                </p>
                <span className="text-[11px] text-cyan-600">Audio mastering stage</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-1 col-span-2 sm:col-span-1">
                <span className="text-xs text-emerald-800 font-bold uppercase">Confirmed Revenue</span>
                <p className="font-heading text-3xl font-extrabold text-emerald-700">
                  ${analytics.metrics.confirmedRevenue.toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-500">Verified Paid NZD</span>
              </div>
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-heading font-bold text-base text-[#421078]">Recent Orders In Pipeline</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-bold text-[#F51B91] hover:underline"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {orders.slice(0, 5).map((o) => (
                    <div
                      key={o.id}
                      onClick={() => {
                        setActiveTab('orders');
                        openOrder(o);
                      }}
                      className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#421078]">{o.reference}</span>
                          <span className="text-xs font-semibold text-slate-900">{o.recipientName}</span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {o.packageName} · {o.customerName} ({o.customerEmail})
                        </span>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#421078] border border-purple-200">
                          {o.status}
                        </span>
                        <p className="text-[11px] font-bold text-slate-700">${o.price.toFixed(2)} NZD</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Audit Actions */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h3 className="font-heading font-bold text-base text-[#421078]">Audit Activity Log</h3>
                <div className="space-y-3 text-xs">
                  {auditLogs.slice(0, 5).map((a) => (
                    <div key={a.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-bold text-slate-700">{a.action}</span>
                        <span>{new Date(a.createdAt).toLocaleDateString('en-NZ')}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{a.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ORDERS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {!selectedOrder ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
                {/* Search & Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search reference, customer name, recipient..."
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#421078]"
                    />
                  </div>

                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                    >
                      <option value="All">All Statuses</option>
                      <option value="New Order">New Order</option>
                      <option value="Reviewing Order">Reviewing Order</option>
                      <option value="Writing Lyrics">Writing Lyrics</option>
                      <option value="Awaiting Customer Lyric Approval">Awaiting Lyric Approval</option>
                      <option value="Lyrics Approved">Lyrics Approved</option>
                      <option value="Song in Production">Song in Production</option>
                      <option value="Quality Check">Quality Check</option>
                      <option value="Ready for Delivery">Ready for Delivery</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={packageFilter}
                      onChange={(e) => setPackageFilter(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs bg-white"
                    >
                      <option value="All">All Packages</option>
                      <option value="personal">The Personal Song ($34.99)</option>
                      <option value="signature">The Signature Song ($54.99)</option>
                      <option value="ultimate">The Ultimate Gift ($85.00)</option>
                    </select>
                  </div>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Recipient</th>
                        <th className="py-3 px-4">Package</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            No orders matching current search or filters.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-purple-50/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-[#421078]">{o.reference}</td>
                            <td className="py-3 px-4">
                              <p className="font-semibold text-slate-900">{o.customerName}</p>
                              <span className="text-[10px] text-slate-400">{o.customerEmail}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-semibold">{o.recipientName}</span>
                              <span className="text-[10px] text-slate-500 block">{o.occasion}</span>
                            </td>
                            <td className="py-3 px-4">{o.packageName}</td>
                            <td className="py-3 px-4 font-bold text-slate-900">${o.price.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  o.paymentStatus === 'Paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {o.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#421078] border border-purple-200">
                                {o.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => openOrder(o)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#421078] hover:bg-purple-900 transition-colors"
                              >
                                Manage Order
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* ORDER DETAIL & PRODUCTION WORKFLOW */
              <div className="space-y-6">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-xs font-bold text-[#421078] hover:underline flex items-center gap-1"
                >
                  ← Back to Orders List
                </button>

                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
                  {/* Summary bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-heading text-2xl font-bold text-[#421078]">{selectedOrder.reference}</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-[#421078]">
                          {selectedOrder.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Customer: <strong>{selectedOrder.customerName}</strong> ({selectedOrder.customerEmail}) · Recipient: <strong>{selectedOrder.recipientName}</strong>
                      </p>
                    </div>

                    {/* Status updater */}
                    <div className="flex items-center gap-2">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                        className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                      >
                        <option value="New Order">New Order</option>
                        <option value="Reviewing Order">Reviewing Order</option>
                        <option value="Writing Lyrics">Writing Lyrics</option>
                        <option value="Awaiting Customer Lyric Approval">Awaiting Lyric Approval</option>
                        <option value="Lyrics Approved">Lyrics Approved</option>
                        <option value="Song in Production">Song in Production</option>
                        <option value="Quality Check">Quality Check</option>
                        <option value="Ready for Delivery">Ready for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Completed">Completed</option>
                        <option value="On Hold">On Hold</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={handleUpdateStatus}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#421078] hover:bg-purple-900 transition-colors shadow-xs"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>

                  {/* Creative Submission Brief */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200 text-xs">
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-[#421078]">Story & Recipient Details</h4>
                      <p><strong>Occasion:</strong> {selectedOrder.occasion}</p>
                      <p><strong>Relationship:</strong> {selectedOrder.relationship}</p>
                      {selectedOrder.nickname && <p><strong>Nickname:</strong> {selectedOrder.nickname}</p>}
                      <p><strong>Personality:</strong> {selectedOrder.personality}</p>
                      <p><strong>Interests:</strong> {selectedOrder.interests}</p>
                      <p><strong>Memories:</strong> {selectedOrder.memories}</p>
                      {selectedOrder.funnyStories && <p><strong>Funny Stories:</strong> {selectedOrder.funnyStories}</p>}
                      {selectedOrder.insideJokes && <p><strong>Inside Jokes:</strong> {selectedOrder.insideJokes}</p>}
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-bold text-sm text-[#421078]">Musical Specifications</h4>
                      <p><strong>Genre:</strong> {selectedOrder.genre}</p>
                      <p><strong>Mood:</strong> {selectedOrder.mood}</p>
                      <p><strong>Vocal Preference:</strong> {selectedOrder.vocalPreference}</p>
                      <p><strong>Energy:</strong> {selectedOrder.energy}</p>
                      <p><strong>Length:</strong> {selectedOrder.length}</p>
                      <p><strong>Creative Direction:</strong> {selectedOrder.creativeDirection}</p>
                      {selectedOrder.includedDetails && <p className="text-emerald-800"><strong>Must Include:</strong> {selectedOrder.includedDetails}</p>}
                      {selectedOrder.excludedDetails && <p className="text-red-800"><strong>Avoid:</strong> {selectedOrder.excludedDetails}</p>}
                      {selectedOrder.photos.length > 0 && <p className="font-bold text-amber-800">Photos Uploaded: {selectedOrder.photos.length} photos</p>}
                    </div>
                  </div>

                  {/* Production Sections: Lyrics & Files */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LYRIC DRAFTING & REVISION SYSTEM */}
                    <div className="space-y-4 p-6 rounded-2xl bg-purple-50/40 border border-purple-100">
                      <div className="flex items-center justify-between border-b border-purple-200/60 pb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-[#F51B91]" />
                          <h3 className="font-bold text-sm text-slate-900">Lyric Studio & Versions</h3>
                        </div>
                        <span className="text-[11px] font-bold text-purple-700">
                          {orderDetails?.lyrics.length || 0} version(s)
                        </span>
                      </div>

                      {/* Existing versions list */}
                      {orderDetails?.lyrics.map((l) => (
                        <div key={l.id} className="p-3 bg-white rounded-xl border border-purple-100 text-xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              Version {l.versionNumber}: {l.title}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                              {l.status}
                            </span>
                          </div>
                          {l.status === 'draft' && (
                            <button
                              onClick={() => handleShareLyrics(l.id)}
                              className="px-3 py-1 rounded-full text-[11px] font-bold text-white bg-[#F51B91] hover:bg-pink-700 transition-colors"
                            >
                              Share with Customer for Approval
                            </button>
                          )}
                        </div>
                      ))}

                      {/* Lyric Drafting Editor */}
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold text-slate-800 block">Draft / New Version</label>
                        <input
                          type="text"
                          value={lyricTitle}
                          onChange={(e) => setLyricTitle(e.target.value)}
                          placeholder="Song Title"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                        <textarea
                          rows={8}
                          value={lyricContent}
                          onChange={(e) => setLyricContent(e.target.value)}
                          placeholder="[Verse 1]...\n[Chorus]..."
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono leading-relaxed"
                        />
                        <input
                          type="text"
                          value={lyricNotes}
                          onChange={(e) => setLyricNotes(e.target.value)}
                          placeholder="Producer notes on this draft version"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                        <button
                          onClick={handleSaveLyricDraft}
                          disabled={isSavingLyric}
                          className="w-full py-2.5 rounded-full text-xs font-bold text-white bg-[#421078] hover:bg-purple-900 transition-colors"
                        >
                          {isSavingLyric ? 'Saving Draft...' : 'Save As New Lyric Version'}
                        </button>
                      </div>
                    </div>

                    {/* FILE MANAGEMENT & DELIVERABLES */}
                    <div className="space-y-4 p-6 rounded-2xl bg-white border border-slate-200">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Upload className="w-5 h-5 text-[#08BFE8]" />
                          <h3 className="font-bold text-sm text-slate-900">Deliverables & Audio Files</h3>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">
                          {orderDetails?.files.length || 0} file(s)
                        </span>
                      </div>

                      {/* Uploaded files list */}
                      <div className="space-y-2">
                        {orderDetails?.files.map((f) => (
                          <div key={f.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
                            <div>
                              <p className="font-bold text-slate-800">{f.fileName}</p>
                              <span className="text-[10px] text-slate-400 uppercase">
                                {f.fileType} · {f.isCustomerVisible ? 'Customer Visible' : 'Internal Only'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">{f.version}</span>
                          </div>
                        ))}
                      </div>

                      {/* Upload Deliverable form */}
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-800 block">Attach / Upload Deliverable</label>
                        <input
                          type="text"
                          value={uploadFileName}
                          onChange={(e) => setUploadFileName(e.target.value)}
                          placeholder="File Name (e.g. Ten_Years_Master.mp3)"
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={uploadFileType}
                            onChange={(e) => setUploadFileType(e.target.value as any)}
                            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white"
                          >
                            <option value="mp3">Master MP3</option>
                            <option value="wav">WAV Audio</option>
                            <option value="lyrics_pdf">Lyrics PDF</option>
                            <option value="printable_sheet">Printable Sheet</option>
                            <option value="cover_art">Cover Artwork</option>
                            <option value="lyric_video">Photo Lyric Video</option>
                            <option value="gift_card">Digital Gift Card</option>
                          </select>

                          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-2">
                            <input
                              type="checkbox"
                              checked={uploadCustomerVisible}
                              onChange={(e) => setUploadCustomerVisible(e.target.checked)}
                              className="rounded border-slate-300 text-[#421078]"
                            />
                            <span>Customer Visible</span>
                          </label>
                        </div>

                        <button
                          onClick={handleUploadFile}
                          className="w-full py-2.5 rounded-full text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                        >
                          Attach Deliverable File
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Messages */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <h4 className="font-bold text-sm text-slate-900">Communication & Internal Notes</h4>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="msgType"
                          checked={isInternalMessage}
                          onChange={() => setIsInternalMessage(true)}
                        />
                        <span className="text-amber-800">Internal Producer Note (Hidden from Customer)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="msgType"
                          checked={!isInternalMessage}
                          onChange={() => setIsInternalMessage(false)}
                        />
                        <span className="text-purple-800">Customer Visible Update</span>
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder={isInternalMessage ? 'Write private internal note...' : 'Write message to customer...'}
                        className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-xs"
                      />
                      <button
                        onClick={handlePostMessage}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#421078]"
                      >
                        Post Note
                      </button>
                    </div>

                    <div className="space-y-2 pt-2">
                      {orderDetails?.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`p-3 rounded-xl border text-xs space-y-1 ${
                            m.isInternal
                              ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                              : 'bg-purple-50/50 border-purple-100 text-purple-950'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span className="font-bold">
                              {m.senderName} ({m.isInternal ? 'INTERNAL NOTE' : 'CUSTOMER VISIBLE'})
                            </span>
                            <span>{new Date(m.createdAt).toLocaleDateString('en-NZ')}</span>
                          </div>
                          <p>{m.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB: TEAM & COLLABORATORS (Add others into the work) */}
        {/* ======================================================== */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            {/* Add Team Member Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 rounded-2xl bg-purple-50 text-[#421078]">
                  <UserPlus className="w-6 h-6 text-[#F51B91]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl text-[#421078]">Add Team Collaborators</h3>
                  <p className="text-xs text-slate-500">
                    Invite producers, audio engineers, lyricists, or administrators to access and collaborate on Made For You Music orders.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddTeamMember} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    placeholder="e.g. Liam Walker"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    placeholder="colleague@tekura.org.nz"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mobile Phone</label>
                  <input
                    type="tel"
                    value={newMemberPhone}
                    onChange={(e) => setNewMemberPhone(e.target.value)}
                    placeholder="021 000 0000"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Role & Access</label>
                  <select
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value as 'admin' | 'customer')}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#421078]"
                  >
                    <option value="admin">Producer / Admin (Full Access)</option>
                    <option value="customer">Staff Collaborator (Customer View)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-3 space-y-1">
                  <label className="font-bold text-slate-700">Initial Password (Optional — defaults to M4UMProducer2026!)</label>
                  <input
                    type="text"
                    value={newMemberPassword}
                    onChange={(e) => setNewMemberPassword(e.target.value)}
                    placeholder="Leave blank to use default (M4UMProducer2026!)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#421078]"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-1 flex items-end">
                  <button
                    type="submit"
                    disabled={isAddingMember}
                    className="w-full py-2.5 rounded-xl bg-[#421078] hover:bg-purple-900 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{isAddingMember ? 'Adding...' : 'Add Collaborator'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Existing Collaborators List */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-lg text-[#421078]">Current Team Members & Authorized Users</h4>
                <span className="text-xs text-slate-500 font-semibold">{teamMembers.length} Accounts Registered</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamMembers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No team members registered.
                        </td>
                      </tr>
                    ) : (
                      teamMembers.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/60">
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                            {m.role === 'admin' && <Shield className="w-3.5 h-3.5 text-[#F51B91]" />}
                            <span>{m.name}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#421078] font-semibold">{m.email}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                m.role === 'admin'
                                  ? 'bg-purple-100 text-[#421078]'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {m.role === 'admin' ? 'Producer / Admin' : 'Customer / Client'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{m.phone || '—'}</td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {new Date(m.createdAt).toLocaleDateString('en-NZ')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: CUSTOMERS */}
        {/* ======================================================== */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#421078]">Registered Customers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 uppercase text-[10px] font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Orders Placed</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 px-4 font-bold text-slate-900">{o.customerName}</td>
                      <td className="py-3 px-4">{o.customerEmail}</td>
                      <td className="py-3 px-4">{o.customerPhone || 'N/A'}</td>
                      <td className="py-3 px-4 font-bold text-[#421078]">{o.reference}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString('en-NZ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SONG LIBRARY */}
        {/* ======================================================== */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            {/* Add song form */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-heading font-bold text-lg text-[#421078]">Add Showcase Song to Library</h3>
              <form onSubmit={handleAddSongLibrary} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Song Title</label>
                  <input
                    type="text"
                    value={newSongTitle}
                    onChange={(e) => setNewSongTitle(e.target.value)}
                    placeholder="e.g. Forever In The Bay"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Genre</label>
                  <input
                    type="text"
                    value={newSongGenre}
                    onChange={(e) => setNewSongGenre(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mood</label>
                  <input
                    type="text"
                    value={newSongMood}
                    onChange={(e) => setNewSongMood(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Audio MP3 URL</label>
                  <input
                    type="url"
                    value={newSongAudio}
                    onChange={(e) => setNewSongAudio(e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sample Lyrics Snippet</label>
                  <input
                    type="text"
                    value={newSongLyrics}
                    onChange={(e) => setNewSongLyrics(e.target.value)}
                    placeholder="Opening line..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div className="sm:col-span-3 flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={newSongPublic}
                      onChange={(e) => setNewSongPublic(e.target.checked)}
                      className="rounded border-slate-300 text-[#421078]"
                    />
                    <span>Approved for Public Listening on website</span>
                  </label>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full text-white text-xs font-bold bg-[#421078] hover:bg-purple-900"
                  >
                    Add Song to Showcase
                  </button>
                </div>
              </form>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {songLibrary.map((song) => (
                <div key={song.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#421078]">{song.genre}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      song.isPublic ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {song.isPublic ? 'Public Showcase' : 'Private'}
                    </span>
                  </div>
                  <h4 className="font-heading font-bold text-base text-slate-900">{song.title}</h4>
                  <p className="text-xs text-slate-500 italic">"{song.sampleLyricsSnippet}"</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={async () => {
                        await api.updateSongLibraryItem(song.id, { isPublic: !song.isPublic });
                        loadData();
                      }}
                      className="text-xs font-bold text-[#421078] hover:underline"
                    >
                      {song.isPublic ? 'Set to Private' : 'Make Public'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: ENQUIRIES */}
        {/* ======================================================== */}
        {activeTab === 'enquiries' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#421078]">Customer Enquiries</h3>
            <div className="space-y-4">
              {enquiries.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No enquiries yet.</p>
              ) : (
                enquiries.map((enq) => (
                  <div key={enq.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{enq.subject}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-[#421078] uppercase">
                        {enq.status}
                      </span>
                    </div>
                    <p className="text-slate-600">From: <strong>{enq.name}</strong> ({enq.email})</p>
                    <p className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200">{enq.message}</p>
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={async () => {
                          await api.updateEnquiry(enq.id, { status: 'resolved' });
                          loadData();
                        }}
                        className="text-xs font-bold text-emerald-700 hover:underline"
                      >
                        Mark as Resolved
                      </button>
                      <button
                        onClick={() => {
                          setGmailModal({
                            isOpen: true,
                            to: enq.email,
                            subject: `Re: ${enq.subject} – Made For You Music`,
                            html: `<p>Kia ora ${enq.name},<br/><br/>Thank you for contacting Made For You Music! In response to your message regarding "${enq.subject}":<br/><br/>Ngā mihi,<br/>The M4UM Songwriting Team</p>`,
                            type: 'ENQUIRY_REPLY',
                          });
                        }}
                        className="text-xs font-bold text-[#421078] hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Reply via Gmail
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: ANALYTICS */}
        {/* ======================================================== */}
        {activeTab === 'analytics' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-[#421078]">Orders by Package</h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(analytics.byPackage).map(([pkg, count]) => (
                    <div key={pkg} className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span>{pkg}</span>
                      <span className="font-bold text-[#421078]">{String(count)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-[#421078]">Orders by Occasion</h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(analytics.byOccasion).map(([occ, count]) => (
                    <div key={occ} className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span>{occ}</span>
                      <span className="font-bold text-[#F51B91]">{String(count)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="font-bold text-sm text-[#421078]">Orders by Genre</h4>
                <div className="space-y-2 text-xs">
                  {Object.entries(analytics.byGenre).map(([genre, count]) => (
                    <div key={genre} className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span>{genre}</span>
                      <span className="font-bold text-[#08BFE8]">{String(count)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: SETTINGS */}
        {/* ======================================================== */}
        {activeTab === 'settings' && settings && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs max-w-2xl space-y-6">
            <h3 className="font-heading font-bold text-lg text-[#421078]">Business & Production Settings</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Business Name</label>
                <input
                  type="text"
                  value={settings.businessName}
                  onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Email</label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Location Origin</label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <button
                onClick={async () => {
                  await api.updateSettings(settings);
                  setSuccessMsg('Business settings updated.');
                }}
                className="px-6 py-2.5 rounded-full text-white text-xs font-bold bg-[#421078] hover:bg-purple-900"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: AUDIT LOG */}
        {/* ======================================================== */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#421078]">System & Production Audit Trail</h3>
            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{log.action}</p>
                    <p className="text-slate-600">{log.details}</p>
                    <span className="text-[10px] text-slate-400">By {log.adminName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(log.createdAt).toLocaleDateString('en-NZ', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Gmail Confirmation Modal (Mandatory User Confirmation for Destructive/Sending Workspace Actions) */}
      {gmailModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-purple-100">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#421078]" />
              <h3 className="font-bold text-lg text-slate-900">Send Customer Notification via Gmail?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This action will send an email from your authorized Gmail account to:
            </p>
            <div className="p-3 bg-purple-50 rounded-xl text-xs space-y-1">
              <p><strong>To:</strong> {gmailModal.to}</p>
              <p><strong>Subject:</strong> {gmailModal.subject}</p>
              <p><strong>Type:</strong> {gmailModal.type}</p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setGmailModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={executeGmailSend}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#421078] hover:bg-purple-900 shadow-sm"
              >
                Confirm & Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
