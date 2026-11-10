/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export type OrderPackageId = 'personal' | 'signature' | 'ultimate';

export interface PackageInfo {
  id: OrderPackageId;
  name: string;
  price: number; // NZD
  description: string;
  inclusions: string[];
  maxRevisions: number;
  isPopular?: boolean;
  active: boolean;
}

export type OrderStatus =
  | 'New Order'
  | 'Reviewing Order'
  | 'Writing Lyrics'
  | 'Awaiting Customer Lyric Approval'
  | 'Lyrics Approved'
  | 'Song in Production'
  | 'Quality Check'
  | 'Ready for Delivery'
  | 'Delivered'
  | 'Completed'
  | 'On Hold'
  | 'Cancelled';

export type PaymentStatus =
  | 'Not Recorded'
  | 'Pending'
  | 'Paid'
  | 'Failed'
  | 'Refunded'
  | 'Partially Refunded';

export interface Order {
  id: string;
  reference: string; // e.g. M4UM-2026-8912
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  packageId: OrderPackageId;
  packageName: string;
  price: number; // NZD
  occasion: string;
  occasionCustom?: string;
  
  // Recipient details
  recipientName: string;
  relationship: string;
  nickname?: string;
  personality: string;
  interests: string;
  memories: string;
  funnyStories?: string;
  insideJokes?: string;
  specialPhrases?: string;
  includedDetails?: string;
  excludedDetails?: string;

  // Music preferences
  genre: string;
  genreCustom?: string;
  mood: string;
  vocalPreference: string;
  energy: string;
  length: string;

  // Creative direction
  creativeDirection: string;
  photos: string[]; // URLs or base64 data for Ultimate Gift

  // Workflow statuses
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  assignedCreator?: string;

  createdAt: string;
  updatedAt: string;
}

export interface LyricVersion {
  id: string;
  orderId: string;
  versionNumber: number;
  title: string;
  content: string;
  status: 'draft' | 'shared' | 'approved' | 'revision_requested';
  notes?: string;
  createdBy: string;
  createdAt: string;
  sharedAt?: string;
  approvedAt?: string;
}

export interface RevisionRequest {
  id: string;
  orderId: string;
  lyricVersionId: string;
  versionNumber: number;
  feedback: string;
  revisionNumber: number;
  createdAt: string;
}

export interface StatusHistory {
  id: string;
  orderId: string;
  previousStatus: OrderStatus | 'None';
  newStatus: OrderStatus;
  changedBy: string;
  note?: string;
  createdAt: string;
}

export type OrderFileType =
  | 'mp3'
  | 'wav'
  | 'lyrics_pdf'
  | 'printable_sheet'
  | 'cover_art'
  | 'lyric_video'
  | 'gift_card'
  | 'qr_code'
  | 'customer_photo';

export interface OrderFile {
  id: string;
  orderId: string;
  fileName: string;
  fileUrl: string;
  fileType: OrderFileType;
  fileSize: number;
  version: string;
  isCustomerVisible: boolean;
  uploadedBy: string;
  createdAt: string;
}

export interface OrderMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  isInternal: boolean; // internal admin notes vs customer visible updates
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'order' | 'lyric' | 'delivery' | 'enquiry' | 'system';
  title: string;
  message: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'in_progress' | 'resolved';
  internalNotes?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  details: string;
  affectedRecordId?: string;
  createdAt: string;
}

export interface SongLibraryItem {
  id: string;
  orderId?: string;
  title: string;
  recipientName?: string;
  occasion?: string;
  genre: string;
  mood: string;
  audioUrl: string;
  duration: string;
  coverUrl: string;
  sampleLyricsSnippet: string;
  isPublic: boolean;
  createdAt: string;
}

export interface BusinessSettings {
  businessName: string;
  brandShorthand: string;
  brandAttribution: string;
  contactEmail: string;
  phone?: string;
  location: string;
  copyright: string;
  turnaroundPersonal: string;
  turnaroundSignature: string;
  turnaroundUltimate: string;
  enableGmailNotifications: boolean;
}
