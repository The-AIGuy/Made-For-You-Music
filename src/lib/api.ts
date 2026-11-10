/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  User,
  PackageInfo,
  Order,
  LyricVersion,
  RevisionRequest,
  StatusHistory,
  OrderFile,
  OrderMessage,
  Notification,
  Enquiry,
  AuditLogEntry,
  SongLibraryItem,
  BusinessSettings,
  OrderStatus,
} from '../types.js';

const TOKEN_KEY = 'm4um_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! Status: ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { name: string; email: string; password: string; phone?: string }) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  googleAuth: (payload: { idToken: string }) =>
    request<{ token: string; user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () =>
    request<{ message: string }>('/auth/logout', {
      method: 'POST',
    }),

  getMe: () => request<{ user: User }>('/auth/me'),

  updateProfile: (payload: { name?: string; email?: string; phone?: string }) =>
    request<{ user: User }>('/auth/update-profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resetPasswordRequest: (email: string) =>
    request<{ message: string }>('/auth/reset-password-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload: { email: string; token: string; newPassword: string }) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  setupAdmin: (payload: { setupKey: string; name: string; email: string; password: string }) =>
    request<{ message: string; token: string; user: User }>('/auth/setup-admin', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Packages
  getPackages: () => request<{ packages: PackageInfo[] }>('/packages'),
  updatePackage: (id: string, payload: Partial<PackageInfo>) =>
    request<{ package: PackageInfo }>(`/packages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Orders
  createOrder: (payload: Partial<Order>) =>
    request<{ order: Order; message: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getOrders: (params?: { search?: string; status?: string; packageId?: string; sortBy?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.packageId) query.set('packageId', params.packageId);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    const qs = query.toString();
    return request<{ orders: Order[] }>(`/orders${qs ? `?${qs}` : ''}`);
  },

  getOrderById: (id: string) =>
    request<{
      order: Order;
      history: StatusHistory[];
      messages: OrderMessage[];
      lyrics: LyricVersion[];
      revisions: RevisionRequest[];
      files: OrderFile[];
    }>(`/orders/${id}`),

  updateOrder: (id: string, payload: Partial<Order>) =>
    request<{ order: Order }>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  updateOrderStatus: (id: string, status: OrderStatus, note?: string) =>
    request<{ order: Order; historyEntry: StatusHistory }>(`/orders/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status, note }),
    }),

  trackOrder: (reference: string, email: string) =>
    request<{
      order: Partial<Order>;
      history: StatusHistory[];
      publicUpdates: OrderMessage[];
    }>('/orders/track', {
      method: 'POST',
      body: JSON.stringify({ reference, email }),
    }),

  // Lyrics
  createLyricDraft: (orderId: string, payload: { title: string; content: string; notes?: string }) =>
    request<{ lyric: LyricVersion }>(`/orders/${orderId}/lyrics`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  shareLyrics: (orderId: string, versionId: string) =>
    request<{ lyric: LyricVersion; order: Order }>(`/orders/${orderId}/lyrics/${versionId}/share`, {
      method: 'POST',
    }),

  approveLyrics: (orderId: string, versionId: string) =>
    request<{ lyric: LyricVersion; order: Order; message: string }>(`/orders/${orderId}/lyrics/${versionId}/approve`, {
      method: 'POST',
    }),

  requestLyricRevision: (orderId: string, versionId: string, feedback: string) =>
    request<{ revision: RevisionRequest; order: Order; remainingRevisions: number; message: string }>(
      `/orders/${orderId}/lyrics/${versionId}/revision`,
      {
        method: 'POST',
        body: JSON.stringify({ feedback }),
      }
    ),

  // Files
  uploadOrderFile: (orderId: string, fileData: Partial<OrderFile>) =>
    request<{ file: OrderFile }>(`/orders/${orderId}/files`, {
      method: 'POST',
      body: JSON.stringify(fileData),
    }),

  // Messages
  postMessage: (orderId: string, message: string, isInternal: boolean = false) =>
    request<{ message: OrderMessage }>(`/orders/${orderId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message, isInternal }),
    }),

  // Song Library
  getSongLibrary: () => request<{ songs: SongLibraryItem[] }>('/song-library'),
  addSongToLibrary: (payload: Partial<SongLibraryItem>) =>
    request<{ song: SongLibraryItem }>('/song-library', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateSongLibraryItem: (id: string, payload: Partial<SongLibraryItem>) =>
    request<{ song: SongLibraryItem }>(`/song-library/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Enquiries
  submitEnquiry: (payload: { name: string; email: string; subject: string; message: string }) =>
    request<{ message: string; enquiry: Enquiry }>('/enquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getEnquiries: () => request<{ enquiries: Enquiry[] }>('/enquiries'),
  updateEnquiry: (id: string, payload: Partial<Enquiry>) =>
    request<{ enquiry: Enquiry }>(`/enquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Analytics
  getAnalytics: () =>
    request<{
      metrics: {
        totalOrders: number;
        newOrders: number;
        reviewingOrders: number;
        awaitingApproval: number;
        inProduction: number;
        readyForDelivery: number;
        completedOrders: number;
        cancelledOrders: number;
        confirmedRevenue: number;
        totalPotentialOrderValue: number;
        averageOrderValue: number;
      };
      byPackage: Record<string, number>;
      byOccasion: Record<string, number>;
      byGenre: Record<string, number>;
      recentAudit: AuditLogEntry[];
    }>('/analytics'),

  // Notifications
  getNotifications: () => request<{ notifications: Notification[] }>('/notifications'),
  markNotificationRead: (id: string) =>
    request<{ notification: Notification }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  markAllNotificationsRead: () =>
    request<{ message: string }>('/notifications/mark-all-read', {
      method: 'POST',
    }),

  // Settings
  getSettings: () => request<{ settings: BusinessSettings }>('/settings'),
  updateSettings: (payload: Partial<BusinessSettings>) =>
    request<{ settings: BusinessSettings }>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Audit Logs
  getAuditLogs: () => request<{ auditLogs: AuditLogEntry[] }>('/audit-logs'),

  // Gmail log
  logGmailDispatch: (payload: { toEmail: string; subject: string; type: string; orderReference?: string }) =>
    request<{ success: boolean; message: string }>('/gmail/log-dispatch', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Team Collaboration
  getTeamMembers: () => request<{ members: User[] }>('/team-members'),
  addTeamMember: (payload: { name: string; email: string; role?: 'admin' | 'customer'; password?: string; phone?: string }) =>
    request<{ message: string; member: User; defaultPasswordNotice?: string }>('/team-members', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
